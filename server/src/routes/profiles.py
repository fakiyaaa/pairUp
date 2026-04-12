from flask import Blueprint, jsonify, request, g

from src.middleware.auth import require_auth
from src.services.profile_service import get_users, get_me, update_me

profiles_bp = Blueprint("profiles", __name__)


@profiles_bp.route("/", methods=["GET"])
def list_users():
    users = get_users(
        interview_type_id=request.args.get("interview_type_id"),
        timezone=request.args.get("timezone"),
        experience=request.args.get("experience"),
    )
    return jsonify(users), 200


@profiles_bp.route("/me", methods=["GET"])
@require_auth
def get_my_profile():
    profile = get_me(str(g.user.id))
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile), 200


@profiles_bp.route("/me", methods=["PUT"])
@require_auth
def update_my_profile():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    profile = update_me(str(g.user.id), data)
    return jsonify(profile), 200


@profiles_bp.route("/<user_id>", methods=["GET"])
def get_user_profile(user_id):
    profile = get_me(user_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile), 200
