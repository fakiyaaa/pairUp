from flask import Blueprint, jsonify, redirect, request, g, current_app

from src.middleware.auth import require_auth
from src.services.cal_service import (
    exchange_code_for_tokens,
    get_cal_username,
    get_oauth_authorize_url,
    register_webhook,
    save_cal_connection,
)

cal_oauth_bp = Blueprint("cal_oauth", __name__)


@cal_oauth_bp.route("/connect", methods=["GET"])
@require_auth
def connect():
    return jsonify({"url": get_oauth_authorize_url()})


@cal_oauth_bp.route("/exchange", methods=["POST"])
@require_auth
def exchange():
    data = request.get_json() or {}
    code = (data.get("code") or "").strip()

    if not code:
        return jsonify({"error": "code is required"}), 400

    try:
        tokens = exchange_code_for_tokens(code)
    except Exception:
        return jsonify({"error": "Failed to exchange code — invalid or expired"}), 400

    access_token = tokens.get("accessToken") or tokens.get("access_token", "")
    refresh_token = tokens.get("refreshToken") or tokens.get("refresh_token", "")

    try:
        username = get_cal_username(access_token)
    except Exception:
        return jsonify({"error": "Could not fetch Cal.com username"}), 400

    cal_com_link = f"https://cal.com/{username}" if username else ""

    webhook_id = None
    try:
        webhook_id = register_webhook(access_token)
    except Exception as e:
        current_app.logger.warning(f"Webhook registration skipped: {e}")

    save_cal_connection(
        user_id=str(g.user.id),
        access_token=access_token,
        refresh_token=refresh_token,
        webhook_id=str(webhook_id) if webhook_id else "",
        cal_com_link=cal_com_link,
    )

    return jsonify({"cal_com_link": cal_com_link})
