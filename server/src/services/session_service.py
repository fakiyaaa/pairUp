from src.db import get_db


def _session_query(where_clause: str, params: tuple):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        f"""
        SELECT
            s.id,
            s.status,
            s.scheduled_at,
            s.meeting_link,
            it.name AS interview_type,
            interviewer.id           AS interviewer_id,
            interviewer.full_name    AS interviewer_name,
            interviewer.email        AS interviewer_email,
            interviewer.timezone     AS interviewer_timezone,
            interviewer.bio          AS interviewer_bio,
            interviewer.cal_com_link AS interviewer_cal_com_link,
            interviewee.id           AS interviewee_id,
            interviewee.full_name    AS interviewee_name,
            interviewee.email        AS interviewee_email,
            interviewee.timezone     AS interviewee_timezone,
            interviewee.bio          AS interviewee_bio,
            interviewee.cal_com_link AS interviewee_cal_com_link
        FROM sessions s
        JOIN users interviewer ON interviewer.id = s.interviewer_id
        JOIN users interviewee ON interviewee.id = s.interviewee_id
        LEFT JOIN interview_types it ON it.id = s.interview_type_id
        {where_clause}
        ORDER BY s.scheduled_at ASC
        """,
        params,
    )

    return cur.fetchall()


def get_upcoming_sessions(user_id: str):
    return _session_query(
        """
        WHERE (s.interviewer_id = %s OR s.interviewee_id = %s)
          AND s.status = 'confirmed'
          AND s.scheduled_at > NOW()
        """,
        (user_id, user_id),
    )


def get_completed_sessions(user_id: str):
    return _session_query(
        """
        WHERE (s.interviewer_id = %s OR s.interviewee_id = %s)
          AND s.status = 'completed'
        """,
        (user_id, user_id),
    )


def get_session_by_id(user_id: str, session_id: str):
    rows = _session_query(
        """
        WHERE s.id = %s
          AND (s.interviewer_id = %s OR s.interviewee_id = %s)
        """,
        (session_id, user_id, user_id),
    )
    return rows[0] if rows else None


def _get_user_id_by_email(cur, email: str):
    """Return the user id for the given email using the provided cursor, or None if not found."""
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    return row["id"] if row else None


def _get_interview_type_id(cur, name: str):
    """Return the interview type id for the given name using the provided cursor, or None if not found."""
    cur.execute("SELECT id FROM interview_types WHERE name = %s", (name,))
    row = cur.fetchone()
    return row["id"] if row else None


def create_session(payload: dict):
    """Insert a confirmed session from the webhook payload and commit the transaction."""
    db = get_db()
    cur = db.cursor()

    organizer_email = payload.get("organizer", {}).get("email")
    attendees = payload.get("attendees", [])
    attendee_email = attendees[0].get("email") if attendees else None

    interviewer_id = _get_user_id_by_email(cur, organizer_email)
    interviewee_id = _get_user_id_by_email(cur, attendee_email)

    metadata = payload.get("metadata") or {}
    interview_type_name = metadata.get("interviewType")
    interview_type_id = _get_interview_type_id(cur, interview_type_name) if interview_type_name else None

    video = payload.get("videoCallData") or {}
    meeting_link = video.get("url") or payload.get("location")
    scheduled_at = payload.get("startTime")
    cal_booking_uid = payload.get("uid")

    cur.execute(
        """
        INSERT INTO sessions
            (interviewer_id, interviewee_id, interview_type_id, status, scheduled_at, meeting_link, cal_booking_uid)
        VALUES
            (%s, %s, %s, 'confirmed', %s, %s, %s)
        ON CONFLICT (cal_booking_uid) DO NOTHING
        """,
        (interviewer_id, interviewee_id, interview_type_id, scheduled_at, meeting_link, cal_booking_uid),
    )
    db.commit()


def reschedule_session(payload: dict):
    """Update the scheduled_at time for the session identified by payload uid and commit the transaction."""
    db = get_db()
    cur = db.cursor()

    cal_booking_uid = payload.get("uid")
    scheduled_at = payload.get("startTime")

    cur.execute(
        "UPDATE sessions SET scheduled_at = %s WHERE cal_booking_uid = %s",
        (scheduled_at, cal_booking_uid),
    )
    db.commit()


def cancel_session(payload: dict):
    """Mark the session identified by payload uid as cancelled and commit the transaction."""
    db = get_db()
    cur = db.cursor()

    cal_booking_uid = payload.get("uid")

    cur.execute(
        "UPDATE sessions SET status = 'cancelled' WHERE cal_booking_uid = %s",
        (cal_booking_uid,),
    )
    db.commit()


def cancel_session_by_id(session_id: str, user_id: str) -> bool:
    """Cancel a session by ID. Returns False if not found or user is not a participant."""
    db = get_db()
    cur = db.cursor()

    cur.execute(
        """
        UPDATE sessions
        SET status = 'cancelled'
        WHERE id = %s
          AND status = 'confirmed'
          AND (interviewer_id = %s OR interviewee_id = %s)
        """,
        (session_id, user_id, user_id),
    )
    db.commit()
    return cur.rowcount > 0


def _ensure_feedback_table(cur):
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS session_feedback (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id TEXT NOT NULL,
            from_user_id TEXT NOT NULL,
            from_user_name TEXT,
            to_user_id TEXT,
            rating INTEGER NOT NULL,
            communication INTEGER NOT NULL,
            preparedness INTEGER NOT NULL,
            technical_skill INTEGER NOT NULL,
            strengths TEXT,
            improvements TEXT,
            notes TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )


def save_feedback(
    session_id: str,
    from_user_id: str,
    from_user_name: str,
    to_user_id: str,
    rating: int,
    communication: int,
    preparedness: int,
    technical_skill: int,
    strengths: str = "",
    improvements: str = "",
    notes: str = "",
):
    """Insert a feedback row and return the created record."""
    db = get_db()
    cur = db.cursor()
    _ensure_feedback_table(cur)

    cur.execute(
        """
        INSERT INTO session_feedback (
            session_id, from_user_id, from_user_name, to_user_id,
            rating, communication, preparedness, technical_skill,
            strengths, improvements, notes
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING
            id, session_id, from_user_id, from_user_name, to_user_id,
            rating, communication, preparedness, technical_skill,
            strengths, improvements, notes, created_at
        """,
        (
            session_id, from_user_id, from_user_name, to_user_id,
            rating, communication, preparedness, technical_skill,
            strengths, improvements, notes,
        ),
    )
    row = cur.fetchone()
    db.commit()
    return row


def get_latest_feedback(session_id: str):
    """Fetch the most recently submitted feedback for a session."""
    db = get_db()
    cur = db.cursor()
    _ensure_feedback_table(cur)

    cur.execute(
        """
        SELECT
            id, session_id, from_user_id, from_user_name, to_user_id,
            rating, communication, preparedness, technical_skill,
            strengths, improvements, notes, created_at
        FROM session_feedback
        WHERE session_id = %s
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (session_id,),
    )
    return cur.fetchone()
