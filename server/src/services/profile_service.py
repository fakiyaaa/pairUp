from src.db import get_db


def get_users(interview_type_id=None, timezone=None, experience=None):
    db = get_db()
    cur = db.cursor()

    conditions = []
    params = []

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
            u.role,
            array_agg(DISTINCT it.name) AS interview_types
        FROM users u
        LEFT JOIN user_interview_types uit ON uit.user_id = u.id
        LEFT JOIN interview_types it ON it.id = uit.interview_type_id
        {where_clause}
        GROUP BY u.id
        ORDER BY u.full_name
        """,
        params,
    )

    return [dict(row) for row in cur.fetchall()]


def get_me(user_id):
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
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

    try:
        cur.execute(
            "SELECT topic_name FROM user_topics WHERE user_id = %s",
            (user_id,),
        )
        profile["topics"] = [r["topic_name"] for r in cur.fetchall()]
    except Exception:
        db.rollback()
        profile["topics"] = []

    cur.execute(
        """
        SELECT
            s.id,
            s.status,
            s.scheduled_at,
            s.meeting_link,
            it.name AS interview_type,
            CASE WHEN s.interviewer_id = %s THEN ie.full_name ELSE ir.full_name END AS partner_name
        FROM sessions s
        JOIN interview_types it ON it.id = s.interview_type_id
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

    allowed = ("full_name", "bio", "timezone", "experience", "cal_com_link", "role")
    fields = {col: data[col] for col in allowed if col in data}

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
                "INSERT INTO user_interview_types (user_id, interview_type_id) SELECT %s, id FROM interview_types WHERE name = %s ON CONFLICT DO NOTHING",
                (user_id, name),
            )

    if "topics" in data:
        cur.execute("DELETE FROM user_topics WHERE user_id = %s", (user_id,))
        for topic in data["topics"]:
            cur.execute(
                "INSERT INTO user_topics (user_id, topic_name) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (user_id, topic),
            )

    db.commit()
    return get_me(user_id)
