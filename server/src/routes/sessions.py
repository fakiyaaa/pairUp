from flask import Blueprint, jsonify, g

from src.middleware.auth import require_auth
from src.services.session_service import (
    get_upcoming_sessions,
    get_completed_sessions,
    get_session_by_id,
)

sessions_bp = Blueprint("sessions", __name__)


@sessions_bp.route("/", methods=["GET"])
@require_auth
def list_upcoming():
    sessions = get_upcoming_sessions(g.user.id)
    return jsonify([dict(s) for s in sessions])


@sessions_bp.route("/completed", methods=["GET"])
@require_auth
def list_completed():
    sessions = get_completed_sessions(g.user.id)
    return jsonify([dict(s) for s in sessions])


@sessions_bp.route("/<session_id>", methods=["GET"])
@require_auth
def get_session(session_id):
    session = get_session_by_id(g.user.id, session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify(dict(session))
