"""
Remote Jobs Route.

Primary source: Adzuna API (millions of jobs, server-side pagination).
Fallback: Remotive API (remote-only, ~300 jobs).
Results cached in Redis for 30 minutes.
"""

import re
import json
import hashlib
import httpx
import logging
from fastapi import APIRouter, Query, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import app.services.redis_service as redis_service_module
from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.services.claude_service import claude_service
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()

ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs"
REMOTIVE_API = "https://remotive.com/api/remote-jobs"
CACHE_TTL = 1800  # 30 minutes

# Map our frontend categories → Adzuna category tags
CATEGORY_MAP = {
    "software-dev": "it-jobs",
    "design": "it-jobs",
    "marketing": "marketing-jobs",
    "customer-service": "customer-services-jobs",
    "data": "it-jobs",
    "devops-sysadmin": "it-jobs",
    "product": "it-jobs",
    "sales": "sales-jobs",
    "finance-legal": "accounting-finance-jobs",
    "human-resources": "hr-jobs",
}


def _strip_html(html: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', html or '')
    return re.sub(r'\s+', ' ', text).strip()


async def _get_adzuna_jobs(
    search: str,
    category: str,
    page: int,
    per_page: int,
    country: str,
) -> dict:
    """Fetch jobs from Adzuna API."""
    # Always include "remote" to surface remote-friendly roles.
    # If user has a search term, combine it: "python remote"; otherwise just "remote".
    what = f"{search} remote" if search else "remote"

    params = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "results_per_page": per_page,
        "what": what,
        "content-type": "application/json",
    }

    adzuna_cat = CATEGORY_MAP.get(category)
    if adzuna_cat:
        params["category"] = adzuna_cat

    url = f"{ADZUNA_BASE}/{country}/search/{page}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    total = data.get("count", 0)
    total_pages = max(1, (total + per_page - 1) // per_page)

    jobs = []
    for job in data.get("results", []):
        salary_min = job.get("salary_min")
        salary_max = job.get("salary_max")
        salary = ""
        if salary_min and salary_max:
            salary = f"${int(salary_min):,} – ${int(salary_max):,}"
        elif salary_min:
            salary = f"${int(salary_min):,}+"

        jobs.append({
            "id": str(job.get("id", "")),
            "title": job.get("title", ""),
            "company": job.get("company", {}).get("display_name", ""),
            "logo": None,
            "category": job.get("category", {}).get("label", ""),
            "tags": [],
            "job_type": (job.get("contract_time") or "").replace("_", " ").title(),
            "location": job.get("location", {}).get("display_name", ""),
            "salary": salary,
            "url": job.get("redirect_url", ""),
            "posted_at": job.get("created", ""),
            "description": _strip_html(job.get("description", ""))[:1000],
        })

    return {
        "jobs": jobs,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "source": "adzuna",
    }


async def _get_remotive_jobs(
    search: str,
    category: str,
    page: int,
    per_page: int,
) -> dict:
    """Fetch jobs from Remotive API (fallback)."""
    params = {}
    if search:
        params["search"] = search
    if category:
        params["category"] = category

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(REMOTIVE_API, params=params)
        response.raise_for_status()
        data = response.json()

    all_jobs = data.get("jobs", [])
    total = len(all_jobs)
    offset = (page - 1) * per_page
    paginated = all_jobs[offset: offset + per_page]
    total_pages = max(1, (total + per_page - 1) // per_page)

    jobs = []
    for job in paginated:
        jobs.append({
            "id": str(job.get("id", "")),
            "title": job.get("title", ""),
            "company": job.get("company_name", ""),
            "logo": job.get("company_logo"),
            "category": job.get("category", ""),
            "tags": job.get("tags", []),
            "job_type": (job.get("job_type") or "").replace("_", " ").title(),
            "location": job.get("candidate_required_location") or "Worldwide",
            "salary": job.get("salary") or "",
            "url": job.get("url", ""),
            "posted_at": job.get("publication_date", ""),
            "description": _strip_html(job.get("description", ""))[:1000],
        })

    return {
        "jobs": jobs,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "source": "remotive",
    }


@router.get("")
async def get_jobs(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1, le=1000),
    per_page: int = Query(21, ge=9, le=50),
    country: str = Query("us"),
):
    """
    Fetch job listings with server-side pagination.

    Uses Adzuna API when credentials are configured (millions of jobs),
    falls back to Remotive API otherwise (~300 remote jobs).
    """
    search_str = search or ""
    category_str = category or ""
    cache_key = f"jobs:{country}:{search_str}:{category_str}:{page}:{per_page}"

    redis = redis_service_module.redis_service
    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                return cached
        except Exception:
            pass

    try:
        if settings.ADZUNA_APP_ID and settings.ADZUNA_APP_KEY:
            result = await _get_adzuna_jobs(search_str, category_str, page, per_page, country)
        else:
            logger.warning("Adzuna credentials not set — falling back to Remotive")
            result = await _get_remotive_jobs(search_str, category_str, page, per_page)
    except Exception as e:
        logger.error(f"Jobs fetch error: {e}")
        # Final fallback: empty response
        return {"jobs": [], "total": 0, "page": page, "per_page": per_page, "total_pages": 0, "source": "error"}

    if redis:
        try:
            await redis.set(cache_key, result, CACHE_TTL)
        except Exception:
            pass

    return result


# ---------------------------------------------------------------------------
# ATS Match endpoint
# ---------------------------------------------------------------------------

class AtsMatchRequest(BaseModel):
    job_description: str
    job_title: str
    resume_id: Optional[int] = None


ATS_MATCH_CACHE_TTL = 3600  # 1 hour


@router.post("/ats-match")
async def ats_match_job(
    request: AtsMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Match a user's resume against a job description using Claude AI.
    Returns score (0-100), matched keywords, missing keywords, and suggestions.
    Uses the daily AI assist quota. Results cached per (user, job_description hash).
    """
    # ----- Quota check (reuse AI assist daily quota) -------------------------
    import asyncio
    redis = redis_service_module.redis_service
    try:
        if redis:
            today = datetime.utcnow().strftime("%Y-%m-%d")
            quota_key = f"quota:ai_assist:{current_user.id}:{today}"
            current_count = await redis.get_quota(quota_key)
            limit = settings.get_ai_assist_limit(current_user.subscription_type.value)
            if current_count >= limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Daily AI limit reached ({limit}/day). Upgrade for more.",
                )
    except HTTPException:
        raise
    except Exception:
        pass  # Fail open

    # ----- Fetch resume -------------------------------------------------------
    if request.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == request.resume_id,
            Resume.user_id == current_user.id,
        ).first()
    else:
        resume = (
            db.query(Resume)
            .filter(Resume.user_id == current_user.id)
            .order_by(Resume.updated_at.desc())
            .first()
        )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please create a resume first.",
        )

    resume_content = resume.optimized_content or resume.content

    # ----- Cache check -------------------------------------------------------
    desc_hash = hashlib.md5(
        (str(current_user.id) + request.job_description[:500]).encode()
    ).hexdigest()[:16]
    cache_key = f"ats_match:{current_user.id}:{desc_hash}"

    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                return cached
        except Exception:
            pass

    # ----- Claude call -------------------------------------------------------
    system_prompt = (
        "You are an ATS expert. Analyze the resume against the job description "
        "and return ONLY a valid JSON object with exactly these keys:\n"
        '{"score": <integer 0-100>, '
        '"matched_keywords": <array of up to 8 short strings>, '
        '"missing_keywords": <array of up to 8 short strings>, '
        '"suggestions": <array of exactly 3 short actionable strings>}'
        "\nNo markdown, no explanation, just the JSON."
    )
    user_prompt = (
        f"Job Title: {request.job_title}\n\n"
        f"Job Description:\n{request.job_description[:3000]}\n\n"
        f"Resume:\n{json.dumps(resume_content, indent=2)[:4000]}"
    )

    try:
        raw = claude_service._call_claude(system_prompt, user_prompt)
        # Strip any accidental markdown fences
        clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        result = json.loads(clean)
        # Normalise types
        result["score"] = int(result.get("score", 0))
        result["matched_keywords"] = list(result.get("matched_keywords", []))
        result["missing_keywords"] = list(result.get("missing_keywords", []))
        result["suggestions"] = list(result.get("suggestions", []))
    except Exception as e:
        logger.error(f"ATS match Claude error: {e}")
        raise HTTPException(status_code=500, detail="AI analysis failed. Please try again.")

    # ----- Increment quota ---------------------------------------------------
    if redis:
        try:
            today = datetime.utcnow().strftime("%Y-%m-%d")
            await redis.increment_quota(f"quota:ai_assist:{current_user.id}:{today}", 86400)
        except Exception:
            pass

    # ----- Cache result -------------------------------------------------------
    if redis:
        try:
            await redis.set(cache_key, result, ATS_MATCH_CACHE_TTL)
        except Exception:
            pass

    return result
