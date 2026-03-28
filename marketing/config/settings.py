"""
Marketing Automation Configuration
Add your API keys and settings here
"""

import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    # ===========================================
    # REQUIRED: Add your API keys below
    # ===========================================

    # OpenAI API Key (for content generation)
    # Get it from: https://platform.openai.com/api-keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Telegram Bot Token (for Telegram automation)
    # Create bot via @BotFather on Telegram
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHANNEL_ID: str = os.getenv("TELEGRAM_CHANNEL_ID", "")  # e.g., "@resumetips_india"

    # LinkedIn Credentials (for LinkedIn automation)
    # Note: LinkedIn API is restricted. We use cookie-based auth as fallback
    LINKEDIN_EMAIL: str = os.getenv("LINKEDIN_EMAIL", "")
    LINKEDIN_PASSWORD: str = os.getenv("LINKEDIN_PASSWORD", "")
    LINKEDIN_COOKIE: str = os.getenv("LINKEDIN_COOKIE", "")  # li_at cookie value

    # Email Configuration (using Resend - free tier: 100 emails/day)
    # Get it from: https://resend.com
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "hello@resumebuilder.pulsestack.in")

    # ===========================================
    # Product Details (customize for your brand)
    # ===========================================

    PRODUCT_NAME: str = "ResumeBuilder AI"
    PRODUCT_URL: str = "https://resumebuilder.pulsestack.in"
    ATS_CHECKER_URL: str = "https://resumebuilder.pulsestack.in/ats-checker"

    FOUNDER_NAME: str = "Yash"  # Your name for founder-led content
    FOUNDER_LINKEDIN: str = ""  # Your LinkedIn profile URL

    # Target Audience Keywords
    TARGET_KEYWORDS: list = None

    # Pricing for content
    STARTER_PRICE: str = "₹299"
    PRO_PRICE: str = "₹999/month"

    def __post_init__(self):
        if self.TARGET_KEYWORDS is None:
            self.TARGET_KEYWORDS = [
                "freshers", "students", "job seekers", "campus placement",
                "TCS", "Infosys", "Wipro", "Cognizant", "Accenture",
                "resume tips", "ATS", "interview", "first job",
                "tier 2 college", "engineering", "MBA", "BCA", "MCA"
            ]

# ===========================================
# Content Schedule Configuration
# ===========================================

@dataclass
class ScheduleConfig:
    # Posting times (24-hour format, IST)
    LINKEDIN_POST_TIMES: list = None
    TELEGRAM_POST_TIMES: list = None
    YOUTUBE_POST_TIME: str = "18:00"  # 6 PM IST

    # Days to post (0=Monday, 6=Sunday)
    ACTIVE_DAYS: list = None

    def __post_init__(self):
        if self.LINKEDIN_POST_TIMES is None:
            self.LINKEDIN_POST_TIMES = ["09:00", "13:00", "18:00"]
        if self.TELEGRAM_POST_TIMES is None:
            self.TELEGRAM_POST_TIMES = ["10:00", "15:00", "20:00"]
        if self.ACTIVE_DAYS is None:
            self.ACTIVE_DAYS = [0, 1, 2, 3, 4, 5, 6]  # All days

# ===========================================
# Content Templates
# ===========================================

LINKEDIN_POST_TYPES = [
    "carousel",      # 10-slide educational posts
    "story",         # Personal founder story
    "tips",          # Quick tips (numbered list)
    "myth_buster",   # "Myth vs Reality" format
    "case_study",    # User success story
    "poll",          # Engagement poll
    "hot_take",      # Controversial opinion
    "tutorial",      # Step-by-step guide
]

YOUTUBE_SHORT_TYPES = [
    "mistake",       # "X mistakes to avoid"
    "tip",           # Quick actionable tip
    "myth",          # Myth busting
    "comparison",    # Before vs After
    "hack",          # Quick hack/shortcut
    "story",         # Mini success story
]

# Initialize config
config = Config()
schedule = ScheduleConfig()
