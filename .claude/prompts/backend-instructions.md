# Backend Development Instructions

You are building a Resume Builder SaaS backend using FastAPI. Follow these instructions carefully.

## Context
- **Project**: Resume Builder SaaS for Indian job seekers
- **Tech Stack**: FastAPI, PostgreSQL, SQLAlchemy, Claude AI, Razorpay
- **Purpose**: Generate ATS-optimized resumes using AI

## Project Structure to Create
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── resume.py
│   │   └── payment.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── resume.py
│   │   ├── ai.py
│   │   └── payment.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── claude_service.py
│   │   └── pdf_service.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── resume.py
│   │   └── ai.py
│   └── utils/
│       ├── __init__.py
│       ├── helpers.py
│       └── validators.py
├── alembic/
│   └── versions/
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

## Implementation Steps

### Step 1: Setup & Dependencies

Create `requirements.txt` with:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1
pydantic[email]==2.5.3
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
anthropic==0.18.1
python-dotenv==1.0.0
reportlab==4.0.9
razorpay==1.4.1
redis==5.0.1
```

Create `.env.example`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/resumebuilder
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ANTHROPIC_API_KEY=your-claude-api-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

### Step 2: Database Models

**app/models/user.py:**
```python
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
import enum

class SubscriptionType(str, enum.Enum):
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    subscription_type = Column(Enum(SubscriptionType), default=SubscriptionType.FREE)
    subscription_expiry = Column(DateTime, nullable=True)
    resume_count = Column(Integer, default=0)
    ats_analysis_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
```

**app/models/resume.py:**
```python
from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    job_description = Column(Text, nullable=True)
    content = Column(JSON, nullable=False)  # Original resume data
    optimized_content = Column(JSON, nullable=True)  # AI-optimized version
    ats_score = Column(Integer, nullable=True)
    template_name = Column(String, default="modern")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="resumes")
```

**app/models/payment.py:**
```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
import enum

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    amount = Column(Integer, nullable=False)  # in paise
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    subscription_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="payments")
```

### Step 3: Database Connection

**app/database.py:**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 4: Configuration

**app/config.py:**
```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    ANTHROPIC_API_KEY: str
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

### Step 5: Authentication

**app/routes/auth.py** - Complete implementation with:
- POST /signup - Register user
- POST /login - Login user
- GET /me - Get current user
- JWT token generation
- Password hashing with bcrypt
- Input validation

### Step 6: Claude AI Service

**app/services/claude_service.py** - Implement:
- `analyze_ats_score()` - Analyze resume against job description
- `optimize_resume()` - Generate optimized resume
- `extract_keywords()` - Extract keywords from job description
- `generate_cover_letter()` - Generate cover letter
- Error handling and retry logic
- Response caching

### Step 7: Resume Routes

**app/routes/resume.py** - Implement CRUD:
- GET / - List user's resumes
- POST / - Create new resume
- GET /{id} - Get specific resume
- PUT /{id} - Update resume
- DELETE /{id} - Delete resume
- POST /{id}/download - Generate PDF

### Step 8: AI Routes

**app/routes/ai.py** - Implement:
- POST /analyze-ats - ATS score analysis
- POST /optimize-resume - Resume optimization
- POST /extract-keywords - Keyword extraction
- POST /generate-cover-letter - Cover letter generation

### Step 9: Payment Integration

**app/routes/payment.py** - Implement:
- POST /create-order - Create Razorpay order
- POST /verify-payment - Verify payment signature
- Subscription logic

### Step 10: PDF Generation

**app/services/pdf_service.py** - Implement:
- Generate PDF from resume data
- Support multiple templates
- Proper formatting

### Step 11: Main Application

**app/main.py:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, resume, ai, payment
from .config import get_settings

settings = get_settings()

app = FastAPI(
    title="Resume Builder API",
    description="AI-powered ATS-optimized resume builder",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Features"])
app.include_router(payment.router, prefix="/api/payment", tags=["Payment"])

@app.get("/")
def root():
    return {"message": "Resume Builder API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## Code Quality Standards

1. **Type Hints**: Use type hints for all functions
2. **Docstrings**: Add Google-style docstrings
3. **Error Handling**: Wrap external calls in try-except
4. **Validation**: Use Pydantic models for all inputs
5. **Security**: Never log sensitive data
6. **Testing**: Write unit tests for critical functions

## Implementation Order

1. Create all folders and `__init__.py` files
2. Implement models (user, resume, payment)
3. Set up database connection
4. Implement authentication (routes/auth.py)
5. Implement Claude service (services/claude_service.py)
6. Implement resume routes (routes/resume.py)
7. Implement AI routes (routes/ai.py)
8. Implement PDF service (services/pdf_service.py)
9. Implement payment routes (routes/payment.py)
10. Create main.py
11. Set up Alembic migrations
12. Write tests

## Success Criteria

- All endpoints return proper status codes
- Authentication works with JWT tokens
- Claude AI integration returns valid responses
- PDF generation works
- Database migrations run successfully
- Code follows PEP 8 standards
- All functions have type hints and docstrings

---

**Start implementing now. Create the folder structure first, then implement each module step by step. Ask for confirmation after completing each major component.**