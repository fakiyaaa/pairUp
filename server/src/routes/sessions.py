from flask import Blueprint, jsonify, g

from src.middleware.auth import require_auth
from src.services.session_service import get_upcoming_sessions

sessions_bp = Blueprint("sessions", __name__)


@sessions_bp.route("/", methods=["GET"])
@require_auth
def list_sessions():
    sessions = get_upcoming_sessions(g.user.id)
    return jsonify([dict(s) for s in sessions])
