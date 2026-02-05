"""
Tests for PDF generation functionality.

This module contains tests for PDF generation service and download endpoint.
"""

import pytest
from fastapi import status
from io import BytesIO
from pypdf import PdfReader

from app.models.resume import Resume
from app.services.pdf_service import (
    PDFService,
    ModernTemplate,
    ClassicTemplate,
    MinimalTemplate,
    ProfessionalTemplate
)


# Test Data Fixtures

@pytest.fixture
def sample_resume_data():
    """Sample resume data for PDF generation."""
    return {
        "personalInfo": {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+91-9876543210",
            "location": "Mumbai, India",
            "linkedin": "linkedin.com/in/johndoe",
            "github": "github.com/johndoe"
        },
        "summary": "Experienced Software Engineer with 5+ years of expertise in building scalable web applications using Python, Django, and React. Passionate about clean code and continuous learning.",
        "experience": [
            {
                "position": "Senior Software Engineer",
                "company": "Tech Corp India",
                "duration": "Jan 2021 - Present",
                "location": "Mumbai, India",
                "description": [
                    "Led development of microservices architecture serving 1M+ users",
                    "Implemented CI/CD pipelines reducing deployment time by 60%",
                    "Mentored team of 5 junior developers"
                ]
            },
            {
                "position": "Software Engineer",
                "company": "Startup Inc",
                "duration": "Jun 2019 - Dec 2020",
                "location": "Bangalore, India",
                "description": "Developed RESTful APIs using Django and PostgreSQL.\nImplemented real-time features using WebSockets."
            }
        ],
        "education": [
            {
                "degree": "B.Tech in Computer Science",
                "institution": "IIT Mumbai",
                "year": "2019",
                "gpa": "8.5/10",
                "location": "Mumbai, India",
                "achievements": [
                    "Dean's List all semesters",
                    "Winner of National Hackathon 2018"
                ]
            }
        ],
        "skills": {
            "programming": ["Python", "JavaScript", "TypeScript", "Go"],
            "frameworks": ["Django", "FastAPI", "React", "Node.js"],
            "databases": ["PostgreSQL", "MongoDB", "Redis"],
            "tools": ["Docker", "Kubernetes", "AWS", "Git"]
        },
        "certifications": [
            {
                "name": "AWS Certified Solutions Architect",
                "issuer": "Amazon Web Services",
                "date": "2022",
                "credential_id": "ABC123XYZ"
            }
        ],
        "projects": [
            {
                "name": "E-Commerce Platform",
                "technologies": ["Django", "React", "PostgreSQL", "Redis"],
                "description": "Built a full-stack e-commerce platform handling 10K+ daily transactions",
                "link": "github.com/johndoe/ecommerce"
            }
        ]
    }


@pytest.fixture
def test_resume_with_optimization(db_session, test_user, sample_resume_data):
    """Create a test resume with optimization."""
    resume = Resume(
        user_id=test_user.id,
        title="Full Stack Developer Resume",
        content=sample_resume_data,
        template_name="modern"
    )

    # Add optimization
    optimized_data = sample_resume_data.copy()
    optimized_data['summary'] = "OPTIMIZED: " + optimized_data['summary']

    resume.set_optimization(
        optimized_content=optimized_data,
        ats_score=85
    )

    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)
    return resume


# PDF Service Tests

class TestPDFService:
    """Tests for PDF generation service."""

    def test_generate_pdf_modern_template(self, sample_resume_data):
        """Test PDF generation with modern template."""
        pdf_buffer = PDFService.generate_resume_pdf(
            resume_content=sample_resume_data,
            template_name='modern'
        )

        assert isinstance(pdf_buffer, BytesIO)
        assert pdf_buffer.tell() == 0  # Buffer at start

        # Verify it's a valid PDF
        pdf_reader = PdfReader(pdf_buffer)
        assert len(pdf_reader.pages) >= 1

    def test_generate_pdf_classic_template(self, sample_resume_data):
        """Test PDF generation with classic template."""
        pdf_buffer = PDFService.generate_resume_pdf(
            resume_content=sample_resume_data,
            template_name='classic'
        )

        assert isinstance(pdf_buffer, BytesIO)
        pdf_reader = PdfReader(pdf_buffer)
        assert len(pdf_reader.pages) >= 1

    def test_generate_pdf_minimal_template(self, sample_resume_data):
        """Test PDF generation with minimal template."""
        pdf_buffer = PDFService.generate_resume_pdf(
            resume_content=sample_resume_data,
            template_name='minimal'
        )

        assert isinstance(pdf_buffer, BytesIO)
        pdf_reader = PdfReader(pdf_buffer)
        assert len(pdf_reader.pages) >= 1

    def test_generate_pdf_professional_template(self, sample_resume_data):
        """Test PDF generation with professional template."""
        pdf_buffer = PDFService.generate_resume_pdf(
            resume_content=sample_resume_data,
            template_name='professional'
        )

        assert isinstance(pdf_buffer, BytesIO)
        pdf_reader = PdfReader(pdf_buffer)
        assert len(pdf_reader.pages) >= 1

    def test_generate_pdf_invalid_template(self, sample_resume_data):
        """Test PDF generation with invalid template."""
        with pytest.raises(ValueError, match="Invalid template"):
            PDFService.generate_resume_pdf(
                resume_content=sample_resume_data,
                template_name='invalid_template'
            )

    def test_generate_pdf_minimal_data(self):
        """Test PDF generation with minimal resume data."""
        minimal_data = {
            "personalInfo": {
                "name": "Jane Doe",
                "email": "jane@example.com"
            },
            "experience": [{
                "position": "Developer",
                "company": "Company"
            }],
            "education": [{
                "degree": "B.Tech",
                "institution": "University"
            }]
        }

        pdf_buffer = PDFService.generate_resume_pdf(
            resume_content=minimal_data,
            template_name='modern'
        )

        assert isinstance(pdf_buffer, BytesIO)
        pdf_reader = PdfReader(pdf_buffer)
        assert len(pdf_reader.pages) >= 1

    def test_generate_pdf_with_list_skills(self):
        """Test PDF generation with skills as list."""
        data = {
            "personalInfo": {"name": "Test User"},
            "experience": [{"position": "Dev", "company": "Corp"}],
            "education": [{"degree": "BSc", "institution": "Uni"}],
            "skills": ["Python", "JavaScript", "React"]
        }

        pdf_buffer = PDFService.generate_resume_pdf(
            resume_content=data,
            template_name='modern'
        )

        assert isinstance(pdf_buffer, BytesIO)

    def test_template_classes_instantiation(self):
        """Test that all template classes can be instantiated."""
        templates = [
            ModernTemplate,
            ClassicTemplate,
            MinimalTemplate,
            ProfessionalTemplate
        ]

        for template_class in templates:
            template = template_class()
            assert template is not None
            assert hasattr(template, 'styles')
            assert hasattr(template, 'generate')


# PDF Download Endpoint Tests

class TestDownloadResumePDF:
    """Tests for /api/resume/{id}/download endpoint."""

    def test_download_resume_success(
        self,
        client,
        auth_headers,
        test_resume
    ):
        """Test successful PDF download."""
        response = client.get(
            f"/api/resume/{test_resume.id}/download",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.headers['content-type'] == 'application/pdf'
        assert 'Content-Disposition' in response.headers
        assert 'attachment' in response.headers['Content-Disposition']

        # Verify it's a valid PDF
        pdf_reader = PdfReader(BytesIO(response.content))
        assert len(pdf_reader.pages) >= 1

    def test_download_resume_with_optimized_content(
        self,
        client,
        auth_headers,
        test_resume_with_optimization
    ):
        """Test PDF download with optimized content."""
        response = client.get(
            f"/api/resume/{test_resume_with_optimization.id}/download?use_optimized=true",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.headers['content-type'] == 'application/pdf'

        # Verify it's a valid PDF
        pdf_reader = PdfReader(BytesIO(response.content))
        assert len(pdf_reader.pages) >= 1

    def test_download_resume_optimized_not_available(
        self,
        client,
        auth_headers,
        test_resume
    ):
        """Test download with optimized content when not available."""
        response = client.get(
            f"/api/resume/{test_resume.id}/download?use_optimized=true",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "not available" in response.json()["detail"].lower()

    def test_download_resume_template_override(
        self,
        client,
        auth_headers,
        test_resume
    ):
        """Test PDF download with template override."""
        for template in ['modern', 'classic', 'minimal', 'professional']:
            response = client.get(
                f"/api/resume/{test_resume.id}/download?template_override={template}",
                headers=auth_headers
            )

            assert response.status_code == status.HTTP_200_OK
            assert response.headers['content-type'] == 'application/pdf'
            assert template in response.headers['Content-Disposition']

    def test_download_resume_invalid_template(
        self,
        client,
        auth_headers,
        test_resume
    ):
        """Test PDF download with invalid template."""
        response = client.get(
            f"/api/resume/{test_resume.id}/download?template_override=invalid",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "invalid template" in response.json()["detail"].lower()

    def test_download_resume_not_found(
        self,
        client,
        auth_headers
    ):
        """Test PDF download for non-existent resume."""
        response = client.get(
            "/api/resume/99999/download",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_download_resume_unauthorized(
        self,
        client,
        auth_headers,
        db_session,
        test_user
    ):
        """Test PDF download for another user's resume."""
        from app.models.user import User

        # Create another user
        other_user = User(
            email="other@example.com",
            password_hash="$2b$12$ZSVA0TQh1qp6E0774bNqYOYYUsSEHE4ps.WoZXmt1pkWfqAH1FG1q",
            name="Other User"
        )
        db_session.add(other_user)
        db_session.commit()

        # Create resume for other user
        other_resume = Resume(
            user_id=other_user.id,
            title="Other Resume",
            content={"personalInfo": {"name": "Other"}},
            template_name="modern"
        )
        db_session.add(other_resume)
        db_session.commit()

        response = client.get(
            f"/api/resume/{other_resume.id}/download",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_download_resume_no_auth(
        self,
        client,
        test_resume
    ):
        """Test PDF download without authentication."""
        response = client.get(
            f"/api/resume/{test_resume.id}/download"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_download_resume_filename(
        self,
        client,
        auth_headers,
        test_resume
    ):
        """Test PDF download filename format."""
        response = client.get(
            f"/api/resume/{test_resume.id}/download",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK

        content_disposition = response.headers['Content-Disposition']
        assert 'filename=' in content_disposition
        assert '.pdf' in content_disposition
        # Check that title is in filename (with underscores)
        assert test_resume.title.replace(' ', '_') in content_disposition


# Integration Tests

class TestPDFIntegration:
    """Integration tests for PDF functionality."""

    def test_create_optimize_download_workflow(
        self,
        client,
        auth_headers,
        sample_resume_data,
        db_session
    ):
        """Test complete workflow: create -> optimize -> download PDF."""
        from unittest.mock import patch, MagicMock
        from app.schemas.ai import ATSAnalysisResponse, ResumeOptimizationResponse

        # Step 1: Create resume
        create_response = client.post(
            "/api/resume",
            headers=auth_headers,
            json={
                "title": "My Resume",
                "content": sample_resume_data,
                "template_name": "modern"
            }
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        resume_id = create_response.json()["id"]

        # Step 2: Optimize resume (with mocked Claude service)
        with patch('app.services.claude_service.claude_service.optimize_resume') as mock_optimize, \
             patch('app.services.claude_service.claude_service.analyze_ats_score') as mock_analyze:

            optimized_data = sample_resume_data.copy()
            optimized_data['summary'] = "OPTIMIZED: " + optimized_data['summary']

            mock_optimize.return_value = ResumeOptimizationResponse(
                optimized_content=optimized_data,
                changes_made=["Enhanced summary", "Added keywords"],
                summary="Resume optimized for ATS",
                ats_score_improvement=15
            )

            mock_analyze.return_value = ATSAnalysisResponse(
                ats_score=85,
                category="Excellent",
                strengths=["Strong keywords", "Good structure"],
                weaknesses=[],
                missing_keywords=[],
                suggestions=[]
            )

            optimize_response = client.post(
                f"/api/ai/optimize-resume/{resume_id}",
                headers=auth_headers,
                json={
                    "job_description": "Looking for Python developer with Django experience...",
                    "optimization_level": "moderate"
                }
            )
            assert optimize_response.status_code == status.HTTP_200_OK

        # Step 3: Download original PDF
        download_original = client.get(
            f"/api/resume/{resume_id}/download",
            headers=auth_headers
        )
        assert download_original.status_code == status.HTTP_200_OK
        assert download_original.headers['content-type'] == 'application/pdf'

        # Step 4: Download optimized PDF
        download_optimized = client.get(
            f"/api/resume/{resume_id}/download?use_optimized=true",
            headers=auth_headers
        )
        assert download_optimized.status_code == status.HTTP_200_OK
        assert download_optimized.headers['content-type'] == 'application/pdf'

        # Verify both PDFs are valid but different
        pdf_original = PdfReader(BytesIO(download_original.content))
        pdf_optimized = PdfReader(BytesIO(download_optimized.content))

        assert len(pdf_original.pages) >= 1
        assert len(pdf_optimized.pages) >= 1

    def test_all_templates_produce_valid_pdfs(
        self,
        client,
        auth_headers,
        test_resume
    ):
        """Test that all templates produce valid PDFs."""
        templates = ['modern', 'classic', 'minimal', 'professional']

        for template in templates:
            response = client.get(
                f"/api/resume/{test_resume.id}/download?template_override={template}",
                headers=auth_headers
            )

            assert response.status_code == status.HTTP_200_OK, f"Failed for template: {template}"
            assert response.headers['content-type'] == 'application/pdf'

            # Verify it's a valid PDF
            pdf_reader = PdfReader(BytesIO(response.content))
            assert len(pdf_reader.pages) >= 1, f"No pages in PDF for template: {template}"
