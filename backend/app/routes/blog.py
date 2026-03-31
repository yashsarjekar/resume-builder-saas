"""
Public blog API endpoints.

All routes are unauthenticated — blog content is public.

Endpoints
---------
GET /api/blog                → paginated list (supports ?category=&page=&per_page=&featured=)
GET /api/blog/slugs          → all published slugs (used by Next.js generateStaticParams)
GET /api/blog/sitemap-data   → slug + dates for sitemap generation
GET /api/blog/{slug}         → full blog post including HTML content
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.blog import BlogPost
from app.schemas.blog import (
    BlogPostResponse,
    BlogPostListItem,
    BlogPostListResponse,
    BlogSlugEntry,
    BlogSitemapEntry,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ── GET /api/blog ──────────────────────────────────────────────────────────

@router.get("", response_model=BlogPostListResponse)
def list_blogs(
    category: Optional[str] = Query(None, description="Filter by category slug"),
    page:     int            = Query(1,    ge=1,  description="Page number"),
    per_page: int            = Query(10,   ge=1,  le=50, description="Results per page"),
    featured: Optional[bool] = Query(None, description="Filter featured posts only"),
    db: Session = Depends(get_db),
):
    """
    Return a paginated list of published blog posts.
    Content field is excluded to keep the payload small.
    """
    query = db.query(BlogPost).filter(BlogPost.status == "published")

    if category:
        query = query.filter(BlogPost.category == category)

    if featured is not None:
        query = query.filter(BlogPost.featured == featured)

    query = query.order_by(BlogPost.published_at.desc())

    total      = query.count()
    posts      = query.offset((page - 1) * per_page).limit(per_page).all()
    total_pages = (total + per_page - 1) // per_page

    return BlogPostListResponse(
        posts       = [BlogPostListItem.model_validate(p) for p in posts],
        total       = total,
        page        = page,
        per_page    = per_page,
        total_pages = total_pages,
    )


# ── GET /api/blog/slugs ────────────────────────────────────────────────────
# Must be defined BEFORE /{slug} so FastAPI doesn't treat "slugs" as a slug.

@router.get("/slugs", response_model=list[BlogSlugEntry])
def list_slugs(db: Session = Depends(get_db)):
    """
    Return all published slugs.
    Used by Next.js generateStaticParams() at build time.
    """
    rows = (
        db.query(BlogPost.slug)
        .filter(BlogPost.status == "published")
        .order_by(BlogPost.published_at.desc())
        .all()
    )
    return [BlogSlugEntry(slug=row.slug) for row in rows]


# ── GET /api/blog/sitemap-data ─────────────────────────────────────────────

@router.get("/sitemap-data", response_model=list[BlogSitemapEntry])
def sitemap_data(db: Session = Depends(get_db)):
    """
    Return slug + published_at + updated_at for every published post.
    Used by the sitemap generator service.
    """
    rows = (
        db.query(BlogPost.slug, BlogPost.published_at, BlogPost.updated_at)
        .filter(BlogPost.status == "published")
        .order_by(BlogPost.published_at.desc())
        .all()
    )
    return [
        BlogSitemapEntry(
            slug         = row.slug,
            published_at = row.published_at,
            updated_at   = row.updated_at,
        )
        for row in rows
    ]


# ── GET /api/blog/{slug} ───────────────────────────────────────────────────

@router.get("/{slug}", response_model=BlogPostResponse)
def get_blog(slug: str, db: Session = Depends(get_db)):
    """
    Return a single published blog post including full HTML content.
    Next.js caches this response via ISR (revalidate: 3600).
    """
    post = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug, BlogPost.status == "published")
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail=f"Blog post '{slug}' not found")

    return BlogPostResponse.model_validate(post)
