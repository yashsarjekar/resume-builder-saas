"""
Pytest configuration and fixtures.

This module provides shared fixtures for all test modules.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User, SubscriptionType
from app.utils.auth import hash_password


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Create a fresh database session for each test.

    Yields:
        Session: SQLAlchemy database session
    """
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Create session
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    Create a test client with overridden database dependency.

    Args:
        db_session: Database session fixture

    Yields:
        TestClient: FastAPI test client
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """
    Create a test user in the database.

    Args:
        db_session: Database session fixture

    Returns:
        User: Created test user
    """
    user = User(
        email="test@example.com",
        name="Test User",
        password_hash=hash_password("testpass123"),
        subscription_type=SubscriptionType.FREE,
        resume_count=0,
        ats_analysis_count=0
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_user_token(client, test_user):
    """
    Create a test user and return their JWT token.

    Args:
        client: Test client fixture
        test_user: Test user fixture

    Returns:
        str: JWT access token
    """
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(test_user_token):
    """
    Create authorization headers with JWT token.

    Args:
        test_user_token: JWT token fixture

    Returns:
        dict: Headers with Bearer token
    """
    return {"Authorization": f"Bearer {test_user_token}"}


@pytest.fixture
def starter_user(db_session):
    """
    Create a test user with STARTER subscription.

    Args:
        db_session: Database session fixture

    Returns:
        User: Created starter user
    """
    from datetime import datetime, timedelta

    user = User(
        email="starter@example.com",
        name="Starter User",
        password_hash=hash_password("starter123"),
        subscription_type=SubscriptionType.STARTER,
        subscription_expiry=datetime.utcnow() + timedelta(days=30),
        resume_count=2,
        ats_analysis_count=5
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def pro_user(db_session):
    """
    Create a test user with PRO subscription.

    Args:
        db_session: Database session fixture

    Returns:
        User: Created pro user
    """
    from datetime import datetime, timedelta

    user = User(
        email="pro@example.com",
        name="Pro User",
        password_hash=hash_password("pro123"),
        subscription_type=SubscriptionType.PRO,
        subscription_expiry=datetime.utcnow() + timedelta(days=30),
        resume_count=10,
        ats_analysis_count=50
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_resume(db_session, test_user):
    """
    Create a test resume.

    Args:
        db_session: Database session fixture
        test_user: Test user fixture

    Returns:
        Resume: Created resume
    """
    from app.models.resume import Resume

    resume = Resume(
        user_id=test_user.id,
        title="Software Engineer Resume",
        content={
            "personalInfo": {
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "1234567890",
                "location": "Mumbai, India"
            },
            "experience": [
                {
                    "company": "Tech Corp",
                    "position": "Software Engineer",
                    "duration": "2020-2023",
                    "description": "Developed web applications using Python and React"
                }
            ],
            "education": [
                {
                    "institution": "IIT Mumbai",
                    "degree": "B.Tech in Computer Science",
                    "year": "2020"
                }
            ],
            "skills": ["Python", "React", "Django", "PostgreSQL"]
        },
        template_name="modern"
    )
    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)
    return resume
