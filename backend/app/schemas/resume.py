"""
Pydantic schemas for resume-related requests and responses.

This module defines all data validation models for resume CRUD operations,
including creation, updates, and responses.
"""

from pydantic import BaseModel, Field, field_validator, computed_field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ResumeBase(BaseModel):
    """Base resume schema with common fields."""
    title: str = Field(..., min_length=3, max_length=200)
    job_description: Optional[str] = Field(None, max_length=5000)
    template_name: str = Field(default="modern", pattern="^(modern|classic|minimal|professional)$")

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate and clean title."""
        v = v.strip()
        if not v:
            raise ValueError('Title cannot be empty')
        return v


class ResumeCreate(ResumeBase):
    """
    Schema for creating a new resume.

    Attributes:
        title: Resume title/name
        job_description: Optional job description to optimize for
        content: Resume data as JSON structure
        template_name: PDF template to use
    """
    content: Dict[str, Any] = Field(..., description="Resume content as JSON")

    @field_validator('content')
    @classmethod
    def validate_content(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate resume content has required fields."""
        required_fields = ['personalInfo', 'experience', 'education']

        for field in required_fields:
            if field not in v:
                raise ValueError(f'Resume content must include {field}')

        # Validate personal info has minimum required fields
        if 'name' not in v.get('personalInfo', {}):
            raise ValueError('Personal info must include name')

        return v


class ResumeUpdate(BaseModel):
    """
    Schema for updating an existing resume.

    All fields are optional for partial updates.

    Attributes:
        title: Updated title
        job_description: Updated job description
        content: Updated resume content
        template_name: Updated template
    """
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    job_description: Optional[str] = Field(None, max_length=5000)
    content: Optional[Dict[str, Any]] = None
    template_name: Optional[str] = Field(None, pattern="^(modern|classic|minimal|professional)$")

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate title if provided."""
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Title cannot be empty')
        return v


class ResumeResponse(ResumeBase):
    """
    Schema for resume data in API responses.

    Attributes:
        id: Resume ID
        user_id: Owner's user ID
        title: Resume title
        job_description: Job description
        content: Resume content
        optimized_content: AI-optimized content (if available)
        ats_score: ATS score (if analyzed)
        ats_category: Score category
        template_name: PDF template
        has_optimization: Whether resume has been optimized
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    id: int
    user_id: int
    content: Dict[str, Any]
    optimized_content: Optional[Dict[str, Any]] = None
    ats_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def ats_category(self) -> Optional[str]:
        """Compute ATS score category."""
        if self.ats_score is None:
            return None
        if self.ats_score >= 80:
            return "Excellent"
        elif self.ats_score >= 60:
            return "Good"
        elif self.ats_score >= 40:
            return "Fair"
        else:
            return "Poor"

    @computed_field
    @property
    def has_optimization(self) -> bool:
        """Check if resume has optimization."""
        return self.optimized_content is not None

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class ResumeListItem(BaseModel):
    """
    Schema for resume in list view (summary without full content).

    Attributes:
        id: Resume ID
        title: Resume title
        ats_score: ATS score if available
        ats_category: Score category
        has_optimization: Whether optimized
        template_name: Template name
        created_at: Creation date
        updated_at: Last update date
    """
    id: int
    title: str
    ats_score: Optional[int] = None
    optimized_content: Optional[Dict[str, Any]] = None
    template_name: str
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def ats_category(self) -> Optional[str]:
        """Compute ATS score category."""
        if self.ats_score is None:
            return None
        if self.ats_score >= 80:
            return "Excellent"
        elif self.ats_score >= 60:
            return "Good"
        elif self.ats_score >= 40:
            return "Fair"
        else:
            return "Poor"

    @computed_field
    @property
    def has_optimization(self) -> bool:
        """Check if resume has optimization."""
        return self.optimized_content is not None

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class ResumeListResponse(BaseModel):
    """
    Schema for paginated resume list response.

    Attributes:
        resumes: List of resume summaries
        total: Total number of resumes
        page: Current page number
        page_size: Number of items per page
        total_pages: Total number of pages
    """
    resumes: List[ResumeListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class ResumeOptimizeRequest(BaseModel):
    """
    Schema for resume optimization request.

    Attributes:
        job_description: Job description to optimize for
        optimization_level: Optimization intensity
    """
    job_description: str = Field(..., min_length=50, max_length=5000)
    optimization_level: str = Field(default="moderate", pattern="^(light|moderate|aggressive)$")


class ResumeAnalyzeRequest(BaseModel):
    """
    Schema for ATS analysis request.

    Attributes:
        job_description: Job description to analyze against
    """
    job_description: str = Field(..., min_length=50, max_length=5000)


class PDFDownloadRequest(BaseModel):
    """
    Schema for PDF download request.

    Attributes:
        use_optimized: Whether to use optimized content
        template_name: Optional template override
    """
    use_optimized: bool = Field(default=False)
    template_name: Optional[str] = Field(None, pattern="^(modern|classic|minimal|professional)$")


class ResumeStats(BaseModel):
    """
    Schema for resume statistics.

    Attributes:
        total_resumes: Total number of resumes
        optimized_count: Number of optimized resumes
        average_ats_score: Average ATS score
        templates_used: Count of each template type
    """
    total_resumes: int
    optimized_count: int
    average_ats_score: Optional[float] = None
    templates_used: Dict[str, int]
