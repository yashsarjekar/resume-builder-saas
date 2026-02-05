"""
Test cases for resume endpoints.

This module contains comprehensive tests for all resume-related
API endpoints including CRUD operations, pagination, and authorization.
"""

import pytest
from fastapi import status


# Sample resume content for testing
SAMPLE_RESUME_CONTENT = {
    "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+91-9876543210",
        "location": "Mumbai, India"
    },
    "experience": [
        {
            "title": "Software Engineer",
            "company": "Tech Corp",
            "duration": "2020-2023",
            "description": "Developed web applications"
        }
    ],
    "education": [
        {
            "degree": "B.Tech",
            "institution": "IIT Delhi",
            "year": "2020"
        }
    ],
    "skills": ["Python", "FastAPI", "React"]
}


class TestListResumes:
    """Test cases for GET /api/resume endpoint."""

    def test_list_resumes_empty(self, client, auth_headers):
        """Test listing resumes when user has none."""
        response = client.get("/api/resume", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["resumes"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["total_pages"] == 0

    def test_list_resumes_with_data(self, client, auth_headers, test_user, db_session):
        """Test listing resumes with existing resumes."""
        from app.models.resume import Resume

        # Create test resumes
        for i in range(3):
            resume = Resume(
                user_id=test_user.id,
                title=f"Resume {i+1}",
                content=SAMPLE_RESUME_CONTENT,
                template_name="modern"
            )
            db_session.add(resume)
        db_session.commit()

        response = client.get("/api/resume", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["resumes"]) == 3
        assert data["total"] == 3
        assert data["total_pages"] == 1

    def test_list_resumes_pagination(self, client, auth_headers, test_user, db_session):
        """Test pagination in resume listing."""
        from app.models.resume import Resume

        # Create 15 test resumes
        for i in range(15):
            resume = Resume(
                user_id=test_user.id,
                title=f"Resume {i+1}",
                content=SAMPLE_RESUME_CONTENT,
                template_name="modern"
            )
            db_session.add(resume)
        db_session.commit()

        # Test page 1
        response = client.get("/api/resume?page=1&page_size=10", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["resumes"]) == 10
        assert data["total"] == 15
        assert data["page"] == 1
        assert data["total_pages"] == 2

        # Test page 2
        response = client.get("/api/resume?page=2&page_size=10", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["resumes"]) == 5
        assert data["page"] == 2

    def test_list_resumes_custom_page_size(self, client, auth_headers, test_user, db_session):
        """Test custom page size."""
        from app.models.resume import Resume

        # Create 10 resumes
        for i in range(10):
            resume = Resume(
                user_id=test_user.id,
                title=f"Resume {i+1}",
                content=SAMPLE_RESUME_CONTENT,
                template_name="modern"
            )
            db_session.add(resume)
        db_session.commit()

        response = client.get("/api/resume?page=1&page_size=5", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["resumes"]) == 5
        assert data["page_size"] == 5
        assert data["total_pages"] == 2

    def test_list_resumes_unauthenticated(self, client):
        """Test listing resumes without authentication."""
        response = client.get("/api/resume")
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestCreateResume:
    """Test cases for POST /api/resume endpoint."""

    def test_create_resume_success(self, client, auth_headers):
        """Test successful resume creation."""
        resume_data = {
            "title": "Software Engineer Resume",
            "content": SAMPLE_RESUME_CONTENT,
            "template_name": "modern"
        }

        response = client.post("/api/resume", headers=auth_headers, json=resume_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "Software Engineer Resume"
        assert data["template_name"] == "modern"
        assert data["content"] == SAMPLE_RESUME_CONTENT
        assert "id" in data
        assert data["has_optimization"] is False

    def test_create_resume_with_job_description(self, client, auth_headers):
        """Test creating resume with job description."""
        resume_data = {
            "title": "Data Scientist Resume",
            "content": SAMPLE_RESUME_CONTENT,
            "job_description": "Looking for a data scientist with Python and ML experience",
            "template_name": "classic"
        }

        response = client.post("/api/resume", headers=auth_headers, json=resume_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["job_description"] == resume_data["job_description"]

    def test_create_resume_missing_required_fields(self, client, auth_headers):
        """Test creating resume with missing required fields."""
        # Missing experience
        invalid_content = {
            "personalInfo": {"name": "John Doe"},
            "education": []
        }

        resume_data = {
            "title": "Invalid Resume",
            "content": invalid_content
        }

        response = client.post("/api/resume", headers=auth_headers, json=resume_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_resume_invalid_template(self, client, auth_headers):
        """Test creating resume with invalid template name."""
        resume_data = {
            "title": "Test Resume",
            "content": SAMPLE_RESUME_CONTENT,
            "template_name": "invalid_template"
        }

        response = client.post("/api/resume", headers=auth_headers, json=resume_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_resume_limit_exceeded(self, client, auth_headers, test_user, db_session):
        """Test creating resume when limit is exceeded."""
        from app.models.resume import Resume

        # Set user's resume count to limit (free tier = 1)
        test_user.resume_count = 1
        db_session.commit()

        resume_data = {
            "title": "Test Resume",
            "content": SAMPLE_RESUME_CONTENT
        }

        response = client.post("/api/resume", headers=auth_headers, json=resume_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "limit" in response.json()["detail"].lower()

    def test_create_resume_unauthenticated(self, client):
        """Test creating resume without authentication."""
        resume_data = {
            "title": "Test Resume",
            "content": SAMPLE_RESUME_CONTENT
        }

        response = client.post("/api/resume", json=resume_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestGetResume:
    """Test cases for GET /api/resume/{id} endpoint."""

    def test_get_resume_success(self, client, auth_headers, test_user, db_session):
        """Test successfully retrieving a resume."""
        from app.models.resume import Resume

        # Create test resume
        resume = Resume(
            user_id=test_user.id,
            title="Test Resume",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern"
        )
        db_session.add(resume)
        db_session.commit()
        db_session.refresh(resume)

        response = client.get(f"/api/resume/{resume.id}", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == resume.id
        assert data["title"] == "Test Resume"
        assert data["content"] == SAMPLE_RESUME_CONTENT

    def test_get_resume_not_found(self, client, auth_headers):
        """Test getting non-existent resume."""
        response = client.get("/api/resume/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_resume_unauthorized(self, client, auth_headers, db_session, starter_user):
        """Test getting another user's resume."""
        from app.models.resume import Resume

        # Create resume for different user
        resume = Resume(
            user_id=starter_user.id,
            title="Other User's Resume",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern"
        )
        db_session.add(resume)
        db_session.commit()
        db_session.refresh(resume)

        # Try to access with test_user's token
        response = client.get(f"/api/resume/{resume.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestUpdateResume:
    """Test cases for PUT /api/resume/{id} endpoint."""

    def test_update_resume_title(self, client, auth_headers, test_user, db_session):
        """Test updating resume title."""
        from app.models.resume import Resume

        resume = Resume(
            user_id=test_user.id,
            title="Original Title",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern"
        )
        db_session.add(resume)
        db_session.commit()
        db_session.refresh(resume)

        update_data = {"title": "Updated Title"}
        response = client.put(
            f"/api/resume/{resume.id}",
            headers=auth_headers,
            json=update_data
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Updated Title"

    def test_update_resume_content(self, client, auth_headers, test_user, db_session):
        """Test updating resume content."""
        from app.models.resume import Resume

        resume = Resume(
            user_id=test_user.id,
            title="Test Resume",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern",
            ats_score=75,
            optimized_content={"test": "data"}
        )
        db_session.add(resume)
        db_session.commit()
        db_session.refresh(resume)

        new_content = SAMPLE_RESUME_CONTENT.copy()
        new_content["skills"] = ["Python", "Django", "PostgreSQL"]

        update_data = {"content": new_content}
        response = client.put(
            f"/api/resume/{resume.id}",
            headers=auth_headers,
            json=update_data
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Content update should reset optimization
        assert data["optimized_content"] is None
        assert data["ats_score"] is None

    def test_update_resume_partial(self, client, auth_headers, test_user, db_session):
        """Test partial resume update."""
        from app.models.resume import Resume

        resume = Resume(
            user_id=test_user.id,
            title="Original",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern",
            job_description="Original job description"
        )
        db_session.add(resume)
        db_session.commit()
        db_session.refresh(resume)

        # Update only job description
        update_data = {"job_description": "New job description"}
        response = client.put(
            f"/api/resume/{resume.id}",
            headers=auth_headers,
            json=update_data
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Original"  # Unchanged
        assert data["job_description"] == "New job description"

    def test_update_resume_not_found(self, client, auth_headers):
        """Test updating non-existent resume."""
        update_data = {"title": "New Title"}
        response = client.put(
            "/api/resume/99999",
            headers=auth_headers,
            json=update_data
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_resume_unauthorized(self, client, auth_headers, db_session, starter_user):
        """Test updating another user's resume."""
        from app.models.resume import Resume

        resume = Resume(
            user_id=starter_user.id,
            title="Other User's Resume",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern"
        )
        db_session.add(resume)
        db_session.commit()
        db_session.refresh(resume)

        update_data = {"title": "Hacked Title"}
        response = client.put(
            f"/api/resume/{resume.id}",
            headers=auth_headers,
            json=update_data
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestDeleteResume:
    """Test cases for DELETE /api/resume/{id} endpoint."""

    def test_delete_resume_success(self, client, auth_headers, test_user, db_session):
        """Test successfully deleting a resume."""
        from app.models.resume import Resume

        resume = Resume(
            user_id=test_user.id,
            title="To Delete",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern"
        )
        db_session.add(resume)

        # Set resume count
        test_user.resume_count = 1
        db_session.commit()
        db_session.refresh(resume)
        resume_id = resume.id

        response = client.delete(f"/api/resume/{resume_id}", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        assert "success" in response.json()["message"].lower()

        # Verify resume is deleted
        deleted_resume = db_session.query(Resume).filter(Resume.id == resume_id).first()
        assert deleted_resume is None

        # Verify resume count decremented
        db_session.refresh(test_user)
        assert test_user.resume_count == 0

    def test_delete_resume_not_found(self, client, auth_headers):
        """Test deleting non-existent resume."""
        response = client.delete("/api/resume/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_resume_unauthorized(self, client, auth_headers, db_session, starter_user):
        """Test deleting another user's resume."""
        from app.models.resume import Resume

        resume = Resume(
            user_id=starter_user.id,
            title="Protected Resume",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern"
        )
        db_session.add(resume)
        db_session.commit()
        db_session.refresh(resume)

        response = client.delete(f"/api/resume/{resume.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestResumeStats:
    """Test cases for GET /api/resume/stats/summary endpoint."""

    def test_get_stats_empty(self, client, auth_headers):
        """Test getting stats with no resumes."""
        response = client.get("/api/resume/stats/summary", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_resumes"] == 0
        assert data["optimized_count"] == 0
        assert data["average_ats_score"] is None
        assert data["templates_used"] == {}

    def test_get_stats_with_resumes(self, client, auth_headers, test_user, db_session):
        """Test getting stats with multiple resumes."""
        from app.models.resume import Resume

        # Create resumes with different attributes
        resume1 = Resume(
            user_id=test_user.id,
            title="Resume 1",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern",
            ats_score=80,
            optimized_content={"test": "data"}
        )
        resume2 = Resume(
            user_id=test_user.id,
            title="Resume 2",
            content=SAMPLE_RESUME_CONTENT,
            template_name="classic",
            ats_score=70
        )
        resume3 = Resume(
            user_id=test_user.id,
            title="Resume 3",
            content=SAMPLE_RESUME_CONTENT,
            template_name="modern"
        )

        db_session.add_all([resume1, resume2, resume3])
        db_session.commit()

        response = client.get("/api/resume/stats/summary", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_resumes"] == 3
        assert data["optimized_count"] == 1
        assert data["average_ats_score"] == 75.0  # (80 + 70) / 2
        assert data["templates_used"]["modern"] == 2
        assert data["templates_used"]["classic"] == 1

    def test_get_stats_unauthenticated(self, client):
        """Test getting stats without authentication."""
        response = client.get("/api/resume/stats/summary")
        assert response.status_code == status.HTTP_403_FORBIDDEN
