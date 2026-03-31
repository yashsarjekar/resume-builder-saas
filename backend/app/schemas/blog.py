"""
Pydantic schemas for blog-related API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── Blog Post Schemas ──────────────────────────────────────────────────────

class BlogPostBase(BaseModel):
    slug:             str
    title:            str
    excerpt:          Optional[str] = None
    category:         str
    tags:             List[str] = []
    author:           str = "Resume Builder Team"
    read_time:        int = 5
    featured:         bool = False
    meta_description: Optional[str] = None
    primary_keyword:  Optional[str] = None
    lsi_keywords:     List[str] = []
    word_count:       int = 0


class BlogPostResponse(BlogPostBase):
    """Full blog post — includes HTML content. Used by /api/blog/:slug."""
    id:           int
    content:      Optional[str] = None
    status:       str
    published_at: Optional[datetime] = None
    created_at:   datetime

    class Config:
        from_attributes = True


class BlogPostListItem(BlogPostBase):
    """Card data for listing pages — no content to keep payload small."""
    id:           int
    status:       str
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BlogPostListResponse(BaseModel):
    """Paginated list response for /api/blog."""
    posts:      List[BlogPostListItem]
    total:      int
    page:       int
    per_page:   int
    total_pages: int


class BlogSlugEntry(BaseModel):
    """Used by generateStaticParams in Next.js."""
    slug: str


class BlogSitemapEntry(BaseModel):
    """Used by the sitemap generator."""
    slug:         str
    published_at: Optional[datetime] = None
    updated_at:   Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Keyword Schemas ────────────────────────────────────────────────────────

class BlogKeywordResponse(BaseModel):
    id:            int
    keyword:       str
    category:      Optional[str] = None
    search_volume: int = 0
    competition:   str = "medium"
    buyer_intent:  int = 5
    status:        str
    used_at:       Optional[datetime] = None
    blog_id:       Optional[int] = None

    class Config:
        from_attributes = True


# ── Daily Report Schemas ───────────────────────────────────────────────────

class BlogDailyReportResponse(BaseModel):
    report_date:           str
    blogs_generated:       int
    blogs_published:       int
    indexnow_submitted:    int
    indexnow_success:      int
    google_submitted:      int
    google_success:        int
    sitemap_updated:       bool
    keywords_used:         List[str]
    total_blogs_published: int
    errors:                List[str]

    class Config:
        from_attributes = True


# ── Admin Stats Schema ─────────────────────────────────────────────────────

class BlogStatsResponse(BaseModel):
    total_published:       int
    total_draft:           int
    keywords_pending:      int
    keywords_used:         int
    last_report:           Optional[BlogDailyReportResponse] = None
    indexnow_pending:      int   # blogs not yet submitted to IndexNow
    google_pending:        int   # blogs not yet submitted to Google
