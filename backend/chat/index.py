"""
Чат между пользователями.
GET  /?action=users              — список всех пользователей
GET  /?action=history&with=<id>  — история сообщений с пользователем
GET  /?action=dialogs            — список диалогов (последнее сообщение с каждым)
POST /?action=send               — отправить сообщение {receiver_id, text}
POST /?action=read&with=<id>     — пометить сообщения прочитанными

Авторизация: заголовок X-User-Id (id пользователя)
"""
import json
import os
import psycopg2

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

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")

    user_id = get_user_id(event)
    if not user_id:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    conn = get_conn()
    cur = conn.cursor()

    if action == "users":
        cur.execute(
            f"SELECT id, name, email, avatar, status FROM {SCHEMA}.users WHERE id != %s ORDER BY name",
            (user_id,)
        )
        rows = cur.fetchall()
        conn.close()
        users = [{"id": r[0], "name": r[1], "email": r[2], "avatar": r[3] or "", "status": r[4]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"users": users})}

    if action == "history":
        with_id = int(qs.get("with", 0))
        since = qs.get("since", "")

        query = f"""
            SELECT id, sender_id, receiver_id, text, created_at, is_read
            FROM {SCHEMA}.messages
            WHERE (sender_id = %s AND receiver_id = %s)
               OR (sender_id = %s AND receiver_id = %s)
        """
        params = [user_id, with_id, with_id, user_id]

        if since:
            query += " AND created_at > %s"
            params.append(since)

        query += " ORDER BY created_at ASC LIMIT 100"

        cur.execute(query, params)
        rows = cur.fetchall()

        cur.execute(
            f"UPDATE {SCHEMA}.messages SET is_read = TRUE WHERE receiver_id = %s AND sender_id = %s AND is_read = FALSE",
            (user_id, with_id)
        )
        conn.commit()
        conn.close()

        msgs = [{
            "id": r[0],
            "sender_id": r[1],
            "receiver_id": r[2],
            "text": r[3],
            "time": r[4].isoformat(),
            "is_read": r[5],
            "out": r[1] == user_id,
        } for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"messages": msgs})}

    if action == "dialogs":
        cur.execute(f"""
            SELECT DISTINCT ON (sub.partner_id)
                sub.partner_id,
                sub.text,
                sub.msg_time,
                sub.sender_id,
                u.name,
                u.avatar,
                u.status,
                (SELECT COUNT(*) FROM {SCHEMA}.messages m2
                 WHERE m2.receiver_id = %s AND m2.sender_id = sub.partner_id AND m2.is_read = FALSE) as unread
            FROM (
                SELECT
                    CASE WHEN sender_id = %s THEN receiver_id ELSE sender_id END as partner_id,
                    text, created_at as msg_time, sender_id
                FROM {SCHEMA}.messages
                WHERE sender_id = %s OR receiver_id = %s
            ) sub
            JOIN {SCHEMA}.users u ON u.id = sub.partner_id
            ORDER BY sub.partner_id, sub.msg_time DESC
        """, (user_id, user_id, user_id, user_id))
        rows = cur.fetchall()
        conn.close()

        dialogs = [{
            "partner_id": r[0],
            "last_text": r[1],
            "last_time": r[2].isoformat(),
            "last_sender_id": r[3],
            "partner_name": r[4],
            "partner_avatar": r[5] or "",
            "partner_status": r[6],
            "unread": r[7],
        } for r in rows]

        dialogs.sort(key=lambda d: d["last_time"], reverse=True)
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"dialogs": dialogs})}

    if method == "POST" and action == "send":
        body = json.loads(event.get("body") or "{}")
        receiver_id = int(body.get("receiver_id", 0))
        text = (body.get("text") or "").strip()

        if not receiver_id or not text:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "receiver_id и text обязательны"})}

        cur.execute(
            f"INSERT INTO {SCHEMA}.messages (sender_id, receiver_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (user_id, receiver_id, text)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "id": row[0],
            "sender_id": user_id,
            "receiver_id": receiver_id,
            "text": text,
            "time": row[1].isoformat(),
            "out": True,
        })}

    conn.close()
    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Неизвестное действие"})}