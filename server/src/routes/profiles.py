from flask import Blueprint, jsonify, request

from src.services.profile_service import get_users

profiles_bp = Blueprint("profiles", __name__)


@profiles_bp.route("/", methods=["GET"])
def list_users():
    interview_type_id = request.args.get("interview_type_id")
    timezone = request.args.get("timezone")
    experience = request.args.get("experience")

    users = get_users(
        interview_type_id=interview_type_id,
        timezone=timezone,
        experience=experience,
    )

    return jsonify([dict(u) for u in users]), 200
