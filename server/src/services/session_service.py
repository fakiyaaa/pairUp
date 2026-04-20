from src.db import get_db


def get_session_by_id(session_id: str, user_id: str):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        """
        SELECT
            s.id,
            s.status,
            s.scheduled_at,
            s.meeting_link,
            it.name AS interview_type,
            interviewer.id           AS interviewer_id,
            interviewer.full_name    AS interviewer_name,
            interviewer.email        AS interviewer_email,
            interviewer.cal_com_link AS interviewer_cal_com_link,
            interviewer.bio          AS interviewer_bio,
            interviewer.timezone     AS interviewer_timezone,
            interviewee.id           AS interviewee_id,
            interviewee.full_name    AS interviewee_name,
            interviewee.email        AS interviewee_email,
            interviewee.cal_com_link AS interviewee_cal_com_link,
            interviewee.bio          AS interviewee_bio,
            interviewee.timezone     AS interviewee_timezone
        FROM sessions s
        JOIN users interviewer ON interviewer.id = s.interviewer_id
        JOIN users interviewee ON interviewee.id = s.interviewee_id
        LEFT JOIN interview_types it ON it.id = s.interview_type_id
        WHERE s.id = %s
          AND (s.interviewer_id = %s OR s.interviewee_id = %s)
        """,
        (session_id, user_id, user_id),
    )

    return cur.fetchone()


def get_completed_sessions(user_id: str):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        """
        SELECT
            s.id,
            s.status,
            s.scheduled_at,
            s.meeting_link,
            it.name AS interview_type,
            interviewer.id           AS interviewer_id,
            interviewer.full_name    AS interviewer_name,
            interviewer.email        AS interviewer_email,
            interviewer.cal_com_link AS interviewer_cal_com_link,
            interviewee.id           AS interviewee_id,
            interviewee.full_name    AS interviewee_name,
            interviewee.email        AS interviewee_email,
            interviewee.cal_com_link AS interviewee_cal_com_link
        FROM sessions s
        JOIN users interviewer ON interviewer.id = s.interviewer_id
        JOIN users interviewee ON interviewee.id = s.interviewee_id
        LEFT JOIN interview_types it ON it.id = s.interview_type_id
        WHERE (s.interviewer_id = %s OR s.interviewee_id = %s)
          AND s.status = 'completed'
        ORDER BY s.scheduled_at DESC
        """,
        (user_id, user_id),
    )

    return cur.fetchall()


def get_upcoming_sessions(user_id: str):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        """
        SELECT
            s.id,
            s.status,
            s.scheduled_at,
            s.meeting_link,
            it.name AS interview_type,
            interviewer.id           AS interviewer_id,
            interviewer.full_name    AS interviewer_name,
            interviewer.email        AS interviewer_email,
            interviewer.cal_com_link AS interviewer_cal_com_link,
            interviewee.id           AS interviewee_id,
            interviewee.full_name    AS interviewee_name,
            interviewee.email        AS interviewee_email,
            interviewee.cal_com_link AS interviewee_cal_com_link
        FROM sessions s
        JOIN users interviewer ON interviewer.id = s.interviewer_id
        JOIN users interviewee ON interviewee.id = s.interviewee_id
        LEFT JOIN interview_types it ON it.id = s.interview_type_id
        WHERE (s.interviewer_id = %s OR s.interviewee_id = %s)
          AND s.status = 'confirmed'
          AND s.scheduled_at > NOW()
        ORDER BY s.scheduled_at ASC
        """,
        (user_id, user_id),
    )

    return cur.fetchall()


def _get_user_id_by_email(cur, email: str):
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    return row["id"] if row else None


def _get_interview_type_id(cur, name: str):
    cur.execute("SELECT id FROM interview_types WHERE name = %s", (name,))
    row = cur.fetchone()
    return row["id"] if row else None


def _parse_calendly_payload(payload: dict):
    event = payload.get("event", {})
    invitee = payload.get("invitee", {})

    assigned = event.get("extended_assigned_to") or []
    organizer_email = assigned[0].get("email") if assigned else None
    invitee_email = invitee.get("email")

    location = event.get("location") or ""
    meeting_link = location if location.startswith("http") else None

    return {
        "organizer_email": organizer_email,
        "invitee_email": invitee_email,
        "scheduled_at": event.get("start_time"),
        "uid": event.get("uuid"),
        "meeting_link": meeting_link,
    }


def create_session(payload: dict):
    db = get_db()
    cur = db.cursor()

    parsed = _parse_calendly_payload(payload)
    interviewer_id = _get_user_id_by_email(cur, parsed["organizer_email"])
    interviewee_id = _get_user_id_by_email(cur, parsed["invitee_email"])

    cur.execute(
        """
        INSERT INTO sessions
            (interviewer_id, interviewee_id, interview_type_id, status, scheduled_at, meeting_link, cal_booking_uid)
        VALUES
            (%s, %s, NULL, 'confirmed', %s, %s, %s)
        ON CONFLICT (cal_booking_uid) DO NOTHING
        """,
        (interviewer_id, interviewee_id, parsed["scheduled_at"], parsed["meeting_link"], parsed["uid"]),
    )
    db.commit()


def reschedule_session(payload: dict):
    db = get_db()
    cur = db.cursor()

    parsed = _parse_calendly_payload(payload)
    old_event = payload.get("old_event", {})
    old_uid = old_event.get("uuid") or parsed["uid"]

    cur.execute(
        "UPDATE sessions SET scheduled_at = %s WHERE cal_booking_uid = %s",
        (parsed["scheduled_at"], old_uid),
    )
    db.commit()


def cancel_session(payload: dict):
    db = get_db()
    cur = db.cursor()

    event = payload.get("event", {})
    uid = event.get("uuid")

    cur.execute(
        "UPDATE sessions SET status = 'cancelled' WHERE cal_booking_uid = %s",
        (uid,),
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
