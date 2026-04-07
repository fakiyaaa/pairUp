from functools import wraps

from flask import request, jsonify, g

from src.supabase_client import get_supabase


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        access_token = request.cookies.get("access_token")
        if not access_token:
            return jsonify({"error": "Authentication required"}), 401

        sb = get_supabase()
        try:
            response = sb.auth.get_user(access_token)
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

        if not response.user:
            return jsonify({"error": "Invalid or expired token"}), 401

        g.user = response.user
        return f(*args, **kwargs)

    return decorated
