"""Pydantic schemas for Portfolio endpoints."""

from typing import Any, List, Optional
from pydantic import BaseModel, Field, validator
import re


# ── Sub-schemas ────────────────────────────────────────────────────────────────

class SkillGroup(BaseModel):
    category: str
    items: List[str]

class ExperienceItem(BaseModel):
    company:     str
    role:        str
    duration:    str
    description: Optional[str] = ""
    tech:        List[str] = []

class ProjectItem(BaseModel):
    name:        str
    description: Optional[str] = ""
    tech:        List[str] = []
    live_url:    Optional[str] = None
    github_url:  Optional[str] = None
    gradient:    Optional[str] = "from-indigo-500 to-purple-600"


# ── Request schemas ────────────────────────────────────────────────────────────

class PortfolioUpsertRequest(BaseModel):
    slug:         str = Field(..., min_length=2, max_length=60)
    name:         str = Field(..., min_length=1, max_length=200)
    title:        Optional[str] = None
    bio:          Optional[str] = None
    photo_url:    Optional[str] = None
    email:        Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url:   Optional[str] = None
    location:     Optional[str] = None
    website_url:  Optional[str] = None

    skills:     List[SkillGroup]    = []
    experience: List[ExperienceItem] = []
    projects:   List[ProjectItem]   = []

    theme:      str = "indigo"
    is_public:  bool = True

    @validator("slug")
    def slug_format(cls, v: str) -> str:
        cleaned = re.sub(r"[^a-z0-9\-]", "", v.lower().replace(" ", "-"))
        if not cleaned:
            raise ValueError("Slug must contain at least one alphanumeric character")
        return cleaned

    @validator("theme")
    def valid_theme(cls, v: str) -> str:
        if v not in ("indigo", "emerald", "amber", "rose"):
            raise ValueError("Theme must be one of: indigo, emerald, amber, rose")
        return v


# ── Response schemas ───────────────────────────────────────────────────────────

class PortfolioResponse(BaseModel):
    id:           int
    user_id:      int
    slug:         str
    is_public:    bool
    name:         str
    title:        Optional[str]
    bio:          Optional[str]
    photo_url:    Optional[str]
    email:        Optional[str]
    linkedin_url: Optional[str]
    github_url:   Optional[str]
    location:     Optional[str]
    website_url:  Optional[str]
    skills:       List[Any]
    experience:   List[Any]
    projects:     List[Any]
    theme:        str
    views_count:  int
    portfolio_url: str

    class Config:
        from_attributes = True


class PublicPortfolioResponse(BaseModel):
    """Returned by the public GET /api/portfolio/p/{slug} endpoint."""
    slug:         str
    name:         str
    title:        Optional[str]
    bio:          Optional[str]
    photo_url:    Optional[str]
    email:        Optional[str]
    linkedin_url: Optional[str]
    github_url:   Optional[str]
    location:     Optional[str]
    website_url:  Optional[str]
    skills:       List[Any]
    experience:   List[Any]
    projects:     List[Any]
    theme:        str
    views_count:  int

    class Config:
        from_attributes = True


class SlugCheckResponse(BaseModel):
    slug:      str
    available: bool
