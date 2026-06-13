"""
Automated blog generation service using Claude AI.

Picks the highest-intent pending keywords from blog_keywords,
generates full SEO-optimised HTML posts, and persists them to
the blog_posts table.  Called once per day by the cron endpoint.

When the keyword table is exhausted the service auto-seeds from
GLOBAL_KEYWORD_BANK so it never runs dry.
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

CATEGORY_MAP: dict[str, str] = {
    "ats":              "resume-tips",
    "resume":           "resume-tips",
    "cv":               "resume-tips",
    "format":           "resume-tips",
    "template":         "resume-tips",
    "cover letter":     "resume-tips",
    "linkedin profile": "resume-tips",
    "interview":        "interview-prep",
    "question":         "interview-prep",
    "answer":           "interview-prep",
    "leetcode":         "interview-prep",
    "coding":           "interview-prep",
    "system design":    "interview-prep",
    "behavioral":       "interview-prep",
    "technical":        "interview-prep",
    "faang":            "interview-prep",
    "hr":               "interview-prep",
    "gd":               "interview-prep",
    "group discussion": "interview-prep",
    "salary negotiat":  "interview-prep",
    "career":           "career-advice",
    "salary":           "career-advice",
    "appraisal":        "career-advice",
    "job search":       "career-advice",
    "remote":           "career-advice",
    "freelance":        "career-advice",
    "promotion":        "career-advice",
    "roadmap":          "career-advice",
    "fresher":          "career-advice",
    "switch":           "career-advice",
    "skills":           "career-advice",
    "portfolio":        "career-advice",
}


# ── Global keyword bank ────────────────────────────────────────────────────
# (keyword, category, search_volume, competition, buyer_intent)
# buyer_intent: 10 = highest (directly drives resume builder signups)

GLOBAL_KEYWORD_BANK: list[tuple] = [

    # ── HIGH-INTENT: Resume builder / ATS tool searches ───────────────────
    ("free ATS resume builder online", "resume-tips", 18000, "medium", 10),
    ("best free resume builder 2025", "resume-tips", 22000, "medium", 10),
    ("ATS resume checker free", "resume-tips", 16000, "medium", 10),
    ("how to increase ATS score resume", "resume-tips", 14000, "medium", 10),
    ("online resume builder free download", "resume-tips", 12000, "medium", 10),
    ("AI resume builder free 2025", "resume-tips", 11000, "medium", 10),
    ("resume optimizer for ATS", "resume-tips", 9500, "medium", 10),
    ("ATS friendly resume maker", "resume-tips", 8800, "medium", 10),
    ("resume scanner ATS check", "resume-tips", 8200, "medium", 10),
    ("free resume builder for software engineers", "resume-tips", 7600, "medium", 10),

    # ── RESUME TIPS — global ──────────────────────────────────────────────
    ("how to write an ATS friendly resume 2025", "resume-tips", 28000, "low", 9),
    ("best resume format for software engineer 2025", "resume-tips", 21000, "medium", 9),
    ("resume summary examples for software engineer", "resume-tips", 18000, "low", 9),
    ("how to write a resume with no experience", "resume-tips", 35000, "low", 8),
    ("resume skills section examples", "resume-tips", 17000, "low", 8),
    ("what to put on a resume for first job", "resume-tips", 25000, "low", 8),
    ("resume action verbs list 2025", "resume-tips", 14000, "low", 7),
    ("how to quantify achievements on resume", "resume-tips", 12000, "medium", 8),
    ("resume length guide one page vs two page", "resume-tips", 16000, "low", 7),
    ("chronological vs functional resume which is better", "resume-tips", 11000, "low", 7),
    ("ATS resume keywords for software developer", "resume-tips", 13000, "medium", 9),
    ("resume for senior software engineer 5 years experience", "resume-tips", 10000, "medium", 8),
    ("resume tips for career change to tech", "resume-tips", 9500, "medium", 8),
    ("how to write a cover letter 2025", "resume-tips", 31000, "low", 8),
    ("resume for data scientist entry level", "resume-tips", 8800, "medium", 9),
    ("resume for product manager 2025", "resume-tips", 8200, "medium", 8),
    ("DevOps engineer resume tips", "resume-tips", 7600, "medium", 9),
    ("resume for remote job application", "resume-tips", 9200, "medium", 8),
    ("cloud engineer resume examples 2025", "resume-tips", 6800, "medium", 8),
    ("how to write a LinkedIn summary 2025", "resume-tips", 19000, "medium", 8),
    ("resume gaps how to explain", "resume-tips", 22000, "low", 7),
    ("references on resume should you include", "resume-tips", 14000, "low", 6),
    ("how to tailor resume to job description", "resume-tips", 18000, "low", 9),
    ("resume for MBA graduate 2025", "resume-tips", 7200, "low", 8),
    ("portfolio vs resume for tech jobs", "resume-tips", 6500, "low", 7),
    ("resume tips for 2025 job market", "resume-tips", 11000, "low", 8),
    ("how to write a resume summary with no experience", "resume-tips", 24000, "low", 8),
    ("machine learning engineer resume tips", "resume-tips", 8400, "medium", 9),
    ("cybersecurity resume tips 2025", "resume-tips", 7100, "medium", 8),
    ("full stack developer resume examples", "resume-tips", 9800, "medium", 9),
    ("data analyst resume tips 2025", "resume-tips", 10500, "medium", 9),
    ("how to add certifications to resume", "resume-tips", 16000, "low", 7),
    ("resume format for internship application", "resume-tips", 13000, "low", 8),

    # ── RESUME TIPS — India market ────────────────────────────────────────
    ("ATS resume format for freshers India", "resume-tips", 8200, "low", 9),
    ("resume format for TCS freshers 2025", "resume-tips", 5200, "low", 9),
    ("Infosys resume format freshers", "resume-tips", 4900, "low", 9),
    ("one page resume format India", "resume-tips", 4400, "medium", 8),
    ("resume for BCA MCA freshers India 2025", "resume-tips", 5100, "low", 8),
    ("engineering fresher resume format India", "resume-tips", 2700, "low", 8),
    ("free ATS resume builder India", "resume-tips", 9500, "medium", 10),
    ("online resume builder India free 2025", "resume-tips", 8900, "medium", 10),
    ("ATS score checker India free", "resume-tips", 7800, "medium", 10),
    ("resume tips for 2 years experience India", "resume-tips", 2900, "low", 7),

    # ── INTERVIEW PREP — global ───────────────────────────────────────────
    ("how to prepare for FAANG interview 2025", "interview-prep", 24000, "medium", 9),
    ("system design interview questions 2025", "interview-prep", 31000, "high", 9),
    ("behavioral interview questions and answers STAR method", "interview-prep", 28000, "low", 8),
    ("LeetCode study plan for beginners 2025", "interview-prep", 22000, "medium", 9),
    ("Amazon leadership principles interview questions", "interview-prep", 18000, "medium", 9),
    ("Google software engineer interview process", "interview-prep", 16000, "medium", 9),
    ("Meta software engineer interview guide", "interview-prep", 13000, "medium", 9),
    ("Microsoft interview questions software engineer", "interview-prep", 11000, "medium", 9),
    ("how to ace a technical interview 2025", "interview-prep", 21000, "low", 8),
    ("data structures and algorithms interview prep guide", "interview-prep", 19000, "medium", 8),
    ("Python interview questions and answers 2025", "interview-prep", 25000, "medium", 8),
    ("JavaScript interview questions 2025", "interview-prep", 23000, "medium", 8),
    ("SQL interview questions for data analyst 2025", "interview-prep", 17000, "medium", 8),
    ("machine learning interview questions 2025", "interview-prep", 15000, "high", 8),
    ("how to answer tell me about yourself software engineer", "interview-prep", 32000, "low", 8),
    ("salary negotiation tips tech jobs 2025", "interview-prep", 19000, "medium", 8),
    ("remote job interview tips 2025", "interview-prep", 14000, "low", 7),
    ("how to answer what is your greatest weakness", "interview-prep", 41000, "low", 7),
    ("coding interview tips for beginners", "interview-prep", 18000, "low", 8),
    ("React JS interview questions 2025", "interview-prep", 20000, "medium", 8),
    ("Node.js interview questions 2025", "interview-prep", 17000, "medium", 8),
    ("cloud architect interview questions AWS Azure", "interview-prep", 11000, "medium", 8),
    ("DevOps interview questions 2025", "interview-prep", 15000, "medium", 8),
    ("how to crack product manager interview", "interview-prep", 12000, "medium", 8),
    ("data science interview questions 2025", "interview-prep", 22000, "medium", 8),
    ("Kubernetes interview questions 2025", "interview-prep", 9500, "medium", 7),
    ("Docker interview questions for DevOps", "interview-prep", 8800, "medium", 7),
    ("how to negotiate compensation package tech", "interview-prep", 16000, "medium", 8),
    ("technical phone screen how to prepare", "interview-prep", 11000, "low", 8),
    ("take home coding challenge tips", "interview-prep", 8200, "low", 7),

    # ── INTERVIEW PREP — India market ─────────────────────────────────────
    ("TCS NQT interview questions and answers 2025", "interview-prep", 9100, "low", 10),
    ("Infosys interview questions for freshers 2025", "interview-prep", 8400, "low", 10),
    ("HR interview questions and answers for freshers", "interview-prep", 7800, "medium", 9),
    ("Wipro interview process freshers 2025", "interview-prep", 6500, "low", 9),
    ("Cognizant interview questions freshers 2025", "interview-prep", 6100, "low", 9),
    ("group discussion topics campus placement 2025", "interview-prep", 5100, "low", 8),
    ("how to crack campus placement interview India", "interview-prep", 4100, "medium", 9),
    ("how to get into MAANG from India", "interview-prep", 3900, "high", 9),
    ("aptitude test preparation TCS NQT", "interview-prep", 3500, "low", 8),
    ("Accenture Capgemini HCL interview questions 2025", "interview-prep", 4600, "low", 9),

    # ── CAREER ADVICE — global ────────────────────────────────────────────
    ("how to get a job at Google 2025", "career-advice", 42000, "medium", 8),
    ("software engineer career roadmap 2025", "career-advice", 28000, "medium", 8),
    ("how to become a senior software engineer", "career-advice", 24000, "medium", 8),
    ("remote software developer jobs how to find 2025", "career-advice", 22000, "medium", 8),
    ("how to transition into tech career no degree", "career-advice", 26000, "medium", 8),
    ("highest paying programming languages 2025", "career-advice", 31000, "medium", 7),
    ("software engineer salary guide 2025", "career-advice", 29000, "medium", 7),
    ("how to get promoted faster in tech", "career-advice", 18000, "low", 7),
    ("freelance software developer how to start 2025", "career-advice", 16000, "medium", 7),
    ("how to build a tech portfolio that gets hired", "career-advice", 19000, "medium", 8),
    ("open source contribution guide for career", "career-advice", 13000, "medium", 7),
    ("networking tips for software developers", "career-advice", 14000, "medium", 7),
    ("AI engineer career path 2025", "career-advice", 21000, "medium", 8),
    ("full stack developer roadmap 2025", "career-advice", 25000, "medium", 8),
    ("cloud computing career guide 2025", "career-advice", 19000, "medium", 8),
    ("data science career path for beginners 2025", "career-advice", 24000, "medium", 8),
    ("cybersecurity career path 2025 beginners", "career-advice", 18000, "medium", 8),
    ("machine learning engineer career path", "career-advice", 16000, "medium", 8),
    ("product manager career guide 2025", "career-advice", 14000, "medium", 8),
    ("how to find a tech job in USA as international student", "career-advice", 12000, "medium", 8),
    ("work life balance tips software engineering", "career-advice", 15000, "low", 6),
    ("imposter syndrome in tech how to overcome", "career-advice", 17000, "low", 6),
    ("bootcamp vs CS degree which is better 2025", "career-advice", 22000, "low", 7),
    ("how to get remote job with international company", "career-advice", 13000, "medium", 8),
    ("tech layoffs how to bounce back 2025", "career-advice", 11000, "low", 7),
    ("side projects that impress interviewers 2025", "career-advice", 12000, "medium", 7),
    ("GitHub profile tips to get hired", "career-advice", 14000, "medium", 7),
    ("how to ask for a raise in tech 2025", "career-advice", 18000, "low", 6),
    ("developer burnout how to deal with it", "career-advice", 14000, "low", 5),
    ("startup vs big tech which to choose 2025", "career-advice", 19000, "low", 6),
    ("AWS certification worth it for career 2025", "career-advice", 16000, "medium", 7),
    ("Google certification career impact 2025", "career-advice", 11000, "medium", 7),
    ("best online courses to get a software job 2025", "career-advice", 21000, "medium", 7),
    ("how to get first software job without experience", "career-advice", 28000, "medium", 8),
    ("entry level developer job search tips 2025", "career-advice", 18000, "medium", 8),
    ("how to stand out as a software developer job seeker", "career-advice", 13000, "medium", 8),
    ("cold emailing recruiters template that works", "career-advice", 12000, "low", 7),

    # ── CAREER ADVICE — India market ──────────────────────────────────────
    ("how to get first job after engineering India", "career-advice", 8800, "medium", 9),
    ("how to switch IT company India 2025", "career-advice", 7600, "medium", 9),
    ("highest paying IT jobs India 2025", "career-advice", 6800, "medium", 8),
    ("LinkedIn profile tips for freshers India", "career-advice", 6000, "medium", 8),
    ("off campus placement tips India 2025", "career-advice", 5300, "low", 9),
    ("data science career path India fresher", "career-advice", 5900, "medium", 9),
    ("DevOps engineer salary India 2025", "career-advice", 5100, "medium", 8),
    ("AI ML engineer career path India", "career-advice", 4800, "medium", 8),
    ("how to get remote job India international", "career-advice", 4500, "medium", 9),
    ("full stack developer roadmap India fresher", "career-advice", 3700, "medium", 8),
    ("how to get job in product startup India 2025", "career-advice", 1800, "low", 8),
    ("career after 10 years gap India", "career-advice", 3000, "low", 8),
    ("GATE vs job which is better India CSE", "career-advice", 2700, "low", 7),
    ("how to become software architect India", "career-advice", 2500, "medium", 7),
    ("appraisal tips for IT professionals India", "career-advice", 1900, "low", 7),
]


# ── Helpers ────────────────────────────────────────────────────────────────

def _slugify(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-{2,}", "-", slug)
    return slug[:100].strip("-")


def _infer_category(keyword: str, kw_category: Optional[str]) -> str:
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
    text = re.sub(r"<[^>]+>", " ", html)
    word_count = len(text.split())
    return max(3, round(word_count / 200))


def _count_words(html: str) -> int:
    text = re.sub(r"<[^>]+>", " ", html)
    return len(text.split())


def _auto_seed_keywords(db: Session) -> int:
    """
    Seed GLOBAL_KEYWORD_BANK into blog_keywords, skipping duplicates.
    Returns the number of rows inserted.
    """
    inserted = 0
    for keyword, category, volume, competition, intent in GLOBAL_KEYWORD_BANK:
        exists = db.query(BlogKeyword).filter(BlogKeyword.keyword == keyword).first()
        if not exists:
            db.add(BlogKeyword(
                keyword=keyword,
                category=category,
                search_volume=volume,
                competition=competition,
                buyer_intent=intent,
                status="pending",
            ))
            inserted += 1
    db.commit()
    logger.info(f"Auto-seeded {inserted} new keywords into blog_keywords")
    return inserted


# ── Claude prompt ──────────────────────────────────────────────────────────

CONTENT_DELIMITER = "===HTML_CONTENT==="

SYSTEM_PROMPT = f"""\
You are an expert career coach and SEO content writer with deep knowledge of \
the global job market — covering the US, UK, Canada, Australia, Europe, and \
India.  You write comprehensive, actionable blog posts for an international \
audience of job seekers: from fresh graduates to senior professionals, across \
all geographies.

Your posts MUST:
- Be at least 1 500 words of readable prose (excluding HTML tags)
- Use clean, semantic HTML (h2, h3, p, ul/ol, strong, blockquote only — \
  NO inline styles, NO divs)
- Include concrete, real-world examples using globally recognised companies \
  (Google, Amazon, Microsoft, Apple, Meta, Stripe, Shopify, etc.) AND \
  regionally relevant examples where the keyword demands it (TCS, Infosys, \
  Wipro, Tata, Cognizant for India-focused keywords)
- Address both global best practices AND call out regional nuances where \
  relevant (US resume vs UK CV format differences, visa considerations, etc.)
- Weave the primary keyword and LSI variants naturally — no keyword stuffing
- Add 1–2 internal CTAs linking to {SITE_URL}/builder \
  (anchor text like "build your free ATS-optimised resume" — no bare URLs)

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

Audience: global job seekers (primary focus: English-speaking markets — US, UK, \
Canada, Australia). Include India-specific context only if the keyword is \
clearly India-focused (contains "India", "TCS", "Infosys", "fresher", etc.).

JSON field rules:
- title: ≤60 chars, includes primary keyword, avoid clickbait
- slug: url-safe slug derived from title
- excerpt: 155-160 chars, includes keyword, ends with a hook
- meta_description: 150-160 chars for Google snippet
- tags: 5 relevant tags as a JSON array
- lsi_keywords: 3-5 LSI keyword phrases as a JSON array

HTML content rules (after the {delimiter} line):
1. Open with <p class="lead">one punchy sentence that hooks the reader</p>
2. Use <h2> for major sections, <h3> for sub-sections
3. Use <ul> or <ol> for lists — never bare text lists
4. Bold key terms with <strong>
5. Add one CTA: <p class="cta-inline"><a href="{site}/builder">anchor text</a></p>
6. Close with <h2>Conclusion</h2>
7. NO inline styles, NO <div>, NO <img>, NO markdown
8. Minimum 1 500 words of actual prose — this is non-negotiable
""".format(
    keyword="{keyword}",
    category="{category}",
    lsi="{lsi}",
    delimiter=CONTENT_DELIMITER,
    site=SITE_URL,
)


# ── Service class ──────────────────────────────────────────────────────────

class BlogGeneratorService:

    def __init__(self) -> None:
        self.client     = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model      = "claude-sonnet-4-6"
        self.max_tokens = 8000

    @retry(
        retry=retry_if_exception_type((APITimeoutError, RateLimitError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=5, max=30),
    )
    def _call_claude(self, keyword: str, category: str, lsi: list[str]) -> dict:
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

        if CONTENT_DELIMITER in raw:
            parts = raw.split(CONTENT_DELIMITER, 1)
            meta_raw     = parts[0].strip()
            html_content = parts[1].strip()
        else:
            logger.warning(f"Delimiter not found for '{keyword}', attempting fallback parse")
            meta_raw     = raw
            html_content = ""

        if meta_raw.startswith("```"):
            meta_raw = re.sub(r"^```[a-z]*\n?", "", meta_raw)
            meta_raw = meta_raw.rstrip("`").strip()

        try:
            data = json.loads(meta_raw)
        except json.JSONDecodeError:
            m = re.search(r"(\{[^{}]*\})", meta_raw, re.DOTALL)
            if m:
                data = json.loads(m.group(1))
            else:
                logger.error(
                    f"Failed to parse metadata JSON for '{keyword}'. "
                    f"Raw (first 300 chars): {meta_raw[:300]}"
                )
                raise

        if not html_content and "data" in locals():
            json_end = meta_raw.rfind("}")
            if json_end != -1:
                html_content = meta_raw[json_end + 1:].strip()

        data["content"] = html_content
        return data

    def generate_post(self, kw: BlogKeyword, db: Session) -> BlogPost:
        category = (
            kw.category
            if kw.category in VALID_CATEGORIES
            else _infer_category(kw.keyword, kw.category)
        )
        lsi: list[str] = []

        data = self._call_claude(kw.keyword, category, lsi)

        base_slug = _slugify(data.get("slug") or _slugify(data["title"]))
        slug      = base_slug
        attempt   = 0
        while db.query(BlogPost).filter(BlogPost.slug == slug).first():
            attempt += 1
            slug = f"{base_slug}-{datetime.utcnow().strftime('%Y%m%d')}"
            if attempt > 1:
                slug = f"{base_slug}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        content: str      = data["content"]
        tags: list[str]   = data.get("tags", [kw.keyword])[:8]
        lsi_kw: list[str] = data.get("lsi_keywords", [])[:10]

        post = BlogPost(
            slug               = slug,
            title              = data["title"][:255],
            excerpt            = data.get("excerpt", "")[:500],
            content            = content,
            category           = category,
            tags               = tags,
            author             = AUTHOR,
            read_time          = _estimate_read_time(content),
            featured           = False,
            status             = "published",
            meta_description   = data.get("meta_description", data.get("excerpt", ""))[:160],
            primary_keyword    = kw.keyword,
            lsi_keywords       = lsi_kw,
            word_count         = _count_words(content),
            indexnow_submitted = False,
            google_submitted   = False,
            published_at       = datetime.utcnow(),
        )

        db.add(post)
        db.flush()

        kw.status  = "used"
        kw.used_at = datetime.utcnow()
        kw.blog_id = post.id

        logger.info(
            f"Generated post '{post.title}' "
            f"(slug={post.slug}, words={post.word_count}, read={post.read_time}min)"
        )
        return post

    def run_daily_generation(
        self,
        db: Session,
        count: int = 3,
    ) -> BlogDailyReport:
        today = datetime.utcnow().date()

        report = db.query(BlogDailyReport).filter(
            BlogDailyReport.report_date == today
        ).first()
        if not report:
            report = BlogDailyReport(
                report_date           = today,
                blogs_generated       = 0,
                blogs_published       = 0,
                indexnow_submitted    = 0,
                indexnow_success      = 0,
                google_submitted      = 0,
                google_success        = 0,
                sitemap_updated       = False,
                keywords_used         = [],
                total_blogs_published = db.query(BlogPost).filter(
                    BlogPost.status == "published"
                ).count(),
                errors                = [],
            )
            db.add(report)
            db.flush()

        keywords = (
            db.query(BlogKeyword)
            .filter(BlogKeyword.status == "pending")
            .order_by(BlogKeyword.buyer_intent.desc())
            .limit(count)
            .all()
        )

        # ── Auto-seed when keyword bank is exhausted ──────────────────────
        if not keywords:
            logger.warning("No pending keywords found — auto-seeding global keyword bank")
            seeded = _auto_seed_keywords(db)
            if seeded > 0:
                keywords = (
                    db.query(BlogKeyword)
                    .filter(BlogKeyword.status == "pending")
                    .order_by(BlogKeyword.buyer_intent.desc())
                    .limit(count)
                    .all()
                )
            if not keywords:
                logger.error("Auto-seed produced 0 new keywords — all entries already exist and are used")
                db.commit()
                return report

        logger.info(
            f"Generating {len(keywords)} blog posts: "
            f"{[kw.keyword for kw in keywords]}"
        )

        errors: list[str]        = list(report.errors or [])
        keywords_used: list[str] = list(report.keywords_used or [])
        generated: list[BlogPost] = []

        for kw in keywords:
            try:
                post = self.generate_post(kw, db)
                report.blogs_generated += 1
                report.blogs_published += 1
                keywords_used.append(kw.keyword)
                generated.append(post)
            except json.JSONDecodeError as exc:
                msg = f"JSON parse error for '{kw.keyword}': {exc}"
                logger.error(msg)
                errors.append(msg)
                kw.status = "skipped"
            except (APIError, APITimeoutError, RateLimitError) as exc:
                msg = f"Claude API error for '{kw.keyword}': {exc}"
                logger.error(msg)
                errors.append(msg)
            except Exception as exc:
                msg = f"Unexpected error for '{kw.keyword}': {exc}"
                logger.error(msg)
                errors.append(msg)
                kw.status = "skipped"

        report.keywords_used         = keywords_used
        report.errors                = errors
        report.total_blogs_published = db.query(BlogPost).filter(
            BlogPost.status == "published"
        ).count()

        db.commit()
        logger.info(f"Committed {len(generated)} post(s) to DB")

        # ── Ping search engines ───────────────────────────────────────────
        now = datetime.utcnow()

        if generated:
            indexnow_urls = [
                f"{indexnow_service.site_url}/blog/{p.slug}" for p in generated
            ]
            ok, msg = indexnow_service.submit_urls(indexnow_urls)
            for post in generated:
                report.indexnow_submitted += 1
                if ok:
                    post.indexnow_submitted    = True
                    post.indexnow_submitted_at = now
                    report.indexnow_success   += 1
                else:
                    errors.append(f"IndexNow failed for {post.slug}: {msg}")
            logger.info(f"IndexNow batch ({len(indexnow_urls)} URLs): {msg}")

        for post in generated:
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

        report.errors = errors
        db.commit()
        logger.info(
            f"Daily generation complete — "
            f"published={report.blogs_published}, errors={len(errors)}"
        )
        return report


blog_generator = BlogGeneratorService()
