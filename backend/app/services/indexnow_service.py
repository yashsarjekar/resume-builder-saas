"""
IndexNow submission service.

IndexNow lets sites instantly notify Bing (and Yandex) about new or
updated URLs so they're crawled within minutes instead of days.

How it works:
  1. A key file lives at https://{host}/{key}.txt  (already deployed)
  2. We POST the new URL(s) to api.indexnow.org
  3. Bing crawls the page almost immediately

Docs: https://www.indexnow.org/documentation
"""

import logging
from typing import Optional

import httpx

from app.config import get_settings
from app.models.blog import BlogPost
from sqlalchemy.orm import Session
from datetime import datetime

logger = logging.getLogger(__name__)
settings = get_settings()

INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"


class IndexNowService:
    """
    Submits URLs to the IndexNow API (Bing / Yandex instant indexing).

    If INDEXNOW_API_KEY is not set the service logs a warning and skips
    silently — so it's safe to run in dev without the key.
    """

    def __init__(self) -> None:
        self.api_key  = settings.INDEXNOW_API_KEY
        self.site_url = settings.SITE_URL.rstrip("/")
        # Key file must be publicly accessible at {site_url}/{api_key}.txt
        self.key_location = f"{self.site_url}/{self.api_key}.txt" if self.api_key else None

    # ── Low-level HTTP call ────────────────────────────────────────────────

    def _post(self, urls: list[str]) -> tuple[bool, str]:
        """
        POST url list to IndexNow.

        Returns (success: bool, message: str).
        """
        if not self.api_key:
            return False, "INDEXNOW_API_KEY not configured"

        host = self.site_url.replace("https://", "").replace("http://", "")

        payload = {
            "host":        host,
            "key":         self.api_key,
            "keyLocation": self.key_location,
            "urlList":     urls,
        }

        try:
            resp = httpx.post(
                INDEXNOW_ENDPOINT,
                json=payload,
                headers={"Content-Type": "application/json; charset=utf-8"},
                timeout=15,
            )

            # IndexNow returns 200 (already known) or 202 (accepted) on success
            if resp.status_code in (200, 202):
                return True, f"HTTP {resp.status_code} — {len(urls)} URL(s) submitted"

            msg = f"HTTP {resp.status_code}: {resp.text[:200]}"
            logger.warning(f"IndexNow non-success: {msg}")
            return False, msg

        except httpx.TimeoutException:
            msg = "IndexNow request timed out"
            logger.warning(msg)
            return False, msg
        except Exception as exc:
            msg = f"IndexNow request failed: {exc}"
            logger.error(msg)
            return False, msg

    # ── Public helpers ─────────────────────────────────────────────────────

    def submit_blog_post(self, slug: str) -> tuple[bool, str]:
        """Submit a single blog post URL."""
        url = f"{self.site_url}/blog/{slug}"
        logger.info(f"IndexNow: submitting {url}")
        return self._post([url])

    def submit_urls(self, urls: list[str]) -> tuple[bool, str]:
        """Submit an arbitrary list of URLs (max 10 000 per IndexNow spec)."""
        if not urls:
            return True, "no URLs to submit"
        return self._post(urls)

    # ── DB helper: mark posts submitted ───────────────────────────────────

    def submit_pending_posts(self, db: Session, limit: int = 50) -> dict:
        """
        Find blog posts where indexnow_submitted=False and submit them.

        Returns a summary dict: { submitted, failed, errors }.
        Used by the cron endpoint to catch any posts that failed on first try.
        """
        posts = (
            db.query(BlogPost)
            .filter(
                BlogPost.status == "published",
                BlogPost.indexnow_submitted == False,  # noqa: E712
            )
            .order_by(BlogPost.published_at.desc())
            .limit(limit)
            .all()
        )

        if not posts:
            return {"submitted": 0, "failed": 0, "errors": []}

        urls = [f"{self.site_url}/blog/{p.slug}" for p in posts]
        success, msg = self._post(urls)

        now = datetime.utcnow()
        errors: list[str] = []

        for post in posts:
            if success:
                post.indexnow_submitted    = True
                post.indexnow_submitted_at = now
            else:
                errors.append(f"{post.slug}: {msg}")

        db.commit()

        return {
            "submitted": len(posts) if success else 0,
            "failed":    0 if success else len(posts),
            "errors":    errors,
        }


# ── Singleton ──────────────────────────────────────────────────────────────

indexnow_service = IndexNowService()
