"""
Remote Jobs Route - Proxies Remotive API with Redis caching.
"""

import httpx
import logging
from fastapi import APIRouter, Query
from typing import Optional
import app.services.redis_service as redis_service_module

router = APIRouter()
logger = logging.getLogger(__name__)

REMOTIVE_API = "https://remotive.com/api/remote-jobs"
CACHE_TTL = 1800  # 30 minutes


@router.get("")
async def get_jobs(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    Fetch remote jobs from Remotive API with Redis caching.

    Returns paginated job listings with company info, tags, salary, and apply URL.
    Results are cached for 30 minutes to reduce external API calls.
    """
    cache_key = f"jobs:{search or ''}:{category or ''}:{limit}:{offset}"

    redis = redis_service_module.redis_service
    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                logger.info(f"Cache hit: {cache_key}")
                return cached
        except Exception:
            pass

    params = {}
    if search:
        params["search"] = search
    if category:
        params["category"] = category

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(REMOTIVE_API, params=params)
            response.raise_for_status()
            data = response.json()
    except httpx.TimeoutException:
        logger.error("Remotive API timeout")
        return {"jobs": [], "total": 0, "limit": limit, "offset": offset}
    except Exception as e:
        logger.error(f"Remotive API error: {e}")
        return {"jobs": [], "total": 0, "limit": limit, "offset": offset}

    all_jobs = data.get("jobs", [])
    total = len(all_jobs)
    paginated = all_jobs[offset: offset + limit]

    result_jobs = []
    for job in paginated:
        result_jobs.append({
            "id": job.get("id"),
            "title": job.get("title"),
            "company": job.get("company_name"),
            "logo": job.get("company_logo"),
            "category": job.get("category"),
            "tags": job.get("tags", []),
            "job_type": job.get("job_type"),
            "location": job.get("candidate_required_location") or "Worldwide",
            "salary": job.get("salary") or "",
            "url": job.get("url"),
            "posted_at": job.get("publication_date"),
        })

    result = {
        "jobs": result_jobs,
        "total": total,
        "limit": limit,
        "offset": offset,
    }

    if redis:
        try:
            await redis.set(cache_key, result, CACHE_TTL)
        except Exception:
            pass

    return result
