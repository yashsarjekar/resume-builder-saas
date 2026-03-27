"""
Remote Jobs Route.

Primary source: Adzuna API (millions of jobs, server-side pagination).
Fallback: Remotive API (remote-only, ~300 jobs).
Results cached in Redis for 30 minutes.
"""

import re
import httpx
import logging
from fastapi import APIRouter, Query
from typing import Optional
import app.services.redis_service as redis_service_module
from app.config import get_settings

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
    params = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "results_per_page": per_page,
        "what": search or "remote",
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
