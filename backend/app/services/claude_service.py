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
        self.model = "claude-sonnet-4-5-20250929"  # Claude 4.5 Sonnet - Latest & Best
        self.max_tokens = 8192  # Increased for Claude 4.5

    @staticmethod
    def _clean_json_response(response_text: str) -> str:
        """
        Clean JSON response by removing markdown code blocks.

        Args:
            response_text: Raw response from Claude

        Returns:
            Cleaned JSON string
        """
        # Remove markdown code blocks if present
        if "```json" in response_text:
            # Extract content between ```json and ```
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            response_text = response_text[start:end].strip()
        elif "```" in response_text:
            # Extract content between ``` and ```
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            response_text = response_text[start:end].strip()

        return response_text.strip()

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

        system_prompt = """You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge
of both technical parsing and human recruiter evaluation criteria.

Analyze resumes for ATS compatibility across three dimensions:
1. Technical Parseability (can ATS read it?)
2. Keyword & Content Match (does it match the job?)
3. Presentation Quality (will humans engage with it?)

Return response as valid JSON only, without markdown formatting."""

        user_prompt = f"""Analyze this resume against the job description for comprehensive ATS compatibility.

Resume:
{json.dumps(resume_content, indent=2)}

Job Description:
{job_description}

ANALYSIS FRAMEWORK:

## PHASE 1: ROLE ALIGNMENT (Weight: 30%)
1. Identify PRIMARY role type in JD (e.g., Software Engineering, Sales Leadership)
2. Identify PRIMARY career trajectory in resume
3. Assess match level:
   - DIRECT MATCH: Same role/function → 70-100% potential
   - ADJACENT MATCH: Related field with transferable skills → 40-70% potential
   - PIVOT MATCH: Different field but with bridging experience/education → 20-50% potential
   - MISMATCH: Completely different field, no transition indicators → 0-25% potential

## PHASE 2: TECHNICAL ATS COMPATIBILITY (Weight: 20%)
Check for parsing issues:
- File format concerns (if detectable)
- Complex formatting (tables, columns, text boxes)
- Contact info clarity (phone, email, LinkedIn)
- Section header recognition (Experience, Education, Skills)
- Date formats (consistency and parseability)
- Special characters or symbols
- Keyword stuffing detection

## PHASE 3: CONTENT MATCHING (Weight: 35%)
- Hard skills match (technical requirements)
- Soft skills match
- Industry-specific terminology
- Required certifications/education
- Years of experience alignment
- Quantifiable achievements presence
- Action verb usage
- Keyword density (not just presence)
- Acronym usage (spell out + abbreviation)

## PHASE 4: EXPERIENCE QUALITY (Weight: 15%)
- Seniority level alignment
- Company size/type relevance
- Industry experience
- Project scope & impact
- Leadership/collaboration indicators

PROVIDE ANALYSIS IN THIS JSON FORMAT:
{{
    "overall_ats_score": <0-100>,
    "category": "<Excellent/Good/Fair/Poor/Critical Issues>",

    "dimension_scores": {{
        "role_alignment": <0-100>,
        "technical_compatibility": <0-100>,
        "content_match": <0-100>,
        "experience_quality": <0-100>
    }},

    "role_analysis": {{
        "job_role_type": "string",
        "resume_role_type": "string",
        "match_level": "DIRECT/ADJACENT/PIVOT/MISMATCH",
        "explanation": "string"
    }},

    "technical_issues": [
        {{"issue": "string", "severity": "HIGH/MEDIUM/LOW", "fix": "string"}}
    ],

    "keyword_analysis": {{
        "matched_keywords": ["keyword1", "keyword2"],
        "missing_critical_keywords": ["keyword1", "keyword2"],
        "missing_recommended_keywords": ["keyword1", "keyword2"],
        "keyword_density": "OPTIMAL/LOW/STUFFED"
    }},

    "strengths": [
        {{"category": "string", "detail": "string"}}
    ],

    "weaknesses": [
        {{"category": "string", "detail": "string", "priority": "HIGH/MEDIUM/LOW"}}
    ],

    "actionable_suggestions": [
        {{
            "action": "string",
            "rationale": "string",
            "priority": "HIGH/MEDIUM/LOW",
            "example": "string (optional)"
        }}
    ],

    "missing_elements": {{
        "required_skills": ["skill1"],
        "required_qualifications": ["qualification1"],
        "recommended_additions": ["item1"]
    }}
}}

SCORING GUIDELINES:
- 90-100: Excellent - Strong role match, ATS-friendly, comprehensive keyword coverage
- 75-89: Good - Clear role fit, minor technical/keyword gaps
- 60-74: Fair - Acceptable match, several improvements needed
- 40-59: Poor - Significant gaps in role match or ATS compatibility
- 20-39: Critical Issues - Major role mismatch OR severe technical problems
- 0-19: Not Viable - Wrong career path AND poor ATS structure

SPECIAL CONSIDERATIONS:
- Career changers: Look for bridging experience, certifications, projects
- Entry-level: Focus on education, internships, relevant coursework
- Senior roles: Emphasize leadership, strategy, measurable impact
- Technical roles: Prioritize specific technologies, tools, methodologies
- Hybrid roles: Assess multi-dimensional skill matches"""

        try:
            response_text = self._call_claude(system_prompt, user_prompt)

            # Clean and parse JSON response
            cleaned_text = self._clean_json_response(response_text)
            response_data = json.loads(cleaned_text)

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

        # Map optimization levels to numeric values
        optimization_level_map = {
            "light": 1,
            "moderate": 2,
            "aggressive": 3
        }
        optimization_level_num = optimization_level_map.get(optimization_level, 2)

        optimization_guidelines = {
            1: "CONSERVATIVE - Fix formatting and improve wording only. No new content added. (Safest)",
            2: "MODERATE - Extract implicit skills, add keywords from actual experience, quantify achievements with estimates. (Recommended)",
            3: "AGGRESSIVE - Maximum keyword optimization while maintaining truthfulness. Restructure for role focus. (Use carefully)"
        }

        system_prompt = """You are an expert resume optimization specialist focusing on ATS compatibility.

CORE PRINCIPLE: You optimize how existing experience is PRESENTED,
you NEVER fabricate, exaggerate, or add information that isn't
already present in the original resume.

Return response as valid JSON only, without markdown formatting."""

        user_prompt = f"""Optimize this resume for the job description while maintaining complete authenticity.

Optimization Level: {optimization_level_num}
Resume: {json.dumps(resume_content, indent=2)}
Job Description: {job_description}

CRITICAL RULES - NEVER VIOLATE:

1. WHAT YOU CAN CHANGE:
   ✅ Reword descriptions for clarity and impact
   ✅ Reorder bullet points to highlight relevance
   ✅ Add relevant keywords IF they describe existing work
   ✅ Improve action verbs (e.g., "helped" → "led", "did" → "developed")
   ✅ Quantify existing achievements with reasonable estimates if not specified
   ✅ Reorganize sections for better ATS parsing
   ✅ Fix formatting issues (dates, phone numbers, etc.)
   ✅ Add missing section headers (Skills, Experience, Education)
   ✅ Extract implicit skills from experience and list them explicitly

2. WHAT YOU CANNOT CHANGE:
   ❌ Employment dates
   ❌ Company names
   ❌ Job titles (can clarify, not change)
   ❌ Education degrees or institutions
   ❌ Add skills/technologies never mentioned or implied
   ❌ Add projects that don't exist
   ❌ Fabricate certifications
   ❌ Invent metrics or achievements
   ❌ Add tools/languages never used
   ❌ Change cities or locations
   ❌ Alter years of experience

3. ROLE COMPATIBILITY CHECK:
   BEFORE optimizing, determine if resume matches job role:

   ALWAYS proceed with optimization, but assess match level and add warnings:

   - DIRECT MATCH (e.g., Backend Engineer → Senior Backend Engineer):
     * Same role type, different seniority
     * Optimize normally
     * Expected improvement: 15-30%
     * Warnings: None or minimal

   - ADJACENT MATCH (e.g., Full-Stack → Frontend, Software Engineer → DevOps):
     * Related field with transferable skills
     * Optimize by highlighting transferable experience
     * Expected improvement: 10-25%
     * Warnings: ["Some experience may not directly align with role requirements"]

   - PIVOT MATCH (e.g., Developer → Technical Project Manager):
     * Career transition with some relevant skills
     * Optimize by emphasizing transferable soft skills and technical background
     * Expected improvement: 5-15%
     * Warnings: ["Significant role change - some experience may seem irrelevant", "Consider adding transitional projects or certifications"]

   - MISMATCH (e.g., Software Engineer → Sales Director, Teacher → Accountant):
     * Completely different career paths
     * Still optimize for formatting, clarity, and transferable skills
     * Expected improvement: 0-10%
     * Warnings: ["⚠️ MAJOR ROLE MISMATCH: This resume does not match the job requirements", "Your experience is in a completely different field", "ATS will likely filter this out regardless of optimization", "Recommendation: Apply to roles matching your actual experience"]

   Note: optimization_possible should ALWAYS be true. We optimize what we can, but warn about limitations.

4. OPTIMIZATION STRATEGIES BY LEVEL:

   CONSERVATIVE (optimization_level = 1):
   - Fix formatting and parsing issues only
   - Improve action verbs
   - Add section headers if missing
   - Reorder bullets to put relevant items first
   - Estimate: 5-15 point improvement

   MODERATE (optimization_level = 2):
   - Everything in Conservative, PLUS:
   - Extract and list implicit skills from experience
   - Quantify achievements with reasonable estimates
   - Add industry-standard terminology
   - Reframe experience to match job keywords (without lying)
   - Estimate: 15-30 point improvement

   AGGRESSIVE (optimization_level = 3):
   - Everything in Moderate, PLUS:
   - Maximum keyword incorporation (while staying truthful)
   - Restructure entire resume for role focus
   - Add detailed skill proficiency levels
   - Create targeted summary statement
   - Estimate: 25-45 point improvement

   Note: NEVER optimize beyond truthfulness regardless of level

5. KEYWORD INTEGRATION RULES:
   - Only add keywords for skills actually used in described work
   - If JD mentions "Python" and resume shows Python work, explicitly list "Python" in skills
   - Don't add "React" if only used "JavaScript" (unless React specifically mentioned)
   - Spell out acronyms: "CI/CD (Continuous Integration/Continuous Deployment)"

6. QUANTIFICATION GUIDELINES:
   - If achievement described but not quantified, add reasonable estimate
   - Example: "Improved performance" → "Improved performance by approximately 20-30%"
   - Mark estimates clearly: "reduced processing time by ~25%"
   - Never invent metrics for unrelated work

7. VALIDATION CHECKLIST:
   Before returning, verify:
   ✓ All companies/dates unchanged
   ✓ All skills were mentioned or clearly implied in original
   ✓ No fabricated projects or achievements
   ✓ Job titles accurate (or clarified, not changed)
   ✓ Education unchanged

PROVIDE OPTIMIZATION IN THIS JSON FORMAT:
{{
    "optimization_possible": true/false,
    "reason": "string (if optimization_possible = false)",
    "role_compatibility": {{
        "job_role": "extracted from JD",
        "resume_role": "extracted from resume",
        "match_level": "DIRECT/ADJACENT/MISMATCH",
        "suitable_for_optimization": true/false
    }},
    "optimized_content": {{
        // Same structure as input resume with optimized content
        // OR null if optimization not possible
    }},
    "changes_made": {{
        "formatting_fixes": ["fix1", "fix2"],
        "keyword_additions": ["keyword1: added to Skills section, was implied by Django REST work"],
        "rewording_improvements": ["original phrase → improved phrase"],
        "quantification_additions": ["Added ~25% estimate to performance improvement claim"],
        "reordering": ["Moved most relevant experience to top"],
        "section_additions": ["Added Skills section", "Added Professional Summary"]
    }},
    "keywords_added": {{
        "from_job_description": ["keyword1", "keyword2"],
        "justification": "These keywords describe work already present in resume"
    }},
    "estimated_ats_improvement": {{
        "before_score": <estimated original score>,
        "after_score": <estimated optimized score>,
        "improvement": <difference>,
        "confidence": "HIGH/MEDIUM/LOW"
    }},
    "optimization_summary": "string describing changes",
    "warnings": [
        "List any limitations or concerns"
    ],
    "authenticity_verification": {{
        "all_companies_unchanged": true/false,
        "all_dates_unchanged": true/false,
        "no_fabricated_skills": true/false,
        "no_invented_projects": true/false
    }}
}}

EXAMPLES OF ACCEPTABLE OPTIMIZATION:

✅ GOOD - Extracting implicit skills:
Original: "Built REST APIs using Django framework"
Optimized: "Developed RESTful APIs using Django REST Framework, Python, and PostgreSQL"
Justification: If they built Django REST APIs, they used Python and likely PostgreSQL

✅ GOOD - Improving action verbs:
Original: "Helped with deployment automation"
Optimized: "Implemented deployment automation reducing release time by ~40%"
Justification: More impactful verb, reasonable metric estimate

✅ GOOD - Adding relevant keywords:
Original: "Created automated testing"
Optimized: "Developed automated testing suite using pytest, achieving 85% code coverage"
Justification: If they did Python testing, pytest is industry standard

❌ BAD - Fabricating skills:
Original: "Frontend development with React"
Optimized: "Full-stack development with React, Vue, Angular, Node.js, MongoDB"
Reason: Added frameworks never mentioned

❌ BAD - Inventing achievements:
Original: "Worked on performance improvements"
Optimized: "Led performance optimization initiative, reducing latency by 70% and saving $200K annually"
Reason: Numbers completely fabricated

❌ BAD - Changing facts:
Original: "Junior Developer at TechCorp (2022-2023)"
Optimized: "Senior Software Engineer at TechCorp (2020-2024)"
Reason: Changed title and dates

REMEMBER: You are helping people present their REAL experience in the best light,
not helping them lie to employers. When in doubt, be conservative.

Optimization Level Guidance: {optimization_guidelines[optimization_level_num]}"""

        try:
            response_text = self._call_claude(system_prompt, user_prompt)
            cleaned_text = self._clean_json_response(response_text)
            response_data = json.loads(cleaned_text)
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
            cleaned_text = self._clean_json_response(response_text)
            response_data = json.loads(cleaned_text)
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
            cleaned_text = self._clean_json_response(response_text)
            response_data = json.loads(cleaned_text)
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
            cleaned_text = self._clean_json_response(response_text)
            response_data = json.loads(cleaned_text)
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
