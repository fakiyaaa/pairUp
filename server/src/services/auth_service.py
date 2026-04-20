import os
import uuid

from src.db import get_db
from src.supabase_client import get_supabase


def signup(
    full_name, email, password, timezone, role,
    experience=None, bio=None, cal_com_link=None,
    interview_types=None, topic_ids=None,
):
    """Create Supabase Auth user + insert into users table.

    Returns (user_dict, error).
    """
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id FROM roles WHERE name = %s", (role,))
    role_row = cur.fetchone()
    if not role_row:
        return None, f"Invalid role: {role}"
    role_id = role_row["id"]

    sb = get_supabase()
    try:
        sb = get_supabase()
        response = sb.auth.sign_up(
            {
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name,
                        "timezone": timezone,
                        "experience": experience,
                        "bio": bio,
                        "cal_com_link": cal_com_link,
                    }
                },
            }
        )
    except Exception as e:
        return None, "Something went wrong during signup: " + str(e)

    if not response.user:
        return None, "Signup failed — no user returned"

    if not response.session:
        return None, "Signup failed — no session returned"

    access_token = (
        response.session.access_token if response.session else None
    )
    refresh_token = (
        response.session.refresh_token if response.session else None
    )

    user_id = response.user.id

    cur.execute(
        """
        INSERT INTO users
            (id, full_name, email, timezone, experience, bio, cal_com_link, role_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (user_id, full_name, email, timezone, experience, bio, cal_com_link, role_id),
    )

    if interview_types:
        for name in interview_types:
            cur.execute(
                """
                INSERT INTO user_interview_types (user_id, interview_type_id)
                SELECT %s, id FROM interview_types WHERE name = %s
                ON CONFLICT DO NOTHING
                """,
                (user_id, name),
            )

    if topic_ids:
        for topic_id in topic_ids:
            cur.execute(
                """
                INSERT INTO user_topics (user_id, topic_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
                """,
                (user_id, topic_id),
            )

    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user_id,
            "full_name": full_name,
            "email": email,
            "timezone": timezone,
            "experience": experience,
            "bio": bio,
            "cal_com_link": cal_com_link,
            "role": role,
        },
    }, None


def login(email, password):
    """Sign in with Supabase Auth, fetch profile from users table. Returns (data_dict, error)."""
    try:
        sb = get_supabase()
        response = sb.auth.sign_in_with_password(
            {
                "email": email,
                "password": password,
            }
        )
    except Exception as e:
        return None, str(e)

    if not response.session:
        return None, "Login failed — no session returned"

    user_id = response.user.id

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user_row = cur.fetchone()

    if not user_row:
        return None, "User profile not found"

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "user": dict(user_row),
    }, None


def logout(access_token):
    """Sign out from Supabase Auth. Returns (None, error)."""
    try:
        sb = get_supabase()
        sb.auth.sign_out()
        return None, None
    except Exception as e:
        return None, str(e)


def refresh(refresh_token):
    """Refresh the session. Returns (tokens_dict, error)."""
    try:
        sb = get_supabase()
        response = sb.auth.refresh_session(refresh_token)
    except Exception as e:
        return None, str(e)

    if not response.session:
        return None, "Refresh failed — no session returned"

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
    }, None
