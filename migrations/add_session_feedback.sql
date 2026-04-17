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
);

