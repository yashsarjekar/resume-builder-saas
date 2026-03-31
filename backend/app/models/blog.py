"""
Blog models for the automated blog system.

Covers blog posts, keyword research, and daily run reports.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from ..database import Base


class BlogPost(Base):
    """
    Stores every published (or draft) blog post.

    Content is full HTML, served via /api/blog/:slug.
    ISR on the Next.js side caches each page for 1 hour,
    so fetching this row only happens on cache miss.
    """

    __tablename__ = "blog_posts"

    # Primary fields
    id              = Column(Integer, primary_key=True, index=True)
    slug            = Column(String(255), unique=True, nullable=False, index=True)
    title           = Column(Text, nullable=False)
    excerpt         = Column(Text, nullable=True)
    content         = Column(Text, nullable=True)          # Full HTML content
    category        = Column(String(50), nullable=False)   # resume-tips / interview-prep / career-advice
    tags            = Column(JSONB, default=list)
    author          = Column(String(100), default="Resume Builder Team")
    read_time       = Column(Integer, default=5)           # minutes
    featured        = Column(Boolean, default=False)
    status          = Column(String(20), default="published")  # published / draft

    # SEO fields
    meta_description = Column(Text, nullable=True)
    primary_keyword  = Column(String(255), nullable=True)
    lsi_keywords     = Column(JSONB, default=list)
    word_count       = Column(Integer, default=0)

    # Indexing tracking
    indexnow_submitted     = Column(Boolean, default=False)
    indexnow_submitted_at  = Column(DateTime, nullable=True)
    google_submitted       = Column(Boolean, default=False)
    google_submitted_at    = Column(DateTime, nullable=True)

    # Timestamps
    published_at = Column(DateTime, default=datetime.utcnow)
    created_at   = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<BlogPost(id={self.id}, slug='{self.slug}', status='{self.status}')>"

    def to_dict(self, include_content: bool = True) -> dict:
        """Serialize to dict for API responses."""
        data = {
            "id":               self.id,
            "slug":             self.slug,
            "title":            self.title,
            "excerpt":          self.excerpt,
            "category":         self.category,
            "tags":             self.tags or [],
            "author":           self.author,
            "read_time":        self.read_time,
            "featured":         self.featured,
            "status":           self.status,
            "meta_description": self.meta_description,
            "primary_keyword":  self.primary_keyword,
            "lsi_keywords":     self.lsi_keywords or [],
            "word_count":       self.word_count,
            "published_at":     self.published_at.isoformat() if self.published_at else None,
            "created_at":       self.created_at.isoformat() if self.created_at else None,
        }
        if include_content:
            data["content"] = self.content
        return data

    def to_sitemap_entry(self) -> dict:
        """Minimal data needed for sitemap generation."""
        return {
            "slug":         self.slug,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "updated_at":   self.updated_at.isoformat() if self.updated_at else None,
        }


class BlogKeyword(Base):
    """
    Keyword research pool consumed by the daily blog generator.

    The scheduler picks the 3 keywords with the highest buyer_intent
    that still have status='pending'.
    """

    __tablename__ = "blog_keywords"

    id            = Column(Integer, primary_key=True, index=True)
    keyword       = Column(String(255), unique=True, nullable=False)
    category      = Column(String(100), nullable=True)    # ats-tips / resume-format / etc.
    search_volume = Column(Integer, default=0)            # estimated monthly searches
    competition   = Column(String(20), default="medium")  # low / medium / high
    buyer_intent  = Column(Integer, default=5)            # 1-10
    status        = Column(String(20), default="pending") # pending / used / skipped
    used_at       = Column(DateTime, nullable=True)
    blog_id       = Column(Integer, nullable=True)        # set after blog is generated
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<BlogKeyword(id={self.id}, keyword='{self.keyword}', intent={self.buyer_intent}, status='{self.status}')>"

    def to_dict(self) -> dict:
        return {
            "id":            self.id,
            "keyword":       self.keyword,
            "category":      self.category,
            "search_volume": self.search_volume,
            "competition":   self.competition,
            "buyer_intent":  self.buyer_intent,
            "status":        self.status,
            "used_at":       self.used_at.isoformat() if self.used_at else None,
            "blog_id":       self.blog_id,
        }


class BlogDailyReport(Base):
    """
    One row per cron run — tracks what was published, indexed, and any errors.
    """

    __tablename__ = "blog_daily_reports"

    id                   = Column(Integer, primary_key=True, index=True)
    report_date          = Column(Date, unique=True, nullable=False)
    blogs_generated      = Column(Integer, default=0)
    blogs_published      = Column(Integer, default=0)
    indexnow_submitted   = Column(Integer, default=0)
    indexnow_success     = Column(Integer, default=0)
    google_submitted     = Column(Integer, default=0)
    google_success       = Column(Integer, default=0)
    sitemap_updated      = Column(Boolean, default=False)
    keywords_used        = Column(JSONB, default=list)
    total_blogs_published = Column(Integer, default=0)
    errors               = Column(JSONB, default=list)
    created_at           = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<BlogDailyReport(date={self.report_date}, published={self.blogs_published})>"

    def to_dict(self) -> dict:
        return {
            "report_date":          self.report_date.isoformat() if self.report_date else None,
            "blogs_generated":      self.blogs_generated,
            "blogs_published":      self.blogs_published,
            "indexnow_submitted":   self.indexnow_submitted,
            "indexnow_success":     self.indexnow_success,
            "google_submitted":     self.google_submitted,
            "google_success":       self.google_success,
            "sitemap_updated":      self.sitemap_updated,
            "keywords_used":        self.keywords_used or [],
            "total_blogs_published": self.total_blogs_published,
            "errors":               self.errors or [],
        }
