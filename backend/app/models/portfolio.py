"""
Portfolio model — one portfolio per user, publicly accessible by slug.
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Integer, String, Text,
    ForeignKey, Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    slug        = Column(String(100), unique=True, nullable=False, index=True)
    is_public   = Column(Boolean, default=True, nullable=False)

    # Basic info
    name        = Column(String(200), nullable=False)
    title       = Column(String(200), nullable=True)   # e.g. "Full Stack Developer"
    bio         = Column(Text, nullable=True)
    photo_url   = Column(String(1000), nullable=True)  # URL or null (use default 3D avatar)
    email       = Column(String(200), nullable=True)
    linkedin_url = Column(String(1000), nullable=True)
    github_url   = Column(String(1000), nullable=True)
    location     = Column(String(200), nullable=True)
    website_url  = Column(String(1000), nullable=True)

    # Rich data stored as JSONB arrays
    # skills:     [{"category": "Technical", "items": ["React", "Python", ...]}, ...]
    # experience: [{"company": "", "role": "", "duration": "", "description": "", "tech": []}, ...]
    # projects:   [{"name": "", "description": "", "tech": [], "live_url": "", "github_url": "", "gradient": ""}, ...]
    skills      = Column(JSONB, nullable=False, default=list)
    experience  = Column(JSONB, nullable=False, default=list)
    projects    = Column(JSONB, nullable=False, default=list)

    # Appearance
    theme       = Column(String(20), nullable=False, default="indigo")  # indigo | emerald | amber | rose

    # Analytics
    views_count = Column(Integer, nullable=False, default=0)

    created_at  = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at  = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to user (optional convenience)
    user = relationship("User", backref="portfolio", uselist=False)

    def __repr__(self) -> str:
        return f"<Portfolio(id={self.id}, slug='{self.slug}', user_id={self.user_id})>"
