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


@webhooks_bp.route("/cal", methods=["POST"])
def cal_webhook():
    secret = current_app.config.get("CAL_WEBHOOK_SECRET", "")

    if secret:
        signature = request.headers.get("X-Cal-Signature-256", "")
        if not verify_signature(request.data, signature, secret):
            return {"error": "Invalid signature"}, 401

    data = request.get_json()
    event = data.get("triggerEvent")
    payload = data.get("payload", {})

    if event == "BOOKING_CREATED":
        create_session(payload)
    elif event == "BOOKING_RESCHEDULED":
        reschedule_session(payload)
    elif event == "BOOKING_CANCELLED":
        cancel_session(payload)

    return {"status": "ok"}, 200
