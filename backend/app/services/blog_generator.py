"""
Automated blog generation service using Claude AI.

Picks the highest-intent pending keywords from blog_keywords,
generates full SEO-optimised HTML posts, and persists them to
the blog_posts table.  Called once per day by the cron endpoint.
"""

import json
import logging
import re
import time
from datetime import datetime
from typing import Optional

from anthropic import Anthropic, APIError, APITimeoutError, RateLimitError
from sqlalchemy.orm import Session
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.config import get_settings
from app.models.blog import BlogDailyReport, BlogKeyword, BlogPost
from app.services.indexnow_service import indexnow_service
from app.services.google_indexing_service import google_indexing_service

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Constants ──────────────────────────────────────────────────────────────

SITE_URL = settings.SITE_URL
AUTHOR   = "Resume Builder Team"

VALID_CATEGORIES = {"resume-tips", "interview-prep", "career-advice"}

# Map broad keyword categories → blog categories
CATEGORY_MAP: dict[str, str] = {
    "ats":            "resume-tips",
    "resume":         "resume-tips",
    "cv":             "resume-tips",
    "format":         "resume-tips",
    "template":       "resume-tips",
    "interview":      "interview-prep",
    "question":       "interview-prep",
    "answer":         "interview-prep",
    "hr":             "interview-prep",
    "gd":             "interview-prep",
    "group discussion": "interview-prep",
    "career":         "career-advice",
    "salary":         "career-advice",
    "appraisal":      "career-advice",
    "job search":     "career-advice",
    "linkedin":       "career-advice",
    "fresher":        "career-advice",
    "switch":         "career-advice",
}


# ── Helpers ────────────────────────────────────────────────────────────────

def _slugify(text: str) -> str:
    """Convert title text to a URL-safe slug."""
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-{2,}", "-", slug)
    return slug[:100].strip("-")


def _infer_category(keyword: str, kw_category: Optional[str]) -> str:
    """Guess the blog category from the keyword text."""
    kw_lower = keyword.lower()
    for fragment, cat in CATEGORY_MAP.items():
        if fragment in kw_lower:
            return cat
    if kw_category:
        for fragment, cat in CATEGORY_MAP.items():
            if fragment in kw_category.lower():
                return cat
    return "career-advice"


def _estimate_read_time(html: str) -> int:
    """Estimate read time in minutes from HTML content (200 wpm)."""
    text = re.sub(r"<[^>]+>", " ", html)
    word_count = len(text.split())
    return max(3, round(word_count / 200))


def _count_words(html: str) -> int:
    text = re.sub(r"<[^>]+>", " ", html)
    return len(text.split())


# ── Claude prompt ──────────────────────────────────────────────────────────

CONTENT_DELIMITER = "===HTML_CONTENT==="

SYSTEM_PROMPT = f"""\
You are an expert career coach and SEO content writer specialising in the \
Indian job market.  You write in-depth, actionable blog posts targeting \
Indian job seekers (freshers and experienced professionals).

Your posts MUST:
- Be at least 1 500 words of readable prose (excluding HTML tags)
- Use clean, semantic HTML (h2, h3, p, ul/ol, strong, blockquote only — \
  NO inline styles, NO divs)
- Include specific, real-world Indian examples (TCS, Infosys, Wipro, \
  Cognizant, Flipkart, etc.)
- Weave the primary keyword and LSI variants naturally into the text
- Add 1–2 internal CTAs linking to {SITE_URL}/builder \
  (anchor text like "build your free ATS resume" — no bare URLs)

RESPONSE FORMAT — follow this EXACTLY (no deviations):
1. First output a JSON object (no markdown fences) with these keys ONLY:
   title, slug, excerpt, meta_description, tags, lsi_keywords
2. Then output the exact line:  {CONTENT_DELIMITER}
3. Then output the full HTML article

Example structure:
{{"title":"...","slug":"...","excerpt":"...","meta_description":"...","tags":[...],"lsi_keywords":[...]}}
{CONTENT_DELIMITER}
<p class="lead">...</p>
<h2>...</h2>
...
"""

USER_PROMPT_TEMPLATE = """\
Write a comprehensive blog post targeting the keyword: "{keyword}"

Category hint: {category}
LSI / related keywords to weave in: {lsi}

JSON field rules:
- title: ≤60 chars, includes primary keyword
- slug: url-safe slug derived from title
- excerpt: 155-160 chars, includes keyword, ends with a hook
- meta_description: 150-160 chars for Google snippet
- tags: 5 relevant tags as a JSON array
- lsi_keywords: 3-5 LSI keyword phrases as a JSON array

HTML content rules (after the {delimiter} line):
1. Open with <p class="lead">one punchy sentence</p>
2. Use <h2> for major sections, <h3> for sub-sections
3. Use <ul> or <ol> for lists — never bare text lists
4. Bold key terms with <strong>
5. Add one CTA: <p class="cta-inline"><a href="{site}/builder">anchor text</a></p>
6. Close with <h2>Conclusion</h2>
7. NO inline styles, NO <div>, NO <img>, NO markdown
""".format(
    keyword="{keyword}",
    category="{category}",
    lsi="{lsi}",
    delimiter=CONTENT_DELIMITER,
    site=SITE_URL,
)


# ── Service class ──────────────────────────────────────────────────────────

class BlogGeneratorService:
    """
    Generates SEO blog posts via Claude and persists them to PostgreSQL.

    Usage:
        svc = BlogGeneratorService()
        report = svc.run_daily_generation(db, count=3)
    """

    def __init__(self) -> None:
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model  = "claude-sonnet-4-6"   # latest Claude 4.6 Sonnet
        self.max_tokens = 8000

    # ── Internal Claude call ───────────────────────────────────────────────

    @retry(
        retry=retry_if_exception_type((APITimeoutError, RateLimitError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=5, max=30),
    )
    def _call_claude(self, keyword: str, category: str, lsi: list[str]) -> dict:
        """
        Call Claude and return a dict with blog metadata + HTML content.

        Uses a delimiter-based response format to avoid JSON escaping issues
        with HTML content (double quotes in class="..." attributes).
        """
        user_prompt = USER_PROMPT_TEMPLATE.format(
            keyword=keyword,
            category=category,
            lsi=", ".join(lsi) if lsi else keyword,
        )

        t0 = time.time()
        resp = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )
        elapsed = time.time() - t0
        logger.info(f"Claude blog generation for '{keyword}' took {elapsed:.1f}s")

        raw = resp.content[0].text.strip()

        # ── Split on delimiter ────────────────────────────────────────────
        if CONTENT_DELIMITER in raw:
            parts = raw.split(CONTENT_DELIMITER, 1)
            meta_raw = parts[0].strip()
            html_content = parts[1].strip()
        else:
            # Fallback: try to extract JSON + remaining text as content
            logger.warning(
                f"Delimiter not found for '{keyword}', attempting fallback parse"
            )
            meta_raw = raw
            html_content = ""

        # ── Strip any stray markdown fences from the JSON part ────────────
        if meta_raw.startswith("```"):
            meta_raw = re.sub(r"^```[a-z]*\n?", "", meta_raw)
            meta_raw = meta_raw.rstrip("`").strip()

        # ── Parse metadata JSON ───────────────────────────────────────────
        try:
            data = json.loads(meta_raw)
        except json.JSONDecodeError:
            # Last-ditch: find the first complete {...} block
            m = re.search(r"(\{[^{}]*\})", meta_raw, re.DOTALL)
            if m:
                data = json.loads(m.group(1))
            else:
                logger.error(
                    f"Failed to parse metadata JSON for '{keyword}'. "
                    f"Raw (first 300 chars): {meta_raw[:300]}"
                )
                raise

        # ── If delimiter was missing, try to split JSON from the HTML ─────
        if not html_content and "data" in locals():
            # Try: everything after the closing } of the JSON is HTML
            json_end = meta_raw.rfind("}")
            if json_end != -1:
                html_content = meta_raw[json_end + 1:].strip()

        data["content"] = html_content
        return data

    # ── Generate one post ──────────────────────────────────────────────────

    def generate_post(self, kw: BlogKeyword, db: Session) -> BlogPost:
        """
        Generate a single blog post from a BlogKeyword row.

        Raises ValueError if the slug already exists.
        Raises on Claude/network errors (caller handles and logs).
        """
        category = (
            kw.category
            if kw.category in VALID_CATEGORIES
            else _infer_category(kw.keyword, kw.category)
        )
        lsi: list[str] = []  # could be extended later

        data = self._call_claude(kw.keyword, category, lsi)

        # Ensure slug is unique — append date suffix if needed
        base_slug = _slugify(data.get("slug") or _slugify(data["title"]))
        slug = base_slug
        attempt = 0
        while db.query(BlogPost).filter(BlogPost.slug == slug).first():
            attempt += 1
            slug = f"{base_slug}-{datetime.utcnow().strftime('%Y%m%d')}"
            if attempt > 1:
                slug = f"{base_slug}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        content: str = data["content"]
        tags: list[str] = data.get("tags", [kw.keyword])[:8]
        lsi_kw: list[str] = data.get("lsi_keywords", [])[:10]

        post = BlogPost(
            slug             = slug,
            title            = data["title"][:255],
            excerpt          = data.get("excerpt", "")[:500],
            content          = content,
            category         = category,
            tags             = tags,
            author           = AUTHOR,
            read_time        = _estimate_read_time(content),
            featured         = False,
            status           = "published",
            meta_description = data.get("meta_description", data.get("excerpt", ""))[:160],
            primary_keyword  = kw.keyword,
            lsi_keywords     = lsi_kw,
            word_count       = _count_words(content),
            indexnow_submitted = False,
            google_submitted   = False,
            published_at     = datetime.utcnow(),
        )

        db.add(post)
        db.flush()  # get id without committing

        # Mark keyword used
        kw.status  = "used"
        kw.used_at = datetime.utcnow()
        kw.blog_id = post.id

        logger.info(
            f"Generated post '{post.title}' (slug={post.slug}, "
            f"words={post.word_count}, read={post.read_time}min)"
        )
        return post

    # ── Daily run ─────────────────────────────────────────────────────────

    def run_daily_generation(
        self,
        db: Session,
        count: int = 3,
    ) -> BlogDailyReport:
        """
        Main entry point called by the cron endpoint.

        Picks `count` highest-intent pending keywords, generates a post for
        each, commits, and returns a BlogDailyReport.
        """
        today = datetime.utcnow().date()

        # ── Upsert daily report ──────────────────────────────────────────
        report = db.query(BlogDailyReport).filter(
            BlogDailyReport.report_date == today
        ).first()
        if not report:
            report = BlogDailyReport(
                report_date          = today,
                blogs_generated      = 0,
                blogs_published      = 0,
                indexnow_submitted   = 0,
                indexnow_success     = 0,
                google_submitted     = 0,
                google_success       = 0,
                sitemap_updated      = False,
                keywords_used        = [],
                total_blogs_published= db.query(BlogPost).filter(
                    BlogPost.status == "published"
                ).count(),
                errors               = [],
            )
            db.add(report)
            db.flush()

        # ── Pick keywords ────────────────────────────────────────────────
        keywords = (
            db.query(BlogKeyword)
            .filter(BlogKeyword.status == "pending")
            .order_by(BlogKeyword.buyer_intent.desc())
            .limit(count)
            .all()
        )

        if not keywords:
            logger.warning("No pending keywords found — skipping generation")
            db.commit()
            return report

        logger.info(f"Generating {len(keywords)} blog posts: "
                    f"{[kw.keyword for kw in keywords]}")

        errors: list[str] = list(report.errors or [])
        keywords_used: list[str] = list(report.keywords_used or [])

        for kw in keywords:
            try:
                post = self.generate_post(kw, db)
                report.blogs_generated += 1
                report.blogs_published += 1
                keywords_used.append(kw.keyword)

                # ── IndexNow: ping Bing immediately after publish ─────────
                now = datetime.utcnow()
                ok, msg = indexnow_service.submit_blog_post(post.slug)
                if ok:
                    post.indexnow_submitted    = True
                    post.indexnow_submitted_at = now
                    report.indexnow_submitted += 1
                    report.indexnow_success   += 1
                    logger.info(f"IndexNow: {msg}")
                else:
                    report.indexnow_submitted += 1
                    errors.append(f"IndexNow failed for {post.slug}: {msg}")

                # ── Google: notify Search Console Indexing API ────────────
                g_ok, g_msg = google_indexing_service.submit_blog_post(post.slug)
                if g_ok:
                    post.google_submitted    = True
                    post.google_submitted_at = now
                    report.google_submitted += 1
                    report.google_success   += 1
                    logger.info(f"Google Indexing: {g_msg}")
                else:
                    report.google_submitted += 1
                    errors.append(f"Google Indexing failed for {post.slug}: {g_msg}")

            except json.JSONDecodeError as exc:
                msg = f"JSON parse error for '{kw.keyword}': {exc}"
                logger.error(msg)
                errors.append(msg)
                kw.status = "skipped"
            except (APIError, APITimeoutError, RateLimitError) as exc:
                msg = f"Claude API error for '{kw.keyword}': {exc}"
                logger.error(msg)
                errors.append(msg)
                # Don't mark as skipped — retry next run
            except Exception as exc:
                msg = f"Unexpected error for '{kw.keyword}': {exc}"
                logger.error(msg)
                errors.append(msg)
                kw.status = "skipped"

        report.keywords_used        = keywords_used
        report.errors               = errors
        report.total_blogs_published = db.query(BlogPost).filter(
            BlogPost.status == "published"
        ).count()

        db.commit()
        logger.info(
            f"Daily generation complete — "
            f"published={report.blogs_published}, errors={len(errors)}"
        )
        return report


# ── Singleton ──────────────────────────────────────────────────────────────

blog_generator = BlogGeneratorService()
