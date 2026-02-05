"""
Pydantic schemas for AI-related requests and responses.

This module defines all data validation models for Claude AI operations
including ATS analysis, resume optimization, and content generation.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any


class ATSAnalysisRequest(BaseModel):
    """
    Request schema for ATS score analysis.

    Attributes:
        resume_content: Resume content as JSON or text
        job_description: Target job description
    """
    resume_content: Dict[str, Any] = Field(..., description="Resume data")
    job_description: str = Field(..., min_length=50, max_length=5000)

    @field_validator('job_description')
    @classmethod
    def validate_job_description(cls, v: str) -> str:
        """Validate job description is not empty."""
        v = v.strip()
        if not v:
            raise ValueError('Job description cannot be empty')
        return v


class ATSAnalysisResponse(BaseModel):
    """
    Response schema for ATS score analysis.

    Attributes:
        ats_score: Score from 0-100
        category: Score category (Excellent/Good/Fair/Poor)
        strengths: List of strengths found
        weaknesses: List of areas for improvement
        missing_keywords: Keywords from job description not in resume
        suggestions: Specific improvement suggestions
    """
    ats_score: int = Field(..., ge=0, le=100)
    category: str
    strengths: List[str]
    weaknesses: List[str]
    missing_keywords: List[str]
    suggestions: List[str]


class ResumeOptimizationRequest(BaseModel):
    """
    Request schema for resume optimization.

    Attributes:
        resume_content: Original resume content
        job_description: Target job description
        optimization_level: Level of optimization (light/moderate/aggressive)
    """
    resume_content: Dict[str, Any]
    job_description: str = Field(..., min_length=50, max_length=5000)
    optimization_level: str = Field(default="moderate", pattern="^(light|moderate|aggressive)$")


class ResumeOptimizationResponse(BaseModel):
    """
    Response schema for resume optimization.

    Attributes:
        optimized_content: Optimized resume content
        changes_made: List of changes applied
        ats_score_improvement: Estimated score improvement
        summary: Summary of optimization
    """
    optimized_content: Dict[str, Any]
    changes_made: List[str]
    ats_score_improvement: int
    summary: str


class KeywordExtractionRequest(BaseModel):
    """
    Request schema for keyword extraction.

    Attributes:
        job_description: Job description text
        max_keywords: Maximum number of keywords to extract
    """
    job_description: str = Field(..., min_length=50, max_length=5000)
    max_keywords: int = Field(default=20, ge=5, le=50)


class KeywordExtractionResponse(BaseModel):
    """
    Response schema for keyword extraction.

    Attributes:
        keywords: List of extracted keywords
        skills: Technical and soft skills identified
        qualifications: Required qualifications
        categories: Keywords grouped by category
    """
    keywords: List[str]
    skills: Dict[str, List[str]]  # {technical: [...], soft: [...]}
    qualifications: List[str]
    categories: Dict[str, List[str]]


class CoverLetterRequest(BaseModel):
    """
    Request schema for cover letter generation.

    Attributes:
        resume_content: User's resume data
        job_description: Target job description
        company_name: Name of the company
        hiring_manager: Hiring manager's name (optional)
        tone: Writing tone (professional/enthusiastic/formal)
    """
    resume_content: Dict[str, Any]
    job_description: str = Field(..., min_length=50, max_length=5000)
    company_name: str = Field(..., min_length=2, max_length=100)
    hiring_manager: Optional[str] = Field(None, max_length=100)
    tone: str = Field(default="professional", pattern="^(professional|enthusiastic|formal)$")


class CoverLetterResponse(BaseModel):
    """
    Response schema for cover letter generation.

    Attributes:
        cover_letter: Generated cover letter text
        key_highlights: Main points highlighted
        word_count: Total word count
    """
    cover_letter: str
    key_highlights: List[str]
    word_count: int


class LinkedInOptimizationRequest(BaseModel):
    """
    Request schema for LinkedIn profile optimization.

    Attributes:
        current_profile: Current LinkedIn profile data
        target_role: Target job role/title
        industry: Target industry
    """
    current_profile: Dict[str, Any]
    target_role: str = Field(..., min_length=3, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)


class LinkedInOptimizationResponse(BaseModel):
    """
    Response schema for LinkedIn profile optimization.

    Attributes:
        optimized_headline: Optimized headline
        optimized_summary: Optimized about section
        skill_recommendations: Skills to add/highlight
        keywords_to_include: SEO keywords for profile
        improvements: List of suggested improvements
    """
    optimized_headline: str
    optimized_summary: str
    skill_recommendations: List[str]
    keywords_to_include: List[str]
    improvements: List[str]


class AIUsageStats(BaseModel):
    """
    Schema for tracking AI usage statistics.

    Attributes:
        operation_type: Type of AI operation
        tokens_used: Number of tokens consumed
        processing_time: Time taken in seconds
        success: Whether operation succeeded
    """
    operation_type: str
    tokens_used: Optional[int] = None
    processing_time: float
    success: bool


class AIError(BaseModel):
    """
    Schema for AI service errors.

    Attributes:
        error_type: Type of error
        message: Error message
        details: Additional error details
    """
    error_type: str
    message: str
    details: Optional[Dict[str, Any]] = None
