import secrets
import requests
from urllib.parse import urlencode
from typing import Optional
from flask import current_app
from src.db import get_db
CAL_API_BASE = "https://api.cal.com/v2"
CAL_API_VERSION = "2024-06-14"


def _cal_headers(access_token: str) -> dict:
    return {
        "Authorization": f"Bearer {access_token}",
        "cal-api-version": CAL_API_VERSION,
    }


def get_oauth_authorize_url() -> str:
    client_id = current_app.config["CAL_CLIENT_ID"]
    redirect_uri = current_app.config["CAL_REDIRECT_URI"]
    params = urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "PROFILE_READ BOOKING_READ WEBHOOK_READ WEBHOOK_WRITE",
        "state": secrets.token_urlsafe(16),
        "prompt": "login",
    })
    return f"https://app.cal.com/auth/oauth2/authorize?{params}"


def exchange_code_for_tokens(code: str) -> dict:
    client_id = current_app.config["CAL_CLIENT_ID"]
    client_secret = current_app.config["CAL_CLIENT_SECRET"]
    redirect_uri = current_app.config["CAL_REDIRECT_URI"]
    resp = requests.post(
        "https://api.cal.com/v2/auth/oauth2/token",
        json={
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        },
    )
    resp.raise_for_status()
    return resp.json()


def get_cal_username(access_token: str) -> Optional[str]:
    resp = requests.get(f"{CAL_API_BASE}/me", headers=_cal_headers(access_token))
    resp.raise_for_status()
    return resp.json().get("data", {}).get("username")


def get_cal_booking_url(access_token: str, username: str) -> str:
    """Return the first event type booking URL, falling back to the profile URL."""
    try:
        resp = requests.get(f"{CAL_API_BASE}/event-types", headers=_cal_headers(access_token))
        resp.raise_for_status()
        data = resp.json().get("data", [])
        # data is either a list of event types or {"eventTypeGroups": [...]}
        if isinstance(data, list):
            event_types = data
        else:
            event_types = []
            for group in data.get("eventTypeGroups", []):
                event_types.extend(group.get("eventTypes", []))
        for et in event_types:
            slug = et.get("slug")
            if slug:
                return f"https://cal.com/{username}/{slug}"
    except Exception:
        pass
    return f"https://cal.com/{username}"


def register_webhook(access_token: str) -> Optional[str]:
    webhook_url = current_app.config["CAL_WEBHOOK_URL"]
    resp = requests.post(
        f"{CAL_API_BASE}/webhooks",
        headers=_cal_headers(access_token),
        json={
            "active": True,
            "subscriberUrl": webhook_url,
            "triggers": ["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"],
        },
    )
    resp.raise_for_status()
    return resp.json().get("data", {}).get("id")


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
