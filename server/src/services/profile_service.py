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
            u.timezone,
            u.experience,
            u.bio,
            u.cal_com_link,
            array_agg(it.name ORDER BY it.name) AS interview_types
        FROM users u
        JOIN user_interview_types uit ON uit.user_id = u.id
        JOIN interview_types it ON it.id = uit.interview_type_id
        {where_clause}
        GROUP BY u.id
        ORDER BY u.full_name
        """,
        params,
    )

    return cur.fetchall()
