from src.db import get_db


def _get_user_id_by_email(cur, email: str):
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    return row["id"] if row else None


def _get_interview_type_id(cur, name: str):
    cur.execute("SELECT id FROM interview_types WHERE name = %s", (name,))
    row = cur.fetchone()
    return row["id"] if row else None


def create_session(payload: dict):
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
    db = get_db()
    cur = db.cursor()

    cal_booking_uid = payload.get("uid")

    cur.execute(
        "UPDATE sessions SET status = 'cancelled' WHERE cal_booking_uid = %s",
        (cal_booking_uid,),
    )
    db.commit()


def _ensure_feedback_table(cur):
    """Ensure the feedback table exists for local/dev persistence."""
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
            session_id,
            from_user_id,
            from_user_name,
            to_user_id,
            rating,
            communication,
            preparedness,
            technical_skill,
            strengths,
            improvements,
            notes
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING
            id,
            session_id,
            from_user_id,
            from_user_name,
            to_user_id,
            rating,
            communication,
            preparedness,
            technical_skill,
            strengths,
            improvements,
            notes,
            created_at
        """,
        (
            session_id,
            from_user_id,
            from_user_name,
            to_user_id,
            rating,
            communication,
            preparedness,
            technical_skill,
            strengths,
            improvements,
            notes,
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
            id,
            session_id,
            from_user_id,
            from_user_name,
            to_user_id,
            rating,
            communication,
            preparedness,
            technical_skill,
            strengths,
            improvements,
            notes,
            created_at
        FROM session_feedback
        WHERE session_id = %s
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (session_id,),
    )
    return cur.fetchone()
