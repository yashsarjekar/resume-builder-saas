"""
Google Search Console Indexing API service.

Notifies Google about new / updated blog URLs so they're crawled
within minutes instead of waiting for Googlebot to discover them.

Setup (one-time):
  1. Enable "Web Search Indexing API" in Google Cloud Console
  2. Create a Service Account → download JSON key
  3. In Google Search Console → Settings → Users & permissions →
     Add the service account email as an "Owner"
  4. Set GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON env var to the full
     JSON key content (single-line, no newlines around the value)

Docs: https://developers.google.com/search/apis/indexing-api/v3/quickstart
"""

import json
import logging
from datetime import datetime
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

INDEXING_API_URL = (
    "https://indexing.googleapis.com/v3/urlNotifications:publish"
)
INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing"

# Google OAuth2 token endpoint
TOKEN_URL = "https://oauth2.googleapis.com/token"


def _get_access_token(service_account_json: str) -> Optional[str]:
    """
    Exchange a service-account JSON key for a short-lived Bearer token.

    Uses google-auth to build a signed JWT assertion, then trades it for
    an access token via the OAuth2 token endpoint.  No extra dependencies
    beyond google-auth (already in requirements.txt).

    Returns the access token string, or None on error.
    """
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request as GoogleRequest

        info = json.loads(service_account_json)
        creds = service_account.Credentials.from_service_account_info(
            info,
            scopes=[INDEXING_SCOPE],
        )
        creds.refresh(GoogleRequest())
        return creds.token
    except Exception as exc:
        logger.error(f"Google auth token fetch failed: {exc}")
        return None


class GoogleIndexingService:
    """
    Submits URLs to the Google Indexing API.

    If GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON is not configured the service
    skips silently — safe to run in dev / staging without credentials.
    """

    def __init__(self) -> None:
        self.sa_json  = settings.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON
        self.site_url = settings.SITE_URL.rstrip("/")
        self._token:    Optional[str] = None
        self._token_at: Optional[datetime] = None

    # ── Token management ───────────────────────────────────────────────────

    def _fresh_token(self) -> Optional[str]:
        """
        Return a valid Bearer token, refreshing if older than 50 minutes.
        (Google tokens last 60 min; we refresh 10 min early.)
        """
        if not self.sa_json:
            return None

        now = datetime.utcnow()
        token_age_minutes = (
            (now - self._token_at).total_seconds() / 60
            if self._token_at
            else 999
        )

        if self._token is None or token_age_minutes >= 50:
            self._token    = _get_access_token(self.sa_json)
            self._token_at = now

        return self._token

    # ── Core submission ────────────────────────────────────────────────────

    def _notify(self, url: str, url_type: str = "URL_UPDATED") -> tuple[bool, str]:
        """
        POST a single URL notification to the Google Indexing API.

        url_type: "URL_UPDATED" (new/changed) | "URL_DELETED" (removed)
        Returns (success, message).
        """
        token = self._fresh_token()
        if not token:
            return False, "Google Indexing API not configured or auth failed"

        try:
            resp = httpx.post(
                INDEXING_API_URL,
                json={"url": url, "type": url_type},
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                timeout=15,
            )

            if resp.status_code == 200:
                data = resp.json()
                notify_time = data.get("urlNotificationMetadata", {}).get(
                    "latestUpdate", {}).get("notifyTime", "")
                return True, f"Google notified (notifyTime={notify_time})"

            # 403 → service account not added as Search Console owner
            # 429 → quota exceeded (200 URLs/day on free tier)
            msg = f"HTTP {resp.status_code}: {resp.text[:300]}"
            logger.warning(f"Google Indexing API non-success for {url}: {msg}")
            return False, msg

        except httpx.TimeoutException:
            msg = "Google Indexing API request timed out"
            logger.warning(msg)
            return False, msg
        except Exception as exc:
            msg = f"Google Indexing API request failed: {exc}"
            logger.error(msg)
            return False, msg

    # ── Public helpers ─────────────────────────────────────────────────────

    def submit_blog_post(self, slug: str) -> tuple[bool, str]:
        """Notify Google about a new / updated blog post."""
        url = f"{self.site_url}/blog/{slug}"
        logger.info(f"Google Indexing: submitting {url}")
        return self._notify(url, "URL_UPDATED")

    def delete_url(self, slug: str) -> tuple[bool, str]:
        """Notify Google that a blog post was removed."""
        url = f"{self.site_url}/blog/{slug}"
        return self._notify(url, "URL_DELETED")

    # ── DB helper: batch-submit pending posts ──────────────────────────────

    def submit_pending_posts(self, db, limit: int = 50) -> dict:
        """
        Submit all published posts where google_submitted=False.

        Google Indexing API free quota: 200 URLs/day.
        Returns { submitted, failed, errors }.
        """
        from app.models.blog import BlogPost

        posts = (
            db.query(BlogPost)
            .filter(
                BlogPost.status == "published",
                BlogPost.google_submitted == False,  # noqa: E712
            )
            .order_by(BlogPost.published_at.desc())
            .limit(limit)
            .all()
        )

        if not posts:
            return {"submitted": 0, "failed": 0, "errors": []}

        submitted = 0
        failed    = 0
        errors: list[str] = []
        now = datetime.utcnow()

        for post in posts:
            ok, msg = self.submit_blog_post(post.slug)
            if ok:
                post.google_submitted    = True
                post.google_submitted_at = now
                submitted += 1
                logger.info(f"Google Indexing OK: {post.slug} — {msg}")
            else:
                failed += 1
                errors.append(f"{post.slug}: {msg}")
                logger.warning(f"Google Indexing failed: {post.slug} — {msg}")

        db.commit()
        return {"submitted": submitted, "failed": failed, "errors": errors}


# ── Singleton ──────────────────────────────────────────────────────────────

google_indexing_service = GoogleIndexingService()
