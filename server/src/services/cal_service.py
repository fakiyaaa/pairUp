import requests
from urllib.parse import urlencode
from flask import current_app
from src.db import get_db

CALENDLY_API_BASE = "https://api.calendly.com"


def _headers(access_token: str) -> dict:
    return {"Authorization": f"Bearer {access_token}"}


def get_oauth_authorize_url() -> str:
    client_id = current_app.config["CALENDLY_CLIENT_ID"]
    redirect_uri = current_app.config["CALENDLY_REDIRECT_URI"]
    params = urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
    })
    return f"https://auth.calendly.com/oauth/authorize?{params}"


def exchange_code_for_tokens(code: str) -> dict:
    client_id = current_app.config["CALENDLY_CLIENT_ID"]
    client_secret = current_app.config["CALENDLY_CLIENT_SECRET"]
    redirect_uri = current_app.config["CALENDLY_REDIRECT_URI"]
    resp = requests.post(
        "https://auth.calendly.com/oauth/token",
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        },
    )
    resp.raise_for_status()
    return resp.json()


def get_user_info(access_token: str) -> dict:
    resp = requests.get(f"{CALENDLY_API_BASE}/users/me", headers=_headers(access_token))
    resp.raise_for_status()
    return resp.json().get("resource", {})


def register_webhook(access_token: str, user_uri: str, organization_uri: str) -> str | None:
    webhook_url = current_app.config["CALENDLY_WEBHOOK_URL"]
    resp = requests.post(
        f"{CALENDLY_API_BASE}/webhook_subscriptions",
        headers=_headers(access_token),
        json={
            "url": webhook_url,
            "events": ["invitee.created", "invitee.canceled"],
            "organization": organization_uri,
            "user": user_uri,
            "scope": "user",
        },
    )
    resp.raise_for_status()
    return resp.json().get("resource", {}).get("uri")


def save_cal_connection(user_id: str, access_token: str, refresh_token: str, webhook_id: str, cal_com_link: str):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        """
        UPDATE users
        SET cal_access_token = %s,
            cal_refresh_token = %s,
            cal_webhook_id = %s,
            cal_com_link = %s
        WHERE id = %s
        """,
        (access_token, refresh_token, webhook_id, cal_com_link, user_id),
    )
    db.commit()
