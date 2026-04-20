import hashlib
import hmac

from flask import Blueprint, current_app, request

from src.services.session_service import (
    cancel_session,
    create_session,
    reschedule_session,
)

webhooks_bp = Blueprint("webhooks", __name__)


def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@webhooks_bp.route("/calendly", methods=["POST"])
def calendly_webhook():
    secret = current_app.config.get("CALENDLY_WEBHOOK_SECRET", "")

    if secret:
        signature = request.headers.get("Calendly-Webhook-Signature", "")
        if not verify_signature(request.data, signature, secret):
            return {"error": "Invalid signature"}, 401

    data = request.get_json()
    event = data.get("event")
    payload = data.get("payload", {})

    if event == "invitee.created":
        if payload.get("invitee", {}).get("is_reschedule"):
            reschedule_session(payload)
        else:
            create_session(payload)
    elif event == "invitee.canceled":
        cancel_session(payload)

    return {"status": "ok"}, 200
