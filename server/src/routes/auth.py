from flask import Blueprint, request, jsonify, make_response, current_app, g

from src.services.auth_service import signup, login, logout, refresh
from src.middleware.auth import require_auth
from src.db import get_db

auth_bp = Blueprint("auth", __name__)


def _is_secure():
    return current_app.config.get("FLASK_ENV") != "development"


def _set_auth_cookies(response, access_token, refresh_token):
    secure = _is_secure()
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=secure,
        samesite="None",
        path="/",
        max_age=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=secure,
        samesite="None",
        path="/",
        max_age=current_app.config["JWT_REFRESH_TOKEN_EXPIRES"],
    )


def _clear_auth_cookies(response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


@auth_bp.route("/signup", methods=["POST"])
def signup_route():
    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    timezone = data.get("timezone")
    role = data.get("role")

    if not all([full_name, email, password, timezone, role]):
        return (
            jsonify(
                {"error": "full_name, email, password, timezone, and role are required"}
            ),
            400,
        )

    result, error = signup(
        full_name=full_name,
        email=email,
        password=password,
        timezone=timezone,
        role=role,
        experience=data.get("experience"),
        bio=data.get("bio"),
        cal_com_link=data.get("cal_com_link"),
        interview_types=data.get("interview_types"),
        topic_ids=data.get("topic_ids"),
    )

    if error:
        return jsonify({"error": error}), 400

    response = make_response(jsonify({"user": result["user"]}))
    _set_auth_cookies(
        response, result["access_token"], result["refresh_token"]
    )
    return response


@auth_bp.route("/login", methods=["POST"])
def login_route():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "email and password are required"}), 400

    result, error = login(email, password)

    if error:
        return jsonify({"error": error}), 401

    response = make_response(jsonify({"user": result["user"]}))
    _set_auth_cookies(
        response, result["access_token"], result["refresh_token"]
    )
    return response


@auth_bp.route("/logout", methods=["POST"])
def logout_route():
    access_token = request.cookies.get("access_token")
    _, error = logout(access_token)

    if error:
        return jsonify({"error": error}), 500

    response = make_response(jsonify({"message": "Logged out"}))
    _clear_auth_cookies(response)
    return response


@auth_bp.route("/refresh", methods=["POST"])
def refresh_route():
    token = request.cookies.get("refresh_token")
    if not token:
        return jsonify({"error": "No refresh token"}), 401

    result, error = refresh(token)

    if error:
        return jsonify({"error": error}), 401

    response = make_response(jsonify({"message": "Tokens refreshed"}))
    _set_auth_cookies(
        response, result["access_token"], result["refresh_token"]
    )
    return response


@auth_bp.route("/me", methods=["GET"])
@require_auth
def me_route():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE id = %s", (g.user.id,))
    user_row = cur.fetchone()

    if not user_row:
        return jsonify({"error": "User profile not found"}), 404

    return jsonify({"user": dict(user_row)})
