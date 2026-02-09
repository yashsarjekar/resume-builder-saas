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
    job_description: str = Field(..., min_length=50, max_length=7000)

    @field_validator('job_description')
    @classmethod
    def validate_job_description(cls, v: str) -> str:
        """Validate job description is not empty."""
        v = v.strip()
        if not v:
            raise ValueError('Job description cannot be empty')
        return v


class DimensionScores(BaseModel):
    """Scores for each ATS analysis dimension."""
    role_alignment: int = Field(..., ge=0, le=100)
    technical_compatibility: int = Field(..., ge=0, le=100)
    content_match: int = Field(..., ge=0, le=100)
    experience_quality: int = Field(..., ge=0, le=100)


class RoleAnalysis(BaseModel):
    """Analysis of role match between job and resume."""
    job_role_type: str
    resume_role_type: str
    match_level: str  # DIRECT/ADJACENT/PIVOT/MISMATCH
    explanation: str


class TechnicalIssue(BaseModel):
    """Individual technical ATS issue."""
    issue: str
    severity: str  # HIGH/MEDIUM/LOW
    fix: str


class KeywordAnalysis(BaseModel):
    """Keyword matching analysis."""
    matched_keywords: List[str]
    missing_critical_keywords: List[str]
    missing_recommended_keywords: List[str]
    keyword_density: str  # OPTIMAL/LOW/STUFFED


class StrengthItem(BaseModel):
    """Individual strength."""
    category: str
    detail: str


class WeaknessItem(BaseModel):
    """Individual weakness."""
    category: str
    detail: str
    priority: str  # HIGH/MEDIUM/LOW


class ActionableSuggestion(BaseModel):
    """Actionable improvement suggestion."""
    action: str
    rationale: str
    priority: str  # HIGH/MEDIUM/LOW
    example: Optional[str] = None


class MissingElements(BaseModel):
    """Missing resume elements."""
    required_skills: List[str]
    required_qualifications: List[str]
    recommended_additions: List[str]


class ATSAnalysisResponse(BaseModel):
    """
    Comprehensive ATS analysis response.

    Attributes:
        overall_ats_score: Overall score from 0-100
        category: Score category
        dimension_scores: Scores by dimension
        role_analysis: Role matching analysis
        technical_issues: ATS technical parsing issues
        keyword_analysis: Keyword matching details
        strengths: Resume strengths
        weaknesses: Areas for improvement
        actionable_suggestions: Prioritized action items
        missing_elements: Missing required/recommended elements
    """
    overall_ats_score: int = Field(..., ge=0, le=100)
    category: str
    dimension_scores: DimensionScores
    role_analysis: RoleAnalysis
    technical_issues: List[TechnicalIssue]
    keyword_analysis: KeywordAnalysis
    strengths: List[StrengthItem]
    weaknesses: List[WeaknessItem]
    actionable_suggestions: List[ActionableSuggestion]
    missing_elements: MissingElements

    # Backwards compatibility fields (deprecated but kept for old API calls)
    @property
    def ats_score(self) -> int:
        """Alias for overall_ats_score (backwards compatibility)."""
        return self.overall_ats_score


class ResumeOptimizationRequest(BaseModel):
    """
    Request schema for resume optimization.

    Attributes:
        resume_content: Original resume content
        job_description: Target job description
        optimization_level: Level of optimization (light/moderate/aggressive)
    """
    resume_content: Dict[str, Any]
    job_description: str = Field(..., min_length=50, max_length=7000)
    optimization_level: str = Field(default="moderate", pattern="^(light|moderate|aggressive)$")


class RoleCompatibility(BaseModel):
    """Role compatibility assessment."""
    job_role: str
    resume_role: str
    match_level: str  # DIRECT/ADJACENT/MISMATCH
    suitable_for_optimization: bool


class ChangesMade(BaseModel):
    """Detailed changes made during optimization."""
    formatting_fixes: List[str]
    keyword_additions: List[str]
    rewording_improvements: List[str]
    quantification_additions: List[str]
    reordering: List[str]
    section_additions: List[str]


class KeywordsAdded(BaseModel):
    """Keywords added during optimization."""
    from_job_description: List[str]
    justification: str


class EstimatedATSImprovement(BaseModel):
    """Estimated ATS score improvement."""
    before_score: int
    after_score: int
    improvement: int
    confidence: str  # HIGH/MEDIUM/LOW


class AuthenticityVerification(BaseModel):
    """Verification that optimization maintained authenticity."""
    all_companies_unchanged: bool
    all_dates_unchanged: bool
    no_fabricated_skills: bool
    no_invented_projects: bool


class ResumeOptimizationResponse(BaseModel):
    """
    Response schema for resume optimization.

    Attributes:
        optimization_possible: Whether optimization could be performed
        reason: Reason if optimization not possible
        role_compatibility: Role match analysis
        optimized_content: Optimized resume content (or None)
        changes_made: Detailed changes applied
        keywords_added: Keywords incorporated with justification
        estimated_ats_improvement: Before/after score estimates
        optimization_summary: Summary of changes
        warnings: List of limitations or concerns
        authenticity_verification: Verification of maintained authenticity
    """
    optimization_possible: bool
    reason: Optional[str] = None
    role_compatibility: RoleCompatibility
    optimized_content: Optional[Dict[str, Any]] = None
    changes_made: ChangesMade
    keywords_added: KeywordsAdded
    estimated_ats_improvement: EstimatedATSImprovement
    optimization_summary: str
    warnings: List[str]
    authenticity_verification: AuthenticityVerification

    # Backwards compatibility properties
    @property
    def ats_score_improvement(self) -> int:
        """Alias for estimated improvement (backwards compatibility)."""
        return self.estimated_ats_improvement.improvement

    @property
    def summary(self) -> str:
        """Alias for optimization_summary (backwards compatibility)."""
        return self.optimization_summary


class KeywordExtractionRequest(BaseModel):
    """
    Request schema for keyword extraction.

    Attributes:
        job_description: Job description text
        max_keywords: Maximum number of keywords to extract
    """
    job_description: str = Field(..., min_length=50, max_length=7000)
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
    job_description: str = Field(..., min_length=50, max_length=7000)
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
