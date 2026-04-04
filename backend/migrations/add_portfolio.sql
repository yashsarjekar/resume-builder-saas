-- Migration: add portfolios table
-- Run once against the production database.

CREATE TABLE IF NOT EXISTS portfolios (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    slug          VARCHAR(100) NOT NULL UNIQUE,
    is_public     BOOLEAN NOT NULL DEFAULT TRUE,

    name          VARCHAR(200) NOT NULL,
    title         VARCHAR(200),
    bio           TEXT,
    photo_url     VARCHAR(1000),
    email         VARCHAR(200),
    linkedin_url  VARCHAR(1000),
    github_url    VARCHAR(1000),
    location      VARCHAR(200),
    website_url   VARCHAR(1000),

    skills        JSONB NOT NULL DEFAULT '[]',
    experience    JSONB NOT NULL DEFAULT '[]',
    projects      JSONB NOT NULL DEFAULT '[]',

    theme         VARCHAR(20) NOT NULL DEFAULT 'indigo',
    views_count   INTEGER NOT NULL DEFAULT 0,

    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_slug    ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
