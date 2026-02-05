"""
Tests for resume upload and parsing functionality.

This module tests the resume upload endpoint and parsing service including
PDF/DOCX extraction and AI-powered data extraction.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
from io import BytesIO

from app.services.resume_parser_service import ResumeParserService


class TestResumeParserService:
    """Test suite for ResumeParserService class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.parser_service = ResumeParserService()

    def test_extract_text_from_pdf(self):
        """Test PDF text extraction."""
        # Create a simple PDF content mock
        mock_pdf_content = b"%PDF-1.4..."  # Simplified

        with patch('PyPDF2.PdfReader') as mock_reader:
            # Mock PDF page with text
            mock_page = Mock()
            mock_page.extract_text.return_value = "John Doe\nSoftware Engineer\nExperience: 5 years"

            mock_reader_instance = Mock()
            mock_reader_instance.pages = [mock_page]
            mock_reader.return_value = mock_reader_instance

            text = self.parser_service.extract_text_from_pdf(mock_pdf_content)

            assert text is not None
            assert "John Doe" in text
            assert "Software Engineer" in text

    def test_extract_text_from_pdf_error(self):
        """Test PDF extraction with invalid file."""
        with pytest.raises(Exception):
            self.parser_service.extract_text_from_pdf(b"invalid pdf content")

    def test_extract_text_from_docx(self):
        """Test DOCX text extraction."""
        with patch('docx.Document') as mock_doc:
            # Mock paragraphs
            mock_para1 = Mock()
            mock_para1.text = "John Doe"
            mock_para2 = Mock()
            mock_para2.text = "Software Engineer"

            mock_doc_instance = Mock()
            mock_doc_instance.paragraphs = [mock_para1, mock_para2]
            mock_doc_instance.tables = []
            mock_doc.return_value = mock_doc_instance

            text = self.parser_service.extract_text_from_docx(b"mock docx content")

            assert text is not None
            assert "John Doe" in text
            assert "Software Engineer" in text

    @patch.object(ResumeParserService, 'parse_resume_with_ai')
    def test_parse_resume_with_ai_success(self, mock_parse):
        """Test AI parsing of resume text."""
        mock_parse.return_value = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890",
            "location": "San Francisco, CA",
            "summary": "Experienced software engineer",
            "experience": [
                {
                    "company": "Tech Corp",
                    "position": "Senior Engineer",
                    "start_date": "Jan 2020",
                    "end_date": "Present",
                    "description": "Led development team"
                }
            ],
            "education": [
                {
                    "institution": "Stanford University",
                    "degree": "BS Computer Science",
                    "start_date": "2015",
                    "end_date": "2019",
                    "gpa": "3.8"
                }
            ],
            "skills": ["Python", "JavaScript", "React"],
            "projects": [],
            "certifications": ["AWS Certified"],
            "languages": ["English", "Spanish"]
        }

        resume_text = "Sample resume text"
        result = self.parser_service.parse_resume_with_ai(resume_text)

        assert result["full_name"] == "John Doe"
        assert result["email"] == "john@example.com"
        assert len(result["skills"]) == 3

    def test_convert_to_resume_format(self):
        """Test conversion of parsed data to resume format."""
        parsed_data = {
            "full_name": "Jane Smith",
            "email": "jane@example.com",
            "phone": "+1234567890",
            "location": "New York, NY",
            "summary": "Product manager with 3 years experience",
            "experience": [
                {
                    "company": "StartupCo",
                    "position": "Product Manager",
                    "start_date": "2021",
                    "end_date": "Present",
                    "description": "Managed product roadmap"
                }
            ],
            "education": [
                {
                    "institution": "MIT",
                    "degree": "MBA",
                    "start_date": "2019",
                    "end_date": "2021",
                    "gpa": "3.9"
                }
            ],
            "skills": ["Product Management", "Agile", "SQL"],
            "projects": [
                {
                    "name": "Mobile App",
                    "description": "Built iOS app",
                    "technologies": ["Swift", "Firebase"]
                }
            ],
            "certifications": ["PMP"],
            "languages": ["English"]
        }

        result = self.parser_service.convert_to_resume_format(parsed_data)

        # Verify structure
        assert "personal_info" in result
        assert result["personal_info"]["full_name"] == "Jane Smith"
        assert result["personal_info"]["email"] == "jane@example.com"

        assert "experience" in result
        assert len(result["experience"]) == 1
        assert result["experience"][0]["company"] == "StartupCo"

        assert "education" in result
        assert len(result["education"]) == 1
        assert result["education"][0]["institution"] == "MIT"

        assert "skills" in result
        assert "Product Management" in result["skills"]

        assert "projects" in result
        assert len(result["projects"]) == 1


class TestResumeUploadEndpoint:
    """Test suite for resume upload endpoint."""

    @pytest.fixture
    def test_client(self, client, test_user_token):
        """Get test client with authentication."""
        return client

    @pytest.fixture
    def auth_headers(self, test_user_token):
        """Get authentication headers."""
        return {"Authorization": f"Bearer {test_user_token}"}

    def test_upload_resume_pdf_success(self, test_client, auth_headers, db_session):
        """Test successful PDF resume upload."""
        # Create mock PDF file
        pdf_content = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj"
        files = {
            "file": ("resume.pdf", BytesIO(pdf_content), "application/pdf")
        }

        with patch('app.services.resume_parser_service.resume_parser_service.parse_resume_file') as mock_parse:
            mock_parse.return_value = {
                "full_name": "Test User",
                "email": "test@example.com",
                "skills": ["Python"],
                "experience": [],
                "education": []
            }

            with patch('app.services.resume_parser_service.resume_parser_service.convert_to_resume_format') as mock_convert:
                mock_convert.return_value = {
                    "personal_info": {
                        "full_name": "Test User",
                        "email": "test@example.com"
                    },
                    "skills": ["Python"],
                    "experience": [],
                    "education": []
                }

                response = test_client.post(
                    "/api/resumes/upload",
                    files=files,
                    headers=auth_headers
                )

                assert response.status_code == 201
                data = response.json()
                assert "id" in data
                assert "Imported: resume" in data["title"]

    def test_upload_resume_docx_success(self, test_client, auth_headers):
        """Test successful DOCX resume upload."""
        docx_content = b"PK\x03\x04..."  # Simplified DOCX
        files = {
            "file": ("resume.docx", BytesIO(docx_content), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        }

        with patch('app.services.resume_parser_service.resume_parser_service.parse_resume_file') as mock_parse:
            mock_parse.return_value = {
                "full_name": "Test User",
                "email": "test@example.com",
                "skills": [],
                "experience": [],
                "education": []
            }

            with patch('app.services.resume_parser_service.resume_parser_service.convert_to_resume_format') as mock_convert:
                mock_convert.return_value = {
                    "personal_info": {"full_name": "Test User"},
                    "skills": [],
                    "experience": [],
                    "education": []
                }

                response = test_client.post(
                    "/api/resumes/upload",
                    files=files,
                    headers=auth_headers
                )

                assert response.status_code == 201

    def test_upload_resume_invalid_format(self, test_client, auth_headers):
        """Test upload with invalid file format."""
        files = {
            "file": ("resume.txt", BytesIO(b"plain text"), "text/plain")
        }

        response = test_client.post(
            "/api/resumes/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 400
        assert "Invalid file format" in response.json()["detail"]

    def test_upload_resume_file_too_large(self, test_client, auth_headers):
        """Test upload with file exceeding size limit."""
        # Create file larger than 10MB
        large_content = b"x" * (11 * 1024 * 1024)
        files = {
            "file": ("large_resume.pdf", BytesIO(large_content), "application/pdf")
        }

        response = test_client.post(
            "/api/resumes/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 400
        assert "exceeds 10MB limit" in response.json()["detail"]

    def test_upload_resume_unauthorized(self, test_client):
        """Test upload without authentication."""
        files = {
            "file": ("resume.pdf", BytesIO(b"test"), "application/pdf")
        }

        response = test_client.post("/api/resumes/upload", files=files)

        assert response.status_code == 401

    def test_upload_resume_limit_exceeded(self, test_client, auth_headers, test_user, db_session):
        """Test upload when resume limit is exceeded."""
        # Set user's resume count to limit
        test_user.resume_count = 1  # FREE tier limit
        db_session.commit()

        files = {
            "file": ("resume.pdf", BytesIO(b"test"), "application/pdf")
        }

        response = test_client.post(
            "/api/resumes/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 429
        assert "Resume limit reached" in response.json()["detail"]

    def test_upload_resume_parsing_error(self, test_client, auth_headers):
        """Test upload when parsing fails."""
        files = {
            "file": ("resume.pdf", BytesIO(b"corrupted pdf"), "application/pdf")
        }

        with patch('app.services.resume_parser_service.resume_parser_service.parse_resume_file') as mock_parse:
            mock_parse.side_effect = ValueError("Could not extract text")

            response = test_client.post(
                "/api/resumes/upload",
                files=files,
                headers=auth_headers
            )

            assert response.status_code == 400


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
