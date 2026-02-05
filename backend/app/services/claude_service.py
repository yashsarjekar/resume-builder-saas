"""
Claude AI service for resume optimization and analysis.

This module provides integration with Anthropic's Claude AI for various
resume-related AI operations including ATS analysis, optimization,
keyword extraction, and content generation.
"""

import json
import hashlib
import logging
import time
from typing import Dict, Any, List, Optional, Tuple
from anthropic import Anthropic, APIError, APITimeoutError, RateLimitError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

from app.config import get_settings
from app.schemas.ai import (
    ATSAnalysisResponse,
    ResumeOptimizationResponse,
    KeywordExtractionResponse,
    CoverLetterResponse,
    LinkedInOptimizationResponse
)

# Initialize settings and logger
settings = get_settings()
logger = logging.getLogger(__name__)

# Initialize Anthropic client
anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)


class ClaudeService:
    """
    Service class for Claude AI operations.

    Provides methods for ATS analysis, resume optimization, keyword extraction,
    cover letter generation, and LinkedIn profile optimization.
    """

    def __init__(self):
        """Initialize Claude service."""
        self.client = anthropic_client
        self.model = "claude-3-haiku-20240307"  # Claude 3 Haiku model
        self.max_tokens = 4096

    @staticmethod
    def _generate_cache_key(operation: str, **kwargs) -> str:
        """
        Generate MD5 hash for caching responses.

        Args:
            operation: Operation name
            **kwargs: Operation parameters

        Returns:
            str: MD5 hash key
        """
        # Create a stable string representation
        cache_data = f"{operation}:{json.dumps(kwargs, sort_keys=True)}"
        return hashlib.md5(cache_data.encode()).hexdigest()

    @staticmethod
    async def _get_cached_response(cache_key: str) -> Optional[Any]:
        """
        Retrieve cached response from Redis.

        Args:
            cache_key: Cache key

        Returns:
            Cached response or None
        """
        try:
            from app.services.redis_service import get_redis_service
            redis = get_redis_service()
            key = f"cache:ai:{cache_key}"
            return await redis.get(key)
        except Exception as e:
            logger.warning(f"Cache get failed: {e}")
            return None

    @staticmethod
    async def _cache_response(cache_key: str, response: Any, ttl: int = 3600) -> None:
        """
        Cache response in Redis with TTL.

        Args:
            cache_key: Cache key
            response: Response to cache
            ttl: Time to live in seconds (default: 1 hour)
        """
        try:
            from app.services.redis_service import get_redis_service
            redis = get_redis_service()
            key = f"cache:ai:{cache_key}"
            await redis.set(key, response, ttl)
        except Exception as e:
            logger.warning(f"Cache set failed: {e}")

    @retry(
        retry=retry_if_exception_type((APITimeoutError, RateLimitError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def _call_claude(self, system_prompt: str, user_prompt: str) -> str:
        """
        Call Claude API with retry logic.

        Args:
            system_prompt: System instructions
            user_prompt: User message

        Returns:
            str: Claude's response text

        Raises:
            APIError: If API call fails after retries
        """
        try:
            start_time = time.time()

            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )

            elapsed_time = time.time() - start_time
            logger.info(f"Claude API call completed in {elapsed_time:.2f}s")

            # Extract text from response
            return response.content[0].text

        except APITimeoutError as e:
            logger.warning(f"Claude API timeout: {str(e)}")
            raise
        except RateLimitError as e:
            logger.warning(f"Claude API rate limit: {str(e)}")
            raise
        except APIError as e:
            logger.error(f"Claude API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error calling Claude: {str(e)}")
            raise

    async def analyze_ats_score(
        self,
        resume_content: Dict[str, Any],
        job_description: str
    ) -> ATSAnalysisResponse:
        """
        Analyze resume ATS compatibility score.

        Args:
            resume_content: Resume data
            job_description: Target job description

        Returns:
            ATSAnalysisResponse: Analysis results with score and suggestions
        """
        # Check cache
        cache_key = self._generate_cache_key(
            "ats_analysis",
            resume=resume_content,
            job_desc=job_description
        )
        cached = await self._get_cached_response(cache_key)
        if cached:
            logger.info("Returning cached ATS analysis")
            return cached

        system_prompt = """You are an expert ATS (Applicant Tracking System) analyzer.
Analyze resumes for ATS compatibility and provide detailed feedback.
Return your response as valid JSON only, without any markdown formatting."""

        user_prompt = f"""Analyze this resume against the job description for ATS compatibility.

Resume:
{json.dumps(resume_content, indent=2)}

Job Description:
{job_description}

Provide analysis in this JSON format:
{{
    "ats_score": <0-100>,
    "category": "<Excellent/Good/Fair/Poor>",
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "missing_keywords": ["keyword1", "keyword2", ...],
    "suggestions": ["suggestion1", "suggestion2", ...]
}}

Score guidelines:
- 80-100: Excellent - Strong match with job requirements
- 60-79: Good - Decent match with room for improvement
- 40-59: Fair - Moderate match, needs optimization
- 0-39: Poor - Weak match, significant improvements needed"""

        try:
            response_text = self._call_claude(system_prompt, user_prompt)

            # Parse JSON response
            response_data = json.loads(response_text)

            # Create response object
            result = ATSAnalysisResponse(**response_data)

            # Cache the result
            await self._cache_response(cache_key, result)

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response: {e}")
            raise ValueError("Invalid response from AI service")
        except Exception as e:
            logger.error(f"ATS analysis failed: {e}")
            raise

    async def optimize_resume(
        self,
        resume_content: Dict[str, Any],
        job_description: str,
        optimization_level: str = "moderate"
    ) -> ResumeOptimizationResponse:
        """
        Optimize resume for specific job description.

        Args:
            resume_content: Original resume data
            job_description: Target job description
            optimization_level: Level of optimization (light/moderate/aggressive)

        Returns:
            ResumeOptimizationResponse: Optimized resume and change summary
        """
        cache_key = self._generate_cache_key(
            "optimize_resume",
            resume=resume_content,
            job_desc=job_description,
            level=optimization_level
        )
        cached = await self._get_cached_response(cache_key)
        if cached:
            logger.info("Returning cached resume optimization")
            return cached

        optimization_guidelines = {
            "light": "Make minimal changes, focus on keyword insertion",
            "moderate": "Rewrite bullet points and optimize content structure",
            "aggressive": "Comprehensive rewrite with maximum ATS optimization"
        }

        system_prompt = """You are an expert resume writer specializing in ATS optimization.
Optimize resumes to maximize ATS scores while maintaining authenticity.
Return your response as valid JSON only."""

        user_prompt = f"""Optimize this resume for the job description.

Optimization Level: {optimization_level} - {optimization_guidelines[optimization_level]}

Resume:
{json.dumps(resume_content, indent=2)}

Job Description:
{job_description}

Provide optimized resume in this JSON format:
{{
    "optimized_content": {{<same structure as input resume with optimized content>}},
    "changes_made": ["change1", "change2", ...],
    "ats_score_improvement": <estimated score improvement 0-100>,
    "summary": "<brief summary of optimization>"
}}

Guidelines:
- Maintain truthful information
- Incorporate relevant keywords naturally
- Improve action verbs and impact statements
- Optimize formatting for ATS parsing
- Highlight relevant experience"""

        try:
            response_text = self._call_claude(system_prompt, user_prompt)
            response_data = json.loads(response_text)
            result = ResumeOptimizationResponse(**response_data)

            await self._cache_response(cache_key, result)
            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse optimization response: {e}")
            raise ValueError("Invalid response from AI service")
        except Exception as e:
            logger.error(f"Resume optimization failed: {e}")
            raise

    async def extract_keywords(
        self,
        job_description: str,
        max_keywords: int = 20
    ) -> KeywordExtractionResponse:
        """
        Extract keywords from job description.

        Args:
            job_description: Job posting text
            max_keywords: Maximum keywords to extract

        Returns:
            KeywordExtractionResponse: Extracted keywords and categorization
        """
        cache_key = self._generate_cache_key(
            "extract_keywords",
            job_desc=job_description,
            max_kw=max_keywords
        )
        cached = await self._get_cached_response(cache_key)
        if cached:
            logger.info("Returning cached keyword extraction")
            return cached

        system_prompt = """You are an expert at analyzing job descriptions and extracting key requirements.
Identify important keywords, skills, and qualifications.
Return your response as valid JSON only."""

        user_prompt = f"""Extract keywords from this job description.

Job Description:
{job_description}

Extract up to {max_keywords} most important keywords and provide in this JSON format:
{{
    "keywords": ["keyword1", "keyword2", ...],
    "skills": {{
        "technical": ["skill1", "skill2", ...],
        "soft": ["skill1", "skill2", ...]
    }},
    "qualifications": ["qualification1", "qualification2", ...],
    "categories": {{
        "must_have": ["item1", "item2", ...],
        "nice_to_have": ["item1", "item2", ...],
        "tools_technologies": ["tool1", "tool2", ...]
    }}
}}

Focus on:
- Technical skills and tools
- Soft skills and competencies
- Required qualifications
- Industry-specific terminology"""

        try:
            response_text = self._call_claude(system_prompt, user_prompt)
            response_data = json.loads(response_text)
            result = KeywordExtractionResponse(**response_data)

            await self._cache_response(cache_key, result)
            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse keyword extraction: {e}")
            raise ValueError("Invalid response from AI service")
        except Exception as e:
            logger.error(f"Keyword extraction failed: {e}")
            raise

    async def generate_cover_letter(
        self,
        resume_content: Dict[str, Any],
        job_description: str,
        company_name: str,
        hiring_manager: Optional[str] = None,
        tone: str = "professional"
    ) -> CoverLetterResponse:
        """
        Generate tailored cover letter.

        Args:
            resume_content: User's resume data
            job_description: Target job description
            company_name: Company name
            hiring_manager: Hiring manager name (optional)
            tone: Writing tone (professional/enthusiastic/formal)

        Returns:
            CoverLetterResponse: Generated cover letter
        """
        cache_key = self._generate_cache_key(
            "cover_letter",
            resume=resume_content,
            job_desc=job_description,
            company=company_name,
            tone=tone
        )
        cached = await self._get_cached_response(cache_key)
        if cached:
            logger.info("Returning cached cover letter")
            return cached

        salutation = f"Dear {hiring_manager}," if hiring_manager else "Dear Hiring Manager,"

        system_prompt = f"""You are an expert cover letter writer.
Write compelling, personalized cover letters that highlight relevant experience.
Tone: {tone}
Return response as valid JSON only."""

        user_prompt = f"""Generate a cover letter for this job application.

Resume:
{json.dumps(resume_content, indent=2)}

Job Description:
{job_description}

Company: {company_name}
Salutation: {salutation}

Provide cover letter in this JSON format:
{{
    "cover_letter": "<full cover letter text>",
    "key_highlights": ["highlight1", "highlight2", "highlight3"],
    "word_count": <total words>
}}

Requirements:
- 250-400 words
- Strong opening paragraph
- 2-3 body paragraphs highlighting relevant experience
- Compelling closing with call to action
- {tone} tone throughout
- Personalized to company and role"""

        try:
            response_text = self._call_claude(system_prompt, user_prompt)
            response_data = json.loads(response_text)
            result = CoverLetterResponse(**response_data)

            await self._cache_response(cache_key, result)
            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse cover letter response: {e}")
            raise ValueError("Invalid response from AI service")
        except Exception as e:
            logger.error(f"Cover letter generation failed: {e}")
            raise

    async def optimize_linkedin(
        self,
        current_profile: Dict[str, Any],
        target_role: str,
        industry: Optional[str] = None
    ) -> LinkedInOptimizationResponse:
        """
        Optimize LinkedIn profile for target role.

        Args:
            current_profile: Current LinkedIn profile data
            target_role: Target job role/title
            industry: Target industry (optional)

        Returns:
            LinkedInOptimizationResponse: Optimized profile sections
        """
        cache_key = self._generate_cache_key(
            "linkedin_optimization",
            profile=current_profile,
            role=target_role,
            industry=industry or ""
        )
        cached = await self._get_cached_response(cache_key)
        if cached:
            logger.info("Returning cached LinkedIn optimization")
            return cached

        industry_context = f"Industry: {industry}" if industry else ""

        system_prompt = """You are a LinkedIn profile optimization expert.
Optimize profiles for maximum visibility and recruiter appeal.
Return response as valid JSON only."""

        user_prompt = f"""Optimize this LinkedIn profile for the target role.

Current Profile:
{json.dumps(current_profile, indent=2)}

Target Role: {target_role}
{industry_context}

Provide optimization in this JSON format:
{{
    "optimized_headline": "<SEO-optimized headline, max 220 chars>",
    "optimized_summary": "<compelling about section, 3-5 paragraphs>",
    "skill_recommendations": ["skill1", "skill2", ...],
    "keywords_to_include": ["keyword1", "keyword2", ...],
    "improvements": ["improvement1", "improvement2", ...]
}}

Focus on:
- SEO keywords for recruiters
- Value proposition and unique selling points
- Quantifiable achievements
- Industry-relevant skills
- Professional yet personable tone"""

        try:
            response_text = self._call_claude(system_prompt, user_prompt)
            response_data = json.loads(response_text)
            result = LinkedInOptimizationResponse(**response_data)

            await self._cache_response(cache_key, result)
            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LinkedIn optimization: {e}")
            raise ValueError("Invalid response from AI service")
        except Exception as e:
            logger.error(f"LinkedIn optimization failed: {e}")
            raise

    @staticmethod
    async def clear_cache() -> None:
        """Clear the AI response cache in Redis."""
        try:
            from app.services.redis_service import get_redis_service
            redis = get_redis_service()
            await redis.delete_pattern("cache:ai:*")
            logger.info("AI response cache cleared")
        except Exception as e:
            logger.warning(f"Failed to clear AI cache: {e}")


# Create singleton instance
claude_service = ClaudeService()
