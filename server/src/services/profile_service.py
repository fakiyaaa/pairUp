from src.db import get_db


def get_users(exclude_user_id=None, interview_type_id=None, timezone=None, experience=None):
    db = get_db()
    cur = db.cursor()

    conditions = []
    params = []

    if exclude_user_id:
        conditions.append("u.id != %s")
        params.append(exclude_user_id)

    if interview_type_id:
        conditions.append("uit.interview_type_id = %s")
        params.append(interview_type_id)

    if timezone:
        conditions.append("u.timezone = %s")
        params.append(timezone)

    if experience:
        conditions.append("u.experience = %s")
        params.append(experience)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    cur.execute(
        f"""
        SELECT
            u.id,
            u.full_name,
            u.email,
            u.timezone,
            u.experience,
            u.bio,
            u.cal_com_link,
            r.name AS role,
            array_remove(array_agg(DISTINCT it.name), NULL) AS interview_types
        FROM users u
        LEFT JOIN roles r ON r.id = u.role_id
        LEFT JOIN user_interview_types uit ON uit.user_id = u.id
        LEFT JOIN interview_types it ON it.id = uit.interview_type_id
        {where_clause}
        GROUP BY u.id, r.name
        ORDER BY u.full_name
        """,
        params,
    )

    return [dict(row) for row in cur.fetchall()]


def get_interview_types():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name FROM interview_types ORDER BY name")
    return [dict(r) for r in cur.fetchall()]


def get_topics():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, interview_type_id FROM topics ORDER BY name")
    return [dict(r) for r in cur.fetchall()]


def get_roles():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name FROM roles ORDER BY name")
    return [dict(r) for r in cur.fetchall()]


def get_me(user_id):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        """
        SELECT u.*, r.name AS role
        FROM users u
        LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.id = %s
        """,
        (user_id,),
    )
    row = cur.fetchone()
    if not row:
        return None
    profile = dict(row)

    cur.execute(
        """
        SELECT it.name FROM user_interview_types uit
        JOIN interview_types it ON it.id = uit.interview_type_id
        WHERE uit.user_id = %s
        """,
        (user_id,),
    )
    profile["interview_types"] = [r["name"] for r in cur.fetchall()]

    cur.execute(
        """
        SELECT t.id, t.name FROM topics t
        JOIN user_topics ut ON ut.topic_id = t.id
        WHERE ut.user_id = %s
        ORDER BY t.name
        """,
        (user_id,),
    )
    profile["topics"] = [{"id": r["id"], "name": r["name"]} for r in cur.fetchall()]

    cur.execute(
        """
        SELECT
            s.id,
            s.status,
            s.scheduled_at,
            s.meeting_link,
            it.name AS interview_type,
            CASE WHEN s.interviewer_id = %s
                THEN ie.full_name ELSE ir.full_name
            END AS partner_name
        FROM sessions s
        LEFT JOIN interview_types it ON it.id = s.interview_type_id
        JOIN users ir ON ir.id = s.interviewer_id
        JOIN users ie ON ie.id = s.interviewee_id
        WHERE (s.interviewer_id = %s OR s.interviewee_id = %s)
          AND s.status IN ('confirmed', 'pending')
          AND s.scheduled_at > NOW()
        ORDER BY s.scheduled_at
        """,
        (user_id, user_id, user_id),
    )
    profile["upcoming_sessions"] = [dict(r) for r in cur.fetchall()]

    return profile


def update_me(user_id, data):
    db = get_db()
    cur = db.cursor()

    allowed = (
        "full_name", "bio", "timezone", "experience",
        "cal_com_link", "target_role",
    )
    fields = {col: data[col] for col in allowed if col in data}

    if "role" in data:
        cur.execute("SELECT id FROM roles WHERE name = %s", (data["role"],))
        role_row = cur.fetchone()
        if role_row:
            fields["role_id"] = role_row["id"]

    if fields:
        set_clause = ", ".join(f"{col} = %s" for col in fields)
        cur.execute(
            f"UPDATE users SET {set_clause} WHERE id = %s",
            list(fields.values()) + [user_id],
        )

    if "interview_types" in data:
        cur.execute("DELETE FROM user_interview_types WHERE user_id = %s", (user_id,))
        for name in data["interview_types"]:
            cur.execute(
                """
                INSERT INTO user_interview_types (user_id, interview_type_id)
                SELECT %s, id FROM interview_types WHERE name = %s
                ON CONFLICT DO NOTHING
                """,
                (user_id, name),
            )

    if "topic_ids" in data:
        cur.execute("DELETE FROM user_topics WHERE user_id = %s", (user_id,))
        for topic_id in data["topic_ids"]:
            cur.execute(
                """
                INSERT INTO user_topics (user_id, topic_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
                """,
                (user_id, topic_id),
            )

    db.commit()
    return get_me(user_id)
