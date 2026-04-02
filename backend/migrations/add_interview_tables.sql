-- Migration: Add AI Mock Interview tables
-- Run: psql $DATABASE_URL -f migrations/add_interview_tables.sql

-- 1. Interview sessions — one per attempt
CREATE TABLE IF NOT EXISTS interview_sessions (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Input
    resume_text         TEXT NOT NULL,
    job_description     TEXT NOT NULL,
    job_role            VARCHAR(255),                    -- extracted from JD

    -- State
    status              VARCHAR(20) DEFAULT 'in_progress' NOT NULL,
                                                         -- in_progress / completed / abandoned
    current_question    INTEGER DEFAULT 1 NOT NULL,      -- 1-10, tracks progress

    -- Results (populated after completion)
    overall_score       FLOAT DEFAULT NULL,              -- 0-100
    readiness_level     VARCHAR(30) DEFAULT NULL,        -- not_ready/needs_work/interview_ready/confident
    score_technical     FLOAT DEFAULT NULL,
    score_behavioral    FLOAT DEFAULT NULL,
    score_situational   FLOAT DEFAULT NULL,
    score_role_specific FLOAT DEFAULT NULL,
    top_strengths       JSONB DEFAULT '[]',              -- ["Good STAR format", ...]
    top_improvements    JSONB DEFAULT '[]',              -- ["Add more specifics", ...]

    -- Timestamps
    completed_at        TIMESTAMP DEFAULT NULL,
    created_at          TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id
    ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status
    ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at
    ON interview_sessions(created_at DESC);


-- 2. Interview questions — 10 per session
CREATE TABLE IF NOT EXISTS interview_questions (
    id              SERIAL PRIMARY KEY,
    session_id      INTEGER NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,                    -- 1-10
    question_text   TEXT NOT NULL,
    category        VARCHAR(30) NOT NULL,                -- technical/behavioral/situational/role_specific
    difficulty      VARCHAR(10) DEFAULT 'medium' NOT NULL, -- easy/medium/hard
    tip             TEXT,                                -- optional hint shown before answering
    created_at      TIMESTAMP DEFAULT NOW() NOT NULL,

    UNIQUE(session_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_interview_questions_session_id
    ON interview_questions(session_id);


-- 3. Interview answers — one per question
CREATE TABLE IF NOT EXISTS interview_answers (
    id                  SERIAL PRIMARY KEY,
    session_id          INTEGER NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_id         INTEGER NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    question_number     INTEGER NOT NULL,

    -- User's answer
    answer_text         TEXT NOT NULL,
    answer_method       VARCHAR(10) DEFAULT 'typed',     -- typed / voice

    -- AI evaluation
    score               FLOAT NOT NULL,                  -- 0-10
    strengths           JSONB DEFAULT '[]',              -- ["Clear structure", ...]
    improvements        JSONB DEFAULT '[]',              -- ["Add specific metrics", ...]
    ideal_answer_hint   TEXT,                            -- brief note on ideal structure
    evaluated_at        TIMESTAMP DEFAULT NOW() NOT NULL,

    created_at          TIMESTAMP DEFAULT NOW() NOT NULL,

    UNIQUE(session_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_interview_answers_session_id
    ON interview_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_question_id
    ON interview_answers(question_id);
