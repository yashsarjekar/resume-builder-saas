"""
Portfolio routes.

Auth-protected (Starter/Pro only):
  POST   /api/portfolio          — create or update portfolio
  GET    /api/portfolio/me       — get current user's portfolio
  DELETE /api/portfolio          — delete portfolio
  GET    /api/portfolio/check-slug/{slug} — check slug availability

Public (no auth):
  GET    /api/portfolio/p/{slug} — public portfolio view (increments views_count)
"""

import re
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.portfolio import Portfolio
from app.models.user import SubscriptionType, User
from app.routes.auth import get_current_user
from app.schemas.portfolio import (
    PortfolioResponse,
    PortfolioUpsertRequest,
    PublicPortfolioResponse,
    SlugCheckResponse,
)

router = APIRouter()

SITE_URL = "https://resumebuilder.pulsestack.in"


def _require_paid(user: User) -> None:
    """Raise 403 if user is on the free plan."""
    if user.subscription_type == SubscriptionType.FREE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "UPGRADE_REQUIRED",
                "message": "Portfolio pages are available on Starter and Pro plans.",
            },
        )


def _to_response(portfolio: Portfolio) -> PortfolioResponse:
    return PortfolioResponse(
        id=portfolio.id,
        user_id=portfolio.user_id,
        slug=portfolio.slug,
        is_public=portfolio.is_public,
        name=portfolio.name,
        title=portfolio.title,
        bio=portfolio.bio,
        photo_url=portfolio.photo_url,
        email=portfolio.email,
        linkedin_url=portfolio.linkedin_url,
        github_url=portfolio.github_url,
        location=portfolio.location,
        website_url=portfolio.website_url,
        skills=portfolio.skills or [],
        experience=portfolio.experience or [],
        projects=portfolio.projects or [],
        theme=portfolio.theme,
        views_count=portfolio.views_count,
        portfolio_url=f"{SITE_URL}/portfolio/{portfolio.slug}",
    )


# ── POST /api/portfolio  ───────────────────────────────────────────────────────

@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_200_OK)
def upsert_portfolio(
    payload: PortfolioUpsertRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or update the current user's portfolio. Starter/Pro only."""
    _require_paid(current_user)

    # Check slug uniqueness (allow own slug on update)
    existing_slug = (
        db.query(Portfolio)
        .filter(Portfolio.slug == payload.slug, Portfolio.user_id != current_user.id)
        .first()
    )
    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This slug is already taken. Please choose a different one.",
        )

    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()

    if portfolio is None:
        portfolio = Portfolio(user_id=current_user.id)
        db.add(portfolio)

    portfolio.slug        = payload.slug
    portfolio.name        = payload.name
    portfolio.title       = payload.title
    portfolio.bio         = payload.bio
    portfolio.photo_url   = payload.photo_url
    portfolio.email       = payload.email
    portfolio.linkedin_url = payload.linkedin_url
    portfolio.github_url  = payload.github_url
    portfolio.location    = payload.location
    portfolio.website_url = payload.website_url
    portfolio.skills      = [s.dict() for s in payload.skills]
    portfolio.experience  = [e.dict() for e in payload.experience]
    portfolio.projects    = [p.dict() for p in payload.projects]
    portfolio.theme       = payload.theme
    portfolio.is_public   = payload.is_public
    portfolio.updated_at  = datetime.utcnow()

    db.commit()
    db.refresh(portfolio)
    return _to_response(portfolio)


# ── GET /api/portfolio/me  ─────────────────────────────────────────────────────

@router.get("/me", response_model=PortfolioResponse)
def get_my_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's portfolio (auth required)."""
    _require_paid(current_user)
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found. Create one first.")
    return _to_response(portfolio)


# ── DELETE /api/portfolio  ─────────────────────────────────────────────────────

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete the current user's portfolio."""
    _require_paid(current_user)
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio to delete.")
    db.delete(portfolio)
    db.commit()


# ── GET /api/portfolio/check-slug/{slug}  ─────────────────────────────────────

@router.get("/check-slug/{slug}", response_model=SlugCheckResponse)
def check_slug(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check whether a slug is available for the current user."""
    _require_paid(current_user)
    cleaned = re.sub(r"[^a-z0-9\-]", "", slug.lower().replace(" ", "-"))
    taken = (
        db.query(Portfolio)
        .filter(Portfolio.slug == cleaned, Portfolio.user_id != current_user.id)
        .first()
    )
    return SlugCheckResponse(slug=cleaned, available=taken is None)


# ── GET /api/portfolio/p/{slug}  (PUBLIC) ─────────────────────────────────────

@router.get("/p/{slug}", response_model=PublicPortfolioResponse)
def get_public_portfolio(slug: str, db: Session = Depends(get_db)):
    """Public endpoint — no auth required. Increments view counter."""
    portfolio = (
        db.query(Portfolio)
        .filter(Portfolio.slug == slug, Portfolio.is_public == True)  # noqa: E712
        .first()
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    # Increment view counter
    portfolio.views_count += 1
    db.commit()

    return PublicPortfolioResponse(
        slug=portfolio.slug,
        name=portfolio.name,
        title=portfolio.title,
        bio=portfolio.bio,
        photo_url=portfolio.photo_url,
        email=portfolio.email,
        linkedin_url=portfolio.linkedin_url,
        github_url=portfolio.github_url,
        location=portfolio.location,
        website_url=portfolio.website_url,
        skills=portfolio.skills or [],
        experience=portfolio.experience or [],
        projects=portfolio.projects or [],
        theme=portfolio.theme,
        views_count=portfolio.views_count,
    )
