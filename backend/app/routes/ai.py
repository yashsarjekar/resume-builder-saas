"""
AI feature routes for resume optimization and analysis.

This module handles all AI-powered endpoints including ATS analysis,
resume optimization, keyword extraction, cover letter generation,
and LinkedIn profile optimization using Claude AI.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.schemas.ai import (
    ATSAnalysisRequest,
    ATSAnalysisResponse,
    KeywordExtractionRequest,
    KeywordExtractionResponse,
    CoverLetterRequest,
    CoverLetterResponse,
    LinkedInOptimizationRequest,
    LinkedInOptimizationResponse,
)
from app.schemas.resume import (
    ResumeOptimizeRequest,
    ResumeAnalyzeRequest,
)
from app.dependencies import get_current_user
from app.services.claude_service import claude_service
from app.config import get_settings
from datetime import datetime

# Initialize router and logger
router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()


async def check_ats_limit(user: User, db: Session) -> None:
    """
    Check if user can perform ATS analysis with soft throttling.

    Implements progressive throttling for ATS operations:
    - 0-70% usage: No delay
    - 70-85% usage: 2 second delay (ATS is expensive)
    - 85-100% usage: 4 second delay (heavy throttle)
    - 100%+ usage: Block with upgrade message

    Args:
        user: Current user
        db: Database session

    Raises:
        HTTPException: If ATS analysis limit exceeded
    """
    import asyncio

    # Get region-specific limits
    user_region = user.get_region() if hasattr(user, 'get_region') else "IN"
    limit_config = settings.get_limit_config(user_region)
    limit = settings.get_ats_limit(user.subscription_type.value, user_region)

    # Calculate usage percentage
    usage_percent = (user.ats_analysis_count / limit * 100) if limit > 0 else 0

    # Hard limit reached
    if user.ats_analysis_count >= limit:
        logger.warning(
            f"ATS limit BLOCKED for user {user.id}: "
            f"{user.ats_analysis_count}/{limit} (100%)"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"ATS analysis limit ({limit}) reached. "
                   f"Upgrade to get more analyses."
        )

    # Soft throttling for ATS (more aggressive since it's expensive)
    throttle_delay = 0
    if usage_percent >= 85:
        throttle_delay = 4  # Heavy throttle near limit
    elif usage_percent >= 70:
        throttle_delay = 2  # Moderate throttle

    if throttle_delay > 0:
        logger.info(
            f"Soft throttling ATS for user {user.id}: "
            f"{user.ats_analysis_count}/{limit} ({usage_percent:.1f}%) - {throttle_delay}s delay"
        )
        await asyncio.sleep(throttle_delay)


def increment_ats_count(user: User, db: Session) -> None:
    """
    Increment user's ATS analysis count.

    Args:
        user: Current user
        db: Database session
    """
    user.ats_analysis_count += 1
    db.commit()
    logger.info(f"User {user.id} ATS count incremented to {user.ats_analysis_count}")


async def check_ai_assist_limit(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Check daily AI assist quota using Redis with soft throttling.

    Implements progressive throttling:
    - 0-70% usage: No delay (full speed)
    - 70-85% usage: 1 second delay (slight slowdown)
    - 85-95% usage: 2 second delay (noticeable slowdown)
    - 95-100% usage: 3 second delay (heavy throttle)
    - 100%+ usage: Block with upgrade message

    Args:
        current_user: Authenticated user

    Returns:
        User: User if quota available

    Raises:
        HTTPException: If daily AI assist limit exceeded
    """
    from app.services.redis_service import get_redis_service
    import asyncio

    try:
        redis = get_redis_service()
        today = datetime.utcnow().strftime("%Y-%m-%d")
        key = f"quota:ai_assist:{current_user.id}:{today}"

        # Get current count
        current_count = await redis.get_quota(key)
        limit = settings.get_ai_assist_limit(current_user.subscription_type.value)

        # Calculate usage percentage
        usage_percent = (current_count / limit * 100) if limit > 0 else 0

        # Hard limit reached - block request
        if current_count >= limit:
            logger.warning(
                f"AI assist limit BLOCKED for user {current_user.id}: "
                f"{current_count}/{limit} (100%)"
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Daily AI assist limit reached ({limit}/day). "
                       f"Upgrade to PRO for unlimited access or wait 24 hours."
            )

        # Soft throttling based on usage percentage
        throttle_delay = 0
        if usage_percent >= 95:
            throttle_delay = 3  # Heavy throttle near limit
        elif usage_percent >= 85:
            throttle_delay = 2  # Moderate throttle
        elif usage_percent >= 70:
            throttle_delay = 1  # Light throttle

        # Apply throttle delay if needed
        if throttle_delay > 0:
            logger.info(
                f"Soft throttling user {current_user.id}: "
                f"{current_count}/{limit} ({usage_percent:.1f}%) - {throttle_delay}s delay"
            )
            await asyncio.sleep(throttle_delay)

        # Increment quota
        await redis.increment_quota(key, 86400)  # 24h TTL

        logger.info(
            f"AI assist quota check for user {current_user.id}: "
            f"{current_count + 1}/{limit} ({usage_percent:.1f}%)"
        )

        return current_user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI assist quota check failed: {e}")
        # Fail open - allow request if quota check fails
        return current_user


@router.post("/analyze-ats", response_model=ATSAnalysisResponse)
async def analyze_ats(
    request_data: ATSAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze resume ATS compatibility against job description.

    Checks subscription limits before analysis and tracks usage.

    Args:
        request_data: Resume content and job description
        current_user: Authenticated user
        db: Database session

    Returns:
        ATSAnalysisResponse: ATS score, strengths, weaknesses, suggestions

    Raises:
        HTTPException 403: If ATS analysis limit exceeded
        HTTPException 500: If analysis fails

    Example:
        POST /api/ai/analyze-ats
        {
            "resume_content": {...},
            "job_description": "Looking for Python developer..."
        }
    """
    # Check subscription limits (with throttling)
    await check_ats_limit(current_user, db)

    try:
        # Perform ATS analysis using Claude
        result = await claude_service.analyze_ats_score(
            resume_content=request_data.resume_content,
            job_description=request_data.job_description
        )

        # Increment usage count
        increment_ats_count(current_user, db)

        logger.info(
            f"ATS analysis completed for user {current_user.id}: "
            f"score={result.ats_score}"
        )

        return result

    except ValueError as e:
        logger.error(f"ATS analysis validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"ATS analysis failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze resume. Please try again."
        )


@router.post("/optimize-resume/{resume_id}")
async def optimize_resume(
    resume_id: int,
    request_data: ResumeOptimizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Optimize resume for specific job description.

    Updates the resume with optimized content and ATS score.

    Args:
        resume_id: Resume ID to optimize
        request_data: Job description and optimization level
        current_user: Authenticated user
        db: Database session

    Returns:
        dict: Optimized resume data

    Raises:
        HTTPException 404: If resume not found
        HTTPException 403: If not authorized or limit exceeded
        HTTPException 500: If optimization fails

    Example:
        POST /api/ai/optimize-resume/123
        {
            "job_description": "Looking for Python developer...",
            "optimization_level": "moderate"
        }
    """
    # Get resume and check ownership
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to optimize this resume"
        )

    # Check ATS analysis limit (with throttling)
    await check_ats_limit(current_user, db)

    try:
        # Optimize resume using Claude
        optimization_result = await claude_service.optimize_resume(
            resume_content=resume.content,
            job_description=request_data.job_description,
            optimization_level=request_data.optimization_level
        )

        # NOTE: We don't increment ATS count here because optimization is not the same as analysis
        # The count should only be incremented when doing actual ATS analysis
        # This prevents double-counting when users optimize and then analyze

        # Check if optimization was possible
        if not optimization_result.optimization_possible:
            logger.warning(
                f"Resume {resume_id} optimization not possible: "
                f"{optimization_result.reason}"
            )

            # Return full optimization response (including reason for failure)
            return {
                "optimization_possible": False,
                "reason": optimization_result.reason,
                "role_compatibility": {
                    "job_role": optimization_result.role_compatibility.job_role,
                    "resume_role": optimization_result.role_compatibility.resume_role,
                    "match_level": optimization_result.role_compatibility.match_level,
                    "suitable_for_optimization": False
                },
                "message": "Optimization not possible - role mismatch detected"
            }

        # Get ATS score for optimized content
        ats_result = await claude_service.analyze_ats_score(
            resume_content=optimization_result.optimized_content,
            job_description=request_data.job_description
        )

        # Update resume with optimization
        resume.set_optimization(
            optimized_content=optimization_result.optimized_content,
            ats_score=ats_result.overall_ats_score
        )
        resume.job_description = request_data.job_description

        db.commit()
        db.refresh(resume)

        logger.info(
            f"Resume {resume_id} optimized for user {current_user.id}: "
            f"score={ats_result.overall_ats_score}, "
            f"improvement={optimization_result.estimated_ats_improvement.improvement}"
        )

        # Return comprehensive optimization response
        return {
            "optimization_possible": True,
            "role_compatibility": {
                "job_role": optimization_result.role_compatibility.job_role,
                "resume_role": optimization_result.role_compatibility.resume_role,
                "match_level": optimization_result.role_compatibility.match_level,
                "suitable_for_optimization": True
            },
            "changes_made": {
                "formatting_fixes": optimization_result.changes_made.formatting_fixes,
                "keyword_additions": optimization_result.changes_made.keyword_additions,
                "rewording_improvements": optimization_result.changes_made.rewording_improvements,
                "quantification_additions": optimization_result.changes_made.quantification_additions,
                "reordering": optimization_result.changes_made.reordering,
                "section_additions": optimization_result.changes_made.section_additions
            },
            "keywords_added": {
                "from_job_description": optimization_result.keywords_added.from_job_description,
                "justification": optimization_result.keywords_added.justification
            },
            "estimated_ats_improvement": {
                "before_score": optimization_result.estimated_ats_improvement.before_score,
                "after_score": optimization_result.estimated_ats_improvement.after_score,
                "improvement": optimization_result.estimated_ats_improvement.improvement,
                "confidence": optimization_result.estimated_ats_improvement.confidence
            },
            "optimization_summary": optimization_result.optimization_summary,
            "warnings": optimization_result.warnings,
            "authenticity_verification": {
                "all_companies_unchanged": optimization_result.authenticity_verification.all_companies_unchanged,
                "all_dates_unchanged": optimization_result.authenticity_verification.all_dates_unchanged,
                "no_fabricated_skills": optimization_result.authenticity_verification.no_fabricated_skills,
                "no_invented_projects": optimization_result.authenticity_verification.no_invented_projects
            },
            "message": "Resume optimized successfully",
            "resume_id": resume.id,
            "ats_score": ats_result.overall_ats_score,
            "ats_category": resume.get_ats_score_category()
        }

    except ValueError as e:
        logger.error(f"Resume optimization validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Resume optimization failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to optimize resume. Please try again."
        )


@router.post("/analyze-resume/{resume_id}")
async def analyze_resume_ats(
    resume_id: int,
    request_data: ResumeAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze existing resume's ATS score.

    Similar to /analyze-ats but works with saved resumes.

    Args:
        resume_id: Resume ID to analyze
        request_data: Job description
        current_user: Authenticated user
        db: Database session

    Returns:
        ATSAnalysisResponse: Analysis results

    Raises:
        HTTPException 404: If resume not found
        HTTPException 403: If not authorized or limit exceeded
    """
    # Get resume and check ownership
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to analyze this resume"
        )

    # Check limits (with throttling)
    await check_ats_limit(current_user, db)

    try:
        # Analyze ATS score
        result = await claude_service.analyze_ats_score(
            resume_content=resume.content,
            job_description=request_data.job_description
        )

        # Update resume with ATS score
        resume.ats_score = result.ats_score
        resume.job_description = request_data.job_description

        # Increment usage
        increment_ats_count(current_user, db)

        db.commit()

        logger.info(
            f"Resume {resume_id} analyzed for user {current_user.id}: "
            f"score={result.ats_score}"
        )

        return result

    except Exception as e:
        db.rollback()
        logger.error(f"Resume analysis failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze resume. Please try again."
        )


@router.post("/extract-keywords", response_model=KeywordExtractionResponse)
async def extract_keywords(
    request_data: KeywordExtractionRequest,
    current_user: User = Depends(check_ai_assist_limit)
):
    """
    Extract keywords from job description.

    Protected by AI assist daily quota (FREE: 10/day, STARTER: 50/day, PRO: unlimited).

    Args:
        request_data: Job description and max keywords
        current_user: Authenticated user

    Returns:
        KeywordExtractionResponse: Extracted keywords and skills

    Raises:
        HTTPException 500: If extraction fails

    Example:
        POST /api/ai/extract-keywords
        {
            "job_description": "Looking for Python developer...",
            "max_keywords": 20
        }
    """
    try:
        result = await claude_service.extract_keywords(
            job_description=request_data.job_description,
            max_keywords=request_data.max_keywords
        )

        logger.info(
            f"Keywords extracted for user {current_user.id}: "
            f"{len(result.keywords)} keywords"
        )

        return result

    except ValueError as e:
        logger.error(f"Keyword extraction validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Keyword extraction failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract keywords. Please try again."
        )


@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(
    request_data: CoverLetterRequest,
    current_user: User = Depends(check_ai_assist_limit)
):
    """
    Generate tailored cover letter.

    Protected by AI assist daily quota (FREE: 10/day, STARTER: 50/day, PRO: unlimited).

    Args:
        request_data: Resume, job description, company info
        current_user: Authenticated user

    Returns:
        CoverLetterResponse: Generated cover letter

    Raises:
        HTTPException 500: If generation fails

    Example:
        POST /api/ai/generate-cover-letter
        {
            "resume_content": {...},
            "job_description": "...",
            "company_name": "Tech Corp",
            "hiring_manager": "John Doe",
            "tone": "professional"
        }
    """
    try:
        result = await claude_service.generate_cover_letter(
            resume_content=request_data.resume_content,
            job_description=request_data.job_description,
            company_name=request_data.company_name,
            hiring_manager=request_data.hiring_manager,
            tone=request_data.tone
        )

        logger.info(
            f"Cover letter generated for user {current_user.id}: "
            f"{result.word_count} words"
        )

        return result

    except ValueError as e:
        logger.error(f"Cover letter generation validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Cover letter generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate cover letter. Please try again."
        )


@router.post("/optimize-linkedin", response_model=LinkedInOptimizationResponse)
async def optimize_linkedin(
    request_data: LinkedInOptimizationRequest,
    current_user: User = Depends(check_ai_assist_limit)
):
    """
    Optimize LinkedIn profile for target role.

    Protected by AI assist daily quota (FREE: 10/day, STARTER: 50/day, PRO: unlimited).

    Args:
        request_data: Current profile, target role, industry
        current_user: Authenticated user

    Returns:
        LinkedInOptimizationResponse: Optimized profile sections

    Raises:
        HTTPException 500: If optimization fails

    Example:
        POST /api/ai/optimize-linkedin
        {
            "current_profile": {...},
            "target_role": "Senior Software Engineer",
            "industry": "Technology"
        }
    """
    try:
        result = await claude_service.optimize_linkedin(
            current_profile=request_data.current_profile,
            target_role=request_data.target_role,
            industry=request_data.industry
        )

        logger.info(
            f"LinkedIn profile optimized for user {current_user.id}: "
            f"role={request_data.target_role}"
        )

        return result

    except ValueError as e:
        logger.error(f"LinkedIn optimization validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"LinkedIn optimization failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to optimize LinkedIn profile. Please try again."
        )
