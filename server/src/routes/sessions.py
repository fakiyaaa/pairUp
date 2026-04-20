from flask import Blueprint, jsonify, request, g

from src.middleware.auth import require_auth
from src.services.session_service import (
    get_upcoming_sessions,
    get_completed_sessions,
    get_session_by_id,
    cancel_session_by_id,
    get_latest_feedback,
    save_feedback,
)

sessions_bp = Blueprint("sessions", __name__)


@sessions_bp.route("/", methods=["GET"])
@require_auth
def list_upcoming():
    sessions = get_upcoming_sessions(g.user.id)
    return jsonify([dict(s) for s in sessions]), 200


@sessions_bp.route("/completed", methods=["GET"])
@require_auth
def list_completed():
    sessions = get_completed_sessions(g.user.id)
    return jsonify([dict(s) for s in sessions]), 200


@sessions_bp.route("/<session_id>", methods=["GET"])
@require_auth
def get_session(session_id):
    session = get_session_by_id(g.user.id, session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify(dict(session)), 200


@sessions_bp.route("/<session_id>/cancel", methods=["POST"])
@require_auth
def cancel_session_route(session_id):
    cancelled = cancel_session_by_id(session_id, g.user.id)
    if not cancelled:
        return jsonify({"error": "Session not found or cannot be cancelled"}), 404
    return jsonify({"status": "cancelled"})


@sessions_bp.route("/<session_id>/feedback", methods=["GET"])
@require_auth
def get_feedback(session_id):
    feedback = get_latest_feedback(session_id)
    if not feedback:
        return jsonify({"feedback": None}), 200
    return jsonify({"feedback": dict(feedback)}), 200


@sessions_bp.route("/<session_id>/feedback", methods=["POST"])
@require_auth
def create_feedback(session_id):
    data = request.get_json() or {}
    required = ["from_user_id", "from_user_name", "rating", "communication", "preparedness", "technical_skill"]
    missing = [k for k in required if data.get(k) in (None, "")]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    feedback = save_feedback(
        session_id=session_id,
        from_user_id=str(data["from_user_id"]),
        from_user_name=str(data["from_user_name"]),
        to_user_id=str(data.get("to_user_id", "")),
        rating=int(data["rating"]),
        communication=int(data["communication"]),
        preparedness=int(data["preparedness"]),
        technical_skill=int(data["technical_skill"]),
        strengths=(data.get("strengths") or "").strip(),
        improvements=(data.get("improvements") or "").strip(),
        notes=(data.get("notes") or "").strip(),
    )
    return jsonify({"feedback": dict(feedback)}), 201
