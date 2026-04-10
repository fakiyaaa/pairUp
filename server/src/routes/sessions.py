from flask import Blueprint, jsonify, request

from src.services.session_service import get_latest_feedback, save_feedback

sessions_bp = Blueprint("sessions", __name__)


@sessions_bp.route("/<session_id>/feedback", methods=["GET"])
def get_feedback(session_id):
    """Return latest feedback for a session, if any."""
    feedback = get_latest_feedback(session_id)
    if not feedback:
        return jsonify({"feedback": None}), 200
    return jsonify({"feedback": dict(feedback)}), 200


@sessions_bp.route("/<session_id>/feedback", methods=["POST"])
def create_feedback(session_id):
    """Persist feedback submitted for a completed session."""
    data = request.get_json() or {}
    required = [
        "from_user_id",
        "from_user_name",
        "rating",
        "communication",
        "preparedness",
        "technical_skill",
    ]
    missing = [key for key in required if data.get(key) in (None, "")]
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
