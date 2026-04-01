import logging
import os
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import get_settings
from app.services.drip_service import process_drip_emails, DRIP_EMAIL_SUBJECTS, DRIP_TEMPLATE_NAMES, _build_drip_text
from app.services.email_service import email_service
from app.services.blog_generator import blog_generator
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

    KEYWORDS = [
        ("ATS resume format for freshers", "resume-tips", 8200, "low", 9),
        ("how to make ATS friendly resume", "resume-tips", 7400, "low", 9),
        ("ATS resume checker free India", "resume-tips", 6100, "medium", 9),
        ("best resume format for software engineer India", "resume-tips", 5800, "medium", 8),
        ("resume format for TCS freshers 2025", "resume-tips", 5200, "low", 9),
        ("Infosys resume format freshers", "resume-tips", 4900, "low", 9),
        ("Wipro resume tips fresher", "resume-tips", 4600, "low", 8),
        ("one page resume format India", "resume-tips", 4400, "medium", 8),
        ("resume skills section for IT freshers", "resume-tips", 4100, "low", 8),
        ("how to write summary in resume for freshers", "resume-tips", 3900, "low", 8),
        ("resume action words for IT professionals", "resume-tips", 3700, "low", 7),
        ("how to list projects in resume fresher", "resume-tips", 3500, "low", 8),
        ("resume format for MBA freshers India", "resume-tips", 3300, "low", 8),
        ("BCA resume format for freshers 2025", "resume-tips", 3100, "low", 8),
        ("MCA resume format for freshers 2025", "resume-tips", 3000, "low", 8),
        ("resume tips for 2 years experience India", "resume-tips", 2900, "low", 7),
        ("how to write quantifiable achievements in resume", "resume-tips", 2800, "medium", 7),
        ("engineering fresher resume format India", "resume-tips", 2700, "low", 8),
        ("resume gaps how to explain India", "resume-tips", 2600, "low", 7),
        ("ATS keywords for software developer resume", "resume-tips", 2500, "medium", 8),
        ("best font for resume India", "resume-tips", 2400, "low", 6),
        ("how to write objective in resume for fresher", "resume-tips", 2300, "low", 7),
        ("resume format for data analyst India", "resume-tips", 2200, "medium", 8),
        ("how to add certifications in resume India", "resume-tips", 2100, "low", 7),
        ("resume dos and don'ts India 2025", "resume-tips", 2000, "low", 7),
        ("TCS NQT interview questions and answers", "interview-prep", 9100, "low", 10),
        ("Infosys interview questions for freshers 2025", "interview-prep", 8400, "low", 10),
        ("HR interview questions and answers for freshers", "interview-prep", 7800, "medium", 9),
        ("top interview questions for software engineer India", "interview-prep", 7100, "medium", 9),
        ("Wipro interview process freshers", "interview-prep", 6500, "low", 9),
        ("Cognizant interview questions freshers 2025", "interview-prep", 6100, "low", 9),
        ("tell me about yourself answer for fresher IT", "interview-prep", 5800, "medium", 8),
        ("technical interview questions for Java developer India", "interview-prep", 5400, "medium", 9),
        ("group discussion topics for campus placement 2025", "interview-prep", 5100, "low", 8),
        ("Accenture interview questions freshers", "interview-prep", 4900, "low", 9),
        ("Capgemini interview questions 2025", "interview-prep", 4600, "low", 9),
        ("HCL interview process freshers India", "interview-prep", 4300, "low", 8),
        ("how to crack campus placement interview India", "interview-prep", 4100, "medium", 9),
        ("Python interview questions for freshers India", "interview-prep", 3900, "medium", 8),
        ("SQL interview questions for data analyst India", "interview-prep", 3700, "medium", 8),
        ("aptitude test preparation for TCS NQT", "interview-prep", 3500, "low", 8),
        ("body language tips for interview India", "interview-prep", 3300, "low", 7),
        ("what to wear to interview India fresher", "interview-prep", 3100, "low", 6),
        ("how to answer why should we hire you fresher", "interview-prep", 2900, "medium", 8),
        ("React JS interview questions India 2025", "interview-prep", 2800, "medium", 8),
        ("Node.js interview questions for freshers India", "interview-prep", 2600, "medium", 8),
        ("system design interview preparation India", "interview-prep", 2500, "high", 8),
        ("how to negotiate salary fresher India", "interview-prep", 2400, "low", 8),
        ("common mistakes in HR interview India", "interview-prep", 2200, "low", 7),
        ("mock interview tips India engineering college", "interview-prep", 2100, "low", 7),
        ("how to get first job after engineering India", "career-advice", 8800, "medium", 9),
        ("how to switch IT company India 2025", "career-advice", 7600, "medium", 9),
        ("career options after BCA India 2025", "career-advice", 7100, "low", 8),
        ("highest paying IT jobs India 2025", "career-advice", 6800, "medium", 8),
        ("how to get job in Google India", "career-advice", 6400, "medium", 8),
        ("LinkedIn profile tips for freshers India", "career-advice", 6000, "medium", 8),
        ("how to write cold email to recruiter India", "career-advice", 5600, "low", 8),
        ("off campus placement tips India 2025", "career-advice", 5300, "low", 9),
        ("freelancing vs full time job India fresh graduate", "career-advice", 5000, "low", 7),
        ("how to get internship in top MNC India", "career-advice", 4800, "medium", 9),
        ("salary hike tips India IT professional", "career-advice", 4500, "low", 8),
        ("best certifications for software engineer India 2025", "career-advice", 4300, "medium", 8),
        ("work from home IT jobs for freshers India", "career-advice", 4100, "low", 8),
        ("how to crack MAANG interview India", "career-advice", 3900, "high", 9),
        ("career growth in TCS vs startup India", "career-advice", 3600, "low", 7),
        ("how to build portfolio for software developer India", "career-advice", 3400, "medium", 8),
        ("GitHub profile tips for fresher India", "career-advice", 3200, "low", 7),
        ("career after 10 years gap India", "career-advice", 3000, "low", 8),
        ("how to ask for promotion India IT", "career-advice", 2800, "low", 7),
        ("networking tips for job seekers India", "career-advice", 2600, "medium", 7),
        ("job search strategy for experienced IT professional India", "career-advice", 2500, "medium", 8),
        ("how to ace Naukri profile India", "career-advice", 2300, "low", 7),
        ("best job boards India IT 2025", "career-advice", 2200, "low", 7),
        ("how to handle job rejection India", "career-advice", 2000, "low", 6),
        ("work life balance IT industry India tips", "career-advice", 1900, "low", 6),
        ("free ATS resume builder India", "resume-tips", 9500, "medium", 10),
        ("online resume builder India free 2025", "resume-tips", 8900, "medium", 10),
        ("resume builder for freshers India", "resume-tips", 8300, "medium", 10),
        ("ATS score checker India free", "resume-tips", 7800, "medium", 10),
        ("how to increase ATS score resume India", "resume-tips", 7200, "medium", 9),
        ("TCS digital profile tips 2025", "interview-prep", 6700, "low", 9),
        ("campus placement preparation guide India 2025", "interview-prep", 6300, "medium", 9),
        ("data science career path India fresher", "career-advice", 5900, "medium", 9),
        ("cloud computing career India 2025", "career-advice", 5500, "medium", 8),
        ("DevOps engineer salary India 2025", "career-advice", 5100, "medium", 8),
        ("AI ML engineer career path India", "career-advice", 4800, "medium", 8),
        ("how to get remote job India international", "career-advice", 4500, "medium", 9),
        ("upskilling tips for IT professionals India", "career-advice", 4200, "low", 7),
        ("product manager career path India 2025", "career-advice", 3900, "medium", 8),
        ("full stack developer roadmap India fresher", "career-advice", 3700, "medium", 8),
        ("cybersecurity career India 2025", "career-advice", 3400, "medium", 8),
        ("blockchain developer career India", "career-advice", 3100, "medium", 7),
        ("internship to full time conversion tips India", "career-advice", 2900, "low", 8),
        ("GATE vs job which is better India CSE", "career-advice", 2700, "low", 7),
        ("how to become software architect India", "career-advice", 2500, "medium", 7),
        ("resume for career change IT to management India", "resume-tips", 2300, "low", 8),
        ("how to mention notice period in resume India", "resume-tips", 2100, "low", 7),
        ("interview questions for team lead India", "interview-prep", 2000, "medium", 8),
        ("appraisal tips for IT professionals India", "career-advice", 1900, "low", 7),
        ("how to get job in product startup India 2025", "career-advice", 1800, "low", 8),
    ]

    inserted = skipped = 0
    for keyword, category, volume, competition, intent in KEYWORDS:
        if db.query(BlogKeyword).filter(BlogKeyword.keyword == keyword).first():
            skipped += 1
            continue
        db.add(BlogKeyword(
            keyword=keyword, category=category,
            search_volume=volume, competition=competition,
            buyer_intent=intent, status="pending",
        ))
        inserted += 1

    db.commit()
    pending = db.query(BlogKeyword).filter(BlogKeyword.status == "pending").count()

    return {
        "status": "ok",
        "inserted": inserted,
        "skipped": skipped,
        "total_pending": pending,
    }
