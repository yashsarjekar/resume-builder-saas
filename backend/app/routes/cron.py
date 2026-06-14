import logging
import os
import shutil
import subprocess
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import get_settings
from app.services.drip_service import process_drip_emails, DRIP_EMAIL_SUBJECTS, DRIP_TEMPLATE_NAMES, _build_drip_text
from app.services.email_service import email_service
from app.services.blog_generator import blog_generator, GLOBAL_KEYWORD_BANK, _auto_seed_keywords
from app.services.indexnow_service import indexnow_service
from app.services.google_indexing_service import google_indexing_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/drip-emails")
async def run_drip_emails(
    x_cron_secret: str = Header(..., alias="X-Cron-Secret"),
    db: Session = Depends(get_db),
):
    """Process drip email campaign. Protected by CRON_SECRET header."""
    settings = get_settings()
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        logger.warning("Drip email cron called with invalid secret")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid cron secret",
        )

    stats = process_drip_emails(db)
    logger.info(f"Drip email cron completed: {stats}")
    return {"status": "ok", "stats": stats}


class TestDripRequest(BaseModel):
    email: str
    drip_step: int  # 1-5
    name: Optional[str] = "Test User"


@router.post("/test-drip-email")
async def test_drip_email(
    request: TestDripRequest,
    x_cron_secret: str = Header(..., alias="X-Cron-Secret"),
):
    """
    Send a test drip email to a specific address. Protected by CRON_SECRET.
    Useful for previewing email templates before enabling cron.

    Steps: 1=reminder, 2=20%off, 3=30%off, 4=50%off, 5=80%off
    """
    settings = get_settings()
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid cron secret",
        )

    if request.drip_step < 1 or request.drip_step > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="drip_step must be between 1 and 5",
        )

    # Build template variables with test data
    discount_map = {1: None, 2: 20, 3: 30, 4: 50, 5: 80}
    discount_pct = discount_map[request.drip_step]
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    coupon_code = f"TEST-{request.drip_step}-ABCD1234"
    pricing_url = f"{frontend_url}/pricing"
    if coupon_code and discount_pct:
        pricing_url += f"?coupon={coupon_code}"

    template_vars = {
        "user_name": request.name,
        "discount_percent": str(discount_pct) if discount_pct else "",
        "coupon_code": coupon_code if discount_pct else "",
        "pricing_url": pricing_url,
        "expiry_days": "3",
        "frontend_url": frontend_url,
    }

    subject = DRIP_EMAIL_SUBJECTS[request.drip_step]
    template_name = DRIP_TEMPLATE_NAMES[request.drip_step]

    try:
        html_content = email_service._load_template(template_name, template_vars)
        text_content = _build_drip_text(request.drip_step, template_vars)
        email_service.send_email(
            to_email=request.email,
            subject=f"[TEST] {subject}",
            html_content=html_content,
            text_content=text_content,
        )
        return {
            "status": "sent",
            "to": request.email,
            "drip_step": request.drip_step,
            "subject": f"[TEST] {subject}",
        }
    except Exception as e:
        logger.error(f"Test drip email failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test email: {str(e)}",
        )


# ── POST /api/cron/generate-blogs ─────────────────────────────────────────

@router.post("/generate-blogs")
def run_generate_blogs(
    x_cron_secret: str = Header(..., alias="X-Cron-Secret"),
    db: Session = Depends(get_db),
):
    """
    Daily blog automation cron.

    1. Picks top-N pending keywords by buyer_intent
    2. Generates full HTML posts via Claude API
    3. Pings Bing via IndexNow immediately after each publish
    4. Notifies Google Search Console Indexing API
    5. Runs retry safety-nets for any previously failed submissions
    6. Returns a full report

    Protected by X-Cron-Secret header.
    Schedule: daily at 9 AM IST  →  03:30 UTC  →  cron: 30 3 * * *
    """
    settings = get_settings()
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        logger.warning("generate-blogs cron called with invalid secret")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid cron secret",
        )

    errors: list[str] = []

    # ── 1. Generate blog posts ─────────────────────────────────────────────
    try:
        report = blog_generator.run_daily_generation(
            db,
            count=settings.BLOG_POSTS_PER_RUN,
        )
        errors.extend(report.errors or [])
    except Exception as exc:
        logger.error(f"Blog generation failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Blog generation failed: {exc}",
        )

    # ── 2. Retry-submit any previously failed IndexNow posts ──────────────
    try:
        indexnow_retry = indexnow_service.submit_pending_posts(db)
        if indexnow_retry["errors"]:
            errors.extend(indexnow_retry["errors"])
    except Exception as exc:
        logger.warning(f"IndexNow retry failed: {exc}")
        errors.append(f"IndexNow retry: {exc}")

    # ── 3. Retry-submit any previously failed Google posts ────────────────
    try:
        google_retry = google_indexing_service.submit_pending_posts(db)
        if google_retry["errors"]:
            errors.extend(google_retry["errors"])
    except Exception as exc:
        logger.warning(f"Google indexing retry failed: {exc}")
        errors.append(f"Google indexing retry: {exc}")

    logger.info(
        f"generate-blogs cron done — "
        f"published={report.blogs_published}, "
        f"indexnow={report.indexnow_success}, "
        f"google={report.google_success}, "
        f"errors={len(errors)}"
    )

    return {
        "status": "ok",
        "blogs_published":   report.blogs_published,
        "indexnow_success":  report.indexnow_success,
        "google_success":    report.google_success,
        "keywords_used":     report.keywords_used,
        "total_published":   report.total_blogs_published,
        "errors":            errors,
    }


# ── POST /api/cron/reindex-all ────────────────────────────────────────────

@router.post("/reindex-all")
def reindex_all(
    x_cron_secret: str = Header(..., alias="X-Cron-Secret"),
    db: Session = Depends(get_db),
):
    """
    One-time endpoint to submit ALL published blog posts + key static pages
    to IndexNow in a single batch call.

    Use this to recover from the bug where only 1 URL was submitted per
    cron run. Safe to call multiple times (idempotent).
    Protected by X-Cron-Secret header.
    """
    from app.models.blog import BlogPost

    settings = get_settings()
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid cron secret",
        )

    site_url = indexnow_service.site_url

    # ── Static public pages ────────────────────────────────────────────────
    static_paths = [
        "/",
        "/blog",
        "/pricing",
        "/jobs",
        "/resume",
        "/privacy",
        "/terms",
        "/refund",
    ]
    static_urls = [f"{site_url}{p}" for p in static_paths]

    # ── All published blog posts ───────────────────────────────────────────
    posts = (
        db.query(BlogPost)
        .filter(BlogPost.status == "published")
        .order_by(BlogPost.published_at.desc())
        .all()
    )
    blog_urls = [f"{site_url}/blog/{p.slug}" for p in posts]

    all_urls = static_urls + blog_urls
    logger.info(
        f"reindex-all: submitting {len(all_urls)} URLs "
        f"({len(static_urls)} static + {len(blog_urls)} blog posts)"
    )

    ok, msg = indexnow_service.submit_urls(all_urls)

    from datetime import datetime
    now = datetime.utcnow()
    if ok:
        for post in posts:
            post.indexnow_submitted    = True
            post.indexnow_submitted_at = now
        db.commit()

    return {
        "status":        "ok" if ok else "error",
        "message":       msg,
        "total_urls":    len(all_urls),
        "static_pages":  len(static_urls),
        "blog_posts":    len(blog_urls),
        "blog_slugs":    [p.slug for p in posts],
        "static_urls":   static_urls,
    }


# ── POST /api/cron/seed-keywords ──────────────────────────────────────────

@router.post("/seed-keywords")
def run_seed_keywords(
    x_cron_secret: str = Header(..., alias="X-Cron-Secret"),
    db: Session = Depends(get_db),
):
    """
    One-time endpoint to seed the keyword bank from the built-in list.
    Idempotent — safe to call multiple times.
    Protected by X-Cron-Secret header.
    """
    settings = get_settings()
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid cron secret",
        )

    from app.models.blog import BlogKeyword

    inserted = _auto_seed_keywords(db)
    skipped  = len(GLOBAL_KEYWORD_BANK) - inserted
    pending  = db.query(BlogKeyword).filter(BlogKeyword.status == "pending").count()

    return {
        "status":        "ok",
        "inserted":      inserted,
        "skipped":       skipped,
        "total_pending": pending,
        "total_in_bank": len(GLOBAL_KEYWORD_BANK),
    }


# ── POST /api/cron/check-latex ────────────────────────────────────────────

@router.post("/check-latex")
def check_latex(
    x_cron_secret: str = Header(..., alias="X-Cron-Secret"),
):
    """
    Diagnostic: verify that pdflatex is available on PATH.
    Returns version string + full PATH so Railway deployment issues are visible.
    Protected by X-Cron-Secret header.
    """
    settings = get_settings()
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid cron secret",
        )

    pdflatex_path = shutil.which("pdflatex")
    version_output = None
    version_error  = None

    if pdflatex_path:
        try:
            result = subprocess.run(
                ["pdflatex", "--version"],
                capture_output=True, text=True, timeout=10,
            )
            version_output = result.stdout[:500]
            version_error  = result.stderr[:200] or None
        except Exception as exc:
            version_error = str(exc)

    return {
        "pdflatex_found": pdflatex_path is not None,
        "pdflatex_path":  pdflatex_path,
        "version":        version_output,
        "error":          version_error,
        "PATH":           os.environ.get("PATH", ""),
    }
