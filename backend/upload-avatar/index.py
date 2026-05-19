"""
Загрузка и обновление аватара пользователя.
POST / — загрузить фото {image: base64, ext: "jpg"|"png"|"webp"}
GET  / — получить текущий аватар

Авторизация: X-User-Id
"""
import json
import os
import base64
import psycopg2
import boto3

SCHEMA = "t_p62885751_app_communication_pr"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_user_id(event):
    headers = event.get("headers") or {}
    uid = headers.get("X-User-Id") or headers.get("x-user-id") or ""
    try:
        return int(uid)
    except Exception:
        return None

def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    user_id = get_user_id(event)
    if not user_id:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT avatar FROM {SCHEMA}.users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        conn.close()
        avatar = row[0] if row and row[0] else ""
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"avatar": avatar})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        image_b64 = body.get("image", "")
        ext = body.get("ext", "jpg").lower().strip(".")

        if ext not in ("jpg", "jpeg", "png", "webp"):
            ext = "jpg"
        if not image_b64:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "image обязателен"})}

        content_types = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}
        content_type = content_types.get(ext, "image/jpeg")

        image_data = base64.b64decode(image_b64)

        key = f"avatars/{user_id}.{ext}"
        s3 = get_s3()
        s3.put_object(
            Bucket="files",
            Key=key,
            Body=image_data,
            ContentType=content_type,
        )

        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.users SET avatar = %s WHERE id = %s", (cdn_url, user_id))
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"avatar": cdn_url})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Метод не поддерживается"})}
