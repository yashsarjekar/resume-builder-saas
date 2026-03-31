-- Migration: Add blog automation tables
-- Run: psql $DATABASE_URL -f migrations/add_blog_tables.sql

-- 1. Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id                      SERIAL PRIMARY KEY,
    slug                    VARCHAR(255) UNIQUE NOT NULL,
    title                   TEXT NOT NULL,
    excerpt                 TEXT,
    content                 TEXT,                          -- Full HTML content
    category                VARCHAR(50) NOT NULL,          -- resume-tips / interview-prep / career-advice
    tags                    JSONB DEFAULT '[]',            -- ["ATS", "Resume"]
    author                  VARCHAR(100) DEFAULT 'Resume Builder Team',
    read_time               INTEGER DEFAULT 5,             -- minutes
    featured                BOOLEAN DEFAULT FALSE,
    status                  VARCHAR(20) DEFAULT 'published', -- published / draft
    -- SEO fields
    meta_description        TEXT,
    primary_keyword         VARCHAR(255),
    lsi_keywords            JSONB DEFAULT '[]',
    word_count              INTEGER DEFAULT 0,
    -- Indexing tracking
    indexnow_submitted      BOOLEAN DEFAULT FALSE,
    indexnow_submitted_at   TIMESTAMP DEFAULT NULL,
    google_submitted        BOOLEAN DEFAULT FALSE,
    google_submitted_at     TIMESTAMP DEFAULT NULL,
    -- Timestamps
    published_at            TIMESTAMP DEFAULT NOW(),
    created_at              TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at              TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug         ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status       ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category     ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured     ON blog_posts(featured) WHERE featured = TRUE;

-- 2. Blog keywords table
CREATE TABLE IF NOT EXISTS blog_keywords (
    id              SERIAL PRIMARY KEY,
    keyword         VARCHAR(255) UNIQUE NOT NULL,
    category        VARCHAR(100),                          -- ats-tips / resume-format / interview-prep etc.
    search_volume   INTEGER DEFAULT 0,                     -- estimated monthly searches
    competition     VARCHAR(20) DEFAULT 'medium',          -- low / medium / high
    buyer_intent    INTEGER DEFAULT 5,                     -- 1-10 score
    status          VARCHAR(20) DEFAULT 'pending',         -- pending / used / skipped
    used_at         TIMESTAMP DEFAULT NULL,
    blog_id         INTEGER REFERENCES blog_posts(id) ON DELETE SET NULL DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_keywords_status      ON blog_keywords(status);
CREATE INDEX IF NOT EXISTS idx_blog_keywords_buyer_intent ON blog_keywords(buyer_intent DESC);

-- 3. Daily automation reports table
CREATE TABLE IF NOT EXISTS blog_daily_reports (
    id                      SERIAL PRIMARY KEY,
    report_date             DATE UNIQUE NOT NULL,
    blogs_generated         INTEGER DEFAULT 0,
    blogs_published         INTEGER DEFAULT 0,
    indexnow_submitted      INTEGER DEFAULT 0,
    indexnow_success        INTEGER DEFAULT 0,
    google_submitted        INTEGER DEFAULT 0,
    google_success          INTEGER DEFAULT 0,
    sitemap_updated         BOOLEAN DEFAULT FALSE,
    keywords_used           JSONB DEFAULT '[]',
    total_blogs_published   INTEGER DEFAULT 0,
    errors                  JSONB DEFAULT '[]',
    created_at              TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_reports_date ON blog_daily_reports(report_date DESC);
