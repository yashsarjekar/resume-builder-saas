"""
Resume CRUD routes.

This module handles all resume-related API endpoints including
creation, reading, updating, deleting, and downloading resumes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import logging
import math

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import (
    ResumeCreate,
    ResumeUpdate,
    ResumeResponse,
    ResumeListItem,
    ResumeListResponse,
    ResumeStats,
    PDFDownloadRequest,
)
from app.schemas.ai import ATSAnalysisResponse
from app.dependencies import get_current_user
from app.config import get_settings
from app.services.pdf_service import pdf_service
from app.services.resume_parser_service import resume_parser_service
from app.services.claude_service import claude_service

# Initialize router and logger
router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()


def normalize_resume_content(content: dict) -> dict:
    """
    Normalize resume content structure for PDF generation.
    Converts snake_case keys to camelCase if needed.
    """
    import json

    # If already in camelCase format, return as is
    if "personalInfo" in content:
        return content

    # Convert from snake_case to camelCase
    normalized = {}

    # Handle personal_info -> personalInfo
    if "personal_info" in content:
        personal = content["personal_info"]

        # Parse if it's a JSON string
        if isinstance(personal, str):
            try:
                personal = json.loads(personal)
            except:
                personal = {}

        if isinstance(personal, dict):
            normalized["personalInfo"] = {
                "name": personal.get("full_name") or personal.get("name", ""),
                "email": personal.get("email", ""),
                "phone": personal.get("phone", ""),
                "location": personal.get("location", ""),
                "linkedin": personal.get("linkedin", ""),
                "github": personal.get("github") or personal.get("website", "")
            }
        else:
            normalized["personalInfo"] = {
                "name": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "github": ""
            }
    elif "personalInfo" in content:
        normalized["personalInfo"] = content["personalInfo"]
    else:
        # Default empty personal info
        normalized["personalInfo"] = {
            "name": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": ""
        }

    # Copy other fields with defaults
    normalized["summary"] = content.get("summary", "")

    # Normalize experience - convert start_date/end_date to duration
    experience = content.get("experience", [])
    normalized_experience = []
    for exp in experience:
        if isinstance(exp, dict):
            normalized_exp = {
                "company": exp.get("company", ""),
                "position": exp.get("position", ""),
                "location": exp.get("location", ""),
                "description": exp.get("description", "")
            }
            # Convert dates to duration string
            if "start_date" in exp or "end_date" in exp:
                start = exp.get("start_date", "")
                end = exp.get("end_date", "")
                normalized_exp["duration"] = f"{start} - {end}" if start and end else exp.get("duration", "")
            else:
                normalized_exp["duration"] = exp.get("duration", "")
            normalized_experience.append(normalized_exp)
    normalized["experience"] = normalized_experience

    # Normalize education - convert start_date/end_date to duration
    education = content.get("education", [])
    normalized_education = []
    for edu in education:
        if isinstance(edu, dict):
            normalized_edu = {
                "institution": edu.get("institution", ""),
                "degree": edu.get("degree", ""),
                "gpa": edu.get("gpa", "")
            }
            # Convert dates to duration string
            if "start_date" in edu or "end_date" in edu:
                start = edu.get("start_date", "")
                end = edu.get("end_date", "")
                normalized_edu["duration"] = f"{start} - {end}" if start and end else edu.get("duration", "")
            else:
                normalized_edu["duration"] = edu.get("duration", "")
            normalized_education.append(normalized_edu)
    normalized["education"] = normalized_education

    normalized["skills"] = content.get("skills", [])
    normalized["projects"] = content.get("projects", [])
    normalized["certifications"] = content.get("certifications", [])
    normalized["languages"] = content.get("languages", [])

    return normalized


@router.get("", response_model=ResumeListResponse)
async def list_resumes(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of user's resumes.

    Returns resume summaries without full content for better performance.

    Args:
        page: Page number (starts at 1)
        page_size: Number of items per page (max 50)
        current_user: Authenticated user
        db: Database session

    Returns:
        ResumeListResponse: Paginated list of resumes

    Example:
        GET /api/resume?page=1&page_size=10
    """
    # Calculate offset
    offset = (page - 1) * page_size

    # Get total count
    total = db.query(Resume).filter(Resume.user_id == current_user.id).count()

    # Get resumes for current page
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.updated_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    # Calculate total pages
    total_pages = math.ceil(total / page_size) if total > 0 else 0

    # Convert to list items using Pydantic
    resume_items = [ResumeListItem.model_validate(resume) for resume in resumes]

    logger.info(
        f"User {current_user.id} listed resumes: "
        f"page={page}, total={total}"
    )

    return ResumeListResponse(
        resumes=resume_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    resume_data: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new resume.

    Checks subscription limits before creating.

    Args:
        resume_data: Resume creation data
        current_user: Authenticated user
        db: Database session

    Returns:
        ResumeResponse: Created resume

    Raises:
        HTTPException 403: If resume limit exceeded
        HTTPException 500: If creation fails

    Example:
        POST /api/resume
        {
            "title": "Software Engineer Resume",
            "content": {...},
            "template_name": "modern"
        }
    """
    # Check subscription limits (region-specific)
    user_region = current_user.get_region() if hasattr(current_user, 'get_region') else "IN"
    limit_config = settings.get_limit_config(user_region)
    if not current_user.can_create_resume(limit_config):
        resume_limit = settings.get_resume_limit(current_user.subscription_type.value, user_region)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Resume limit ({resume_limit}) reached. Upgrade your subscription."
        )

    # Create new resume
    new_resume = Resume(
        user_id=current_user.id,
        title=resume_data.title,
        job_description=resume_data.job_description,
        content=resume_data.content,
        template_name=resume_data.template_name
    )

    try:
        db.add(new_resume)

        # Increment user's resume count
        current_user.resume_count += 1

        db.commit()
        db.refresh(new_resume)

        logger.info(f"Resume created: ID={new_resume.id}, User={current_user.id}")

        return new_resume

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create resume"
        )


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific resume by ID.

    Args:
        resume_id: Resume ID
        current_user: Authenticated user
        db: Database session

    Returns:
        ResumeResponse: Resume data

    Raises:
        HTTPException 404: If resume not found
        HTTPException 403: If user doesn't own the resume

    Example:
        GET /api/resume/123
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    # Check ownership
    if resume.user_id != current_user.id:
        logger.warning(
            f"Unauthorized access attempt: User {current_user.id} "
            f"tried to access resume {resume_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resume"
        )

    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: int,
    resume_data: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing resume.

    Args:
        resume_id: Resume ID
        resume_data: Updated resume data
        current_user: Authenticated user
        db: Database session

    Returns:
        ResumeResponse: Updated resume

    Raises:
        HTTPException 404: If resume not found
        HTTPException 403: If user doesn't own the resume

    Example:
        PUT /api/resume/123
        {
            "title": "Updated Title",
            "content": {...}
        }
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    # Check ownership
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this resume"
        )

    # Update fields if provided
    if resume_data.title is not None:
        resume.title = resume_data.title

    if resume_data.job_description is not None:
        resume.job_description = resume_data.job_description

    if resume_data.content is not None:
        # When content changes, reset optimization
        resume.update_content(resume_data.content)

    if resume_data.template_name is not None:
        resume.template_name = resume_data.template_name

    try:
        db.commit()
        db.refresh(resume)

        logger.info(f"Resume updated: ID={resume_id}, User={current_user.id}")

        return resume

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update resume"
        )


@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a resume.

    Args:
        resume_id: Resume ID
        current_user: Authenticated user
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException 404: If resume not found
        HTTPException 403: If user doesn't own the resume

    Example:
        DELETE /api/resume/123
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    # Check ownership
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this resume"
        )

    try:
        db.delete(resume)

        # Decrement user's resume count
        if current_user.resume_count > 0:
            current_user.resume_count -= 1

        db.commit()

        logger.info(f"Resume deleted: ID={resume_id}, User={current_user.id}")

        return {"message": "Resume deleted successfully"}

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete resume"
        )


@router.get("/stats/summary", response_model=ResumeStats)
async def get_resume_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get statistics about user's resumes.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        ResumeStats: Resume statistics

    Example:
        GET /api/resume/stats/summary
    """
    # Get all user's resumes
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()

    total_resumes = len(resumes)
    optimized_count = sum(1 for r in resumes if r.has_optimization())

    # Calculate average ATS score (only for resumes with scores)
    scores = [r.ats_score for r in resumes if r.ats_score is not None]
    average_ats_score = sum(scores) / len(scores) if scores else None

    # Count templates used
    templates_used = {}
    for resume in resumes:
        template = resume.template_name
        templates_used[template] = templates_used.get(template, 0) + 1

    # Find most used template
    most_used_template = None
    if templates_used:
        most_used_template = max(templates_used, key=templates_used.get)

    return ResumeStats(
        total_resumes=total_resumes,
        optimized_count=optimized_count,
        average_ats_score=average_ats_score,
        templates_used=templates_used,
        most_used_template=most_used_template
    )


@router.get("/{resume_id}/download")
async def download_resume_pdf(
    resume_id: int,
    use_optimized: bool = Query(False, description="Use optimized content"),
    template_override: str = Query(None, description="Override template (modern/classic/minimal/professional)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download resume as PDF.

    Args:
        resume_id: Resume ID to download
        use_optimized: Whether to use optimized content (default: False)
        template_override: Optional template override
        current_user: Authenticated user
        db: Database session

    Returns:
        StreamingResponse: PDF file

    Raises:
        HTTPException 404: If resume not found
        HTTPException 403: If user doesn't own the resume
        HTTPException 400: If optimized content requested but not available
        HTTPException 500: If PDF generation fails

    Example:
        GET /api/resume/123/download?use_optimized=true&template_override=modern
    """
    # Get resume and check ownership
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    # Check ownership
    if resume.user_id != current_user.id:
        logger.warning(
            f"Unauthorized PDF download attempt: User {current_user.id} "
            f"tried to download resume {resume_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to download this resume"
        )

    # Determine which content to use
    # If optimized content requested and available, use it; otherwise use original
    if use_optimized and resume.has_optimization():
        content = resume.optimized_content
        logger.info(f"Using optimized content for resume {resume_id}")
    else:
        content = resume.content
        if use_optimized and not resume.has_optimization():
            logger.info(f"Optimized content requested but not available for resume {resume_id}, using original")

    # Ensure content is a dictionary (parse if it's a JSON string)
    import json
    if isinstance(content, str):
        try:
            content = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse content as JSON: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid resume content format"
            )

    # Debug logging
    logger.info(f"Content type: {type(content)}")
    if isinstance(content, dict):
        logger.info(f"Content has {len(content)} top-level keys")
        logger.info(f"personalInfo present: {'personalInfo' in content}")
        logger.info(f"personal_info present: {'personal_info' in content}")

    # Normalize content structure for PDF generation
    try:
        content = normalize_resume_content(content)
        logger.info("Content normalized for PDF generation")
    except Exception as e:
        logger.error(f"Normalization failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to prepare content: {str(e)}"
        )

    # Determine template to use
    template_name = template_override if template_override else resume.template_name

    # Validate template using PDFService templates
    from app.services.pdf_service import PDFService
    if template_name not in PDFService.TEMPLATES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid template: {template_name}. Available: {', '.join(PDFService.TEMPLATES.keys())}"
        )

    try:
        # Generate PDF
        pdf_buffer = pdf_service.generate_resume_pdf(
            resume_content=content,
            template_name=template_name
        )

        # Create filename
        safe_title = resume.title.replace(' ', '_').replace('/', '_')
        filename = f"{safe_title}_{template_name}.pdf"

        logger.info(
            f"PDF generated for resume {resume_id} by user {current_user.id}: "
            f"template={template_name}, optimized={use_optimized}"
        )

        # Return PDF as streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except ValueError as e:
        logger.error(f"PDF generation validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"PDF generation failed for resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF. Please try again."
        )


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and parse an existing resume (PDF or DOCX).

    This endpoint allows users to upload their existing resume and automatically
    extract structured information using AI. The parsed data is used to create
    a new resume in the system.

    Supported formats:
    - PDF (.pdf)
    - Microsoft Word (.docx, .doc)

    Args:
        file: Uploaded resume file
        current_user: Authenticated user
        db: Database session

    Returns:
        ResumeResponse: Created resume with parsed data

    Raises:
        HTTPException 400: If file format is invalid or parsing fails
        HTTPException 429: If user exceeds resume creation limit
        HTTPException 500: If server error occurs

    Example:
        POST /api/resumes/upload
        Content-Type: multipart/form-data
        File: resume.pdf
    """
    try:
        # Check user's resume limit (region-specific)
        user_region = current_user.get_region() if hasattr(current_user, 'get_region') else "IN"
        resume_limit = settings.get_resume_limit(current_user.subscription_type, user_region)

        if current_user.resume_count >= resume_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Resume limit reached. Your {current_user.subscription_type} plan allows {resume_limit} resume(s) per month."
            )

        # Validate file size (max 10MB)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        file_content = await file.read()

        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit"
            )

        # Validate file type
        allowed_extensions = ["pdf", "docx", "doc"]
        file_extension = file.filename.lower().split(".")[-1]

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file format. Supported formats: {', '.join(allowed_extensions)}"
            )

        logger.info(f"Parsing uploaded resume: {file.filename} for user {current_user.id}")

        # Parse the resume file
        parsed_data = resume_parser_service.parse_resume_file(
            file_content=file_content,
            filename=file.filename
        )

        # Convert to our resume format
        resume_content = resume_parser_service.convert_to_resume_format(parsed_data)

        # Generate title from filename (remove extension)
        resume_title = file.filename.rsplit(".", 1)[0]
        resume_title = f"Imported: {resume_title}"

        # Create resume in database
        new_resume = Resume(
            user_id=current_user.id,
            title=resume_title,
            content=resume_content,
            template_name="modern"  # Default template
        )

        db.add(new_resume)

        # Increment user's resume count
        current_user.resume_count += 1

        db.commit()
        db.refresh(new_resume)

        logger.info(f"Resume imported successfully for user {current_user.id}: {new_resume.id}")

        return new_resume

    except HTTPException:
        raise

    except ValueError as e:
        logger.error(f"Resume parsing validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except Exception as e:
        db.rollback()
        logger.error(f"Resume upload failed for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse resume. Please ensure the file is valid and try again."
        )


@router.post("/parse")
async def parse_resume_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Parse a resume file and return structured content without saving to database.

    This endpoint is useful for temporary parsing operations like LinkedIn optimization
    where we need to extract content but don't want to create a new resume.

    Supported formats:
    - PDF (.pdf)
    - Microsoft Word (.docx, .doc)

    Args:
        file: Uploaded resume/profile file
        current_user: Authenticated user

    Returns:
        dict: Parsed resume content in structured format

    Raises:
        HTTPException 400: If file format is invalid or parsing fails
        HTTPException 500: If server error occurs

    Example:
        POST /api/resume/parse
        Content-Type: multipart/form-data
        File: linkedin_profile.pdf
    """
    try:
        # Validate file size (max 10MB)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        file_content = await file.read()

        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit"
            )

        if not file_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty"
            )

        logger.info(f"Parsing file: {file.filename} for user {current_user.id}")

        # Parse the resume file
        parsed_data = resume_parser_service.parse_resume_file(
            file_content=file_content,
            filename=file.filename
        )

        # Convert to our resume format
        resume_content = resume_parser_service.convert_to_resume_format(parsed_data)

        logger.info(f"Successfully parsed {file.filename} for user {current_user.id}")

        return {
            "content": resume_content,
            "filename": file.filename,
            "message": "File parsed successfully"
        }

    except ValueError as e:
        # File format or parsing errors
        logger.error(f"File parsing validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"File parsing failed for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse file. Please ensure the file is valid and try again."
        )


@router.post("/{resume_id}/analyze-ats", response_model=ATSAnalysisResponse)
async def analyze_resume_ats(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze ATS compatibility for a specific resume.

    This endpoint loads a saved resume and analyzes its ATS compatibility
    against the job description stored with the resume.

    Args:
        resume_id: ID of the resume to analyze
        current_user: Authenticated user
        db: Database session

    Returns:
        ATSAnalysisResponse: ATS score, strengths, weaknesses, suggestions

    Raises:
        HTTPException 403: If ATS analysis limit exceeded
        HTTPException 404: If resume not found
        HTTPException 500: If analysis fails

    Example:
        POST /api/resume/123/analyze-ats
    """
    # Check subscription limits (region-specific)
    user_region = current_user.get_region() if hasattr(current_user, 'get_region') else "IN"
    ats_limit = settings.get_ats_limit(current_user.subscription_type, user_region)
    if current_user.ats_analysis_count >= ats_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"ATS analysis limit ({ats_limit}) reached. Upgrade your subscription."
        )

    try:
        # Get the resume
        resume = db.query(Resume).filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id
        ).first()

        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )

        # Perform ATS analysis
        result = await claude_service.analyze_ats_score(
            resume_content=resume.content,
            job_description=resume.job_description
        )

        # Update resume with ATS score
        resume.ats_score = result.ats_score

        # Increment usage count
        current_user.ats_analysis_count += 1
        db.commit()

        logger.info(
            f"ATS analysis completed for resume {resume_id}: "
            f"score={result.ats_score}"
        )

        return result

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"ATS analysis failed for resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume: {str(e)}"
        )
