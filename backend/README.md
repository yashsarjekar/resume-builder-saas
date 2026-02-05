# Resume Builder SaaS - Backend API

AI-powered ATS-optimized resume builder backend using FastAPI, PostgreSQL, Claude AI, and Razorpay.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI**: Claude AI (Anthropic)
- **Payment**: Razorpay
- **Authentication**: JWT with bcrypt
- **PDF Generation**: ReportLab

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py              # Configuration management
│   ├── database.py            # Database connection and session
│   ├── dependencies.py        # FastAPI dependencies
│   ├── models/                # SQLAlchemy database models
│   │   ├── user.py           # User model
│   │   ├── resume.py         # Resume model
│   │   └── payment.py        # Payment model
│   ├── routes/               # API route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── resume.py        # Resume CRUD endpoints
│   │   ├── ai.py            # AI feature endpoints
│   │   └── payment.py       # Payment endpoints
│   ├── services/            # Business logic
│   │   ├── claude_service.py  # Claude AI integration
│   │   └── pdf_service.py     # PDF generation
│   ├── schemas/             # Pydantic models for validation
│   │   ├── user.py
│   │   ├── resume.py
│   │   └── ai.py
│   └── utils/              # Helper functions
│       ├── helpers.py
│       └── validators.py
├── alembic/               # Database migrations
├── tests/                 # Unit and integration tests
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Setup Instructions

### 1. Prerequisites

- Python 3.9 or higher
- PostgreSQL 14 or higher
- pip (Python package manager)

### 2. Clone and Navigate

```bash
cd backend
```

### 3. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your actual values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/resumebuilder
SECRET_KEY=your-secret-key-here
ANTHROPIC_API_KEY=your-claude-api-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### 6. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE resumebuilder;
```

### 7. Run Migrations (Coming in Phase 10)

```bash
alembic upgrade head
```

### 8. Run the Application

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 9. Access API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Models

### User Model
- Stores user account information
- Manages subscription tiers (FREE, STARTER, PRO)
- Tracks usage counts for resume creation and ATS analysis

### Resume Model
- Stores resume content as JSON
- Supports AI optimization and ATS scoring
- Multiple template support

### Payment Model
- Tracks Razorpay payment transactions
- Links payments to subscriptions
- Handles payment status (PENDING, SUCCESS, FAILED)

## Subscription Tiers

| Tier | Resume Limit | ATS Analysis Limit | Price |
|------|--------------|-------------------|-------|
| FREE | 1 | 2 | Free |
| STARTER | 5 | 10 | ₹299/month |
| PRO | Unlimited | Unlimited | ₹599/month |

## Development

### Running Tests

```bash
pytest tests/ -v
```

### Code Style

```bash
# Format code
black app/

# Check linting
flake8 app/

# Type checking
mypy app/
```

## API Endpoints (Coming in later phases)

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resume Management
- `GET /api/resume` - List user resumes
- `POST /api/resume` - Create new resume
- `GET /api/resume/{id}` - Get specific resume
- `PUT /api/resume/{id}` - Update resume
- `DELETE /api/resume/{id}` - Delete resume
- `POST /api/resume/{id}/download` - Download PDF

### AI Features
- `POST /api/ai/analyze-ats` - Analyze ATS score
- `POST /api/ai/optimize-resume` - Optimize resume
- `POST /api/ai/extract-keywords` - Extract keywords
- `POST /api/ai/generate-cover-letter` - Generate cover letter

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment
- `GET /api/payment/subscription-status` - Check subscription

## Security

- Passwords hashed with bcrypt
- JWT token-based authentication
- CORS configured for frontend
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy ORM
- Rate limiting implemented

## License

Proprietary - Resume Builder SaaS

## Support

For issues and questions, contact the development team.
