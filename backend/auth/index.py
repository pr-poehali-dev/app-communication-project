"""
Авторизация пользователей: регистрация, вход.
POST /?action=register — регистрация
POST /?action=login    — вход
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = "t_p62885751_app_communication_pr"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token() -> str:
    return secrets.token_hex(32)

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")

    if method == "POST" and action == "register":
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""

        if not name or not email or len(password) < 6:
            return {
                "statusCode": 400,
                "headers": CORS,
                "body": json.dumps({"error": "Заполните все поля. Пароль минимум 6 символов."}),
            }

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
        if cur.fetchone():
            conn.close()
            return {
                "statusCode": 409,
                "headers": CORS,
                "body": json.dumps({"error": "Пользователь с таким email уже существует"}),
            }

        pw_hash = hash_password(password)
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id, name, email, avatar, status",
            (name, email, pw_hash),
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()

        token = make_token()
        user = {"id": row[0], "name": row[1], "email": row[2], "avatar": row[3] or "", "status": row[4]}
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"user": user, "token": token}),
        }

    if method == "POST" and action == "login":
        body = json.loads(event.get("body") or "{}")
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, name, email, avatar, status, password_hash FROM {SCHEMA}.users WHERE email = %s",
            (email,),
        )
        row = cur.fetchone()
        conn.close()

        if not row or row[5] != hash_password(password):
            return {
                "statusCode": 401,
                "headers": CORS,
                "body": json.dumps({"error": "Неверный email или пароль"}),
            }

        token = make_token()
        user = {"id": row[0], "name": row[1], "email": row[2], "avatar": row[3] or "", "status": row[4]}
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"user": user, "token": token}),
        }

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Неизвестное действие"})}
