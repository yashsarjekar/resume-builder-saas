"""
PDF Generation Service for Resume Builder.

This module handles PDF generation for resumes using ReportLab.
Supports multiple templates: modern, classic, minimal, and professional.
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
)
from reportlab.pdfgen import canvas
from io import BytesIO
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


class PDFTemplate:
    """Base class for PDF templates."""

    def __init__(self, page_size=letter):
        """
        Initialize PDF template.

        Args:
            page_size: Page size (letter or A4)
        """
        self.page_size = page_size
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles."""
        # Helper to add style only if it doesn't exist
        def add_style(style):
            if style.name not in self.styles:
                self.styles.add(style)

        # Name style
        add_style(ParagraphStyle(
            name='Name',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

        # Contact style
        add_style(ParagraphStyle(
            name='Contact',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#7F8C8D'),
            alignment=TA_CENTER,
            spaceAfter=12
        ))

        # Section heading
        add_style(ParagraphStyle(
            name='SectionHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=6,
            spaceBefore=12,
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor=colors.HexColor('#3498DB'),
            borderPadding=6,
            leftIndent=0
        ))

        # Job title style
        add_style(ParagraphStyle(
            name='JobTitle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#2C3E50'),
            fontName='Helvetica-Bold',
            spaceAfter=3
        ))

        # Company style
        add_style(ParagraphStyle(
            name='Company',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#34495E'),
            fontName='Helvetica-Bold',
            spaceAfter=3
        ))

        # Duration style
        add_style(ParagraphStyle(
            name='Duration',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#7F8C8D'),
            fontName='Helvetica-Oblique',
            spaceAfter=6
        ))

        # Body text - use ResumeBody to avoid conflict with existing BodyText
        add_style(ParagraphStyle(
            name='ResumeBody',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=6,
            alignment=TA_JUSTIFY
        ))

    def generate(self, resume_content: Dict[str, Any]) -> BytesIO:
        """
        Generate PDF from resume content.

        Args:
            resume_content: Resume data dictionary

        Returns:
            BytesIO: PDF file in memory
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.page_size,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch
        )

        story = []

        # Add content sections
        story.extend(self._build_header(resume_content.get('personalInfo', {})))
        story.append(Spacer(1, 0.2 * inch))

        if resume_content.get('summary'):
            story.extend(self._build_summary(resume_content['summary']))

        if resume_content.get('experience'):
            story.extend(self._build_experience(resume_content['experience']))

        if resume_content.get('education'):
            story.extend(self._build_education(resume_content['education']))

        if resume_content.get('skills'):
            story.extend(self._build_skills(resume_content['skills']))

        if resume_content.get('certifications'):
            story.extend(self._build_certifications(resume_content['certifications']))

        if resume_content.get('projects'):
            story.extend(self._build_projects(resume_content['projects']))

        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer

    def _build_header(self, personal_info: Dict[str, Any]) -> List:
        """Build header with personal information."""
        elements = []

        # Name
        name = personal_info.get('name', 'No Name')
        elements.append(Paragraph(name, self.styles['Name']))

        # Contact info
        contact_parts = []
        if personal_info.get('email'):
            contact_parts.append(personal_info['email'])
        if personal_info.get('phone'):
            contact_parts.append(personal_info['phone'])
        if personal_info.get('location'):
            contact_parts.append(personal_info['location'])
        if personal_info.get('linkedin'):
            contact_parts.append(f"LinkedIn: {personal_info['linkedin']}")
        if personal_info.get('github'):
            contact_parts.append(f"GitHub: {personal_info['github']}")

        contact_text = ' | '.join(contact_parts)
        elements.append(Paragraph(contact_text, self.styles['Contact']))

        return elements

    def _build_summary(self, summary: str) -> List:
        """Build professional summary section."""
        elements = []
        elements.append(Paragraph('PROFESSIONAL SUMMARY', self.styles['SectionHeading']))
        elements.append(Paragraph(summary, self.styles['ResumeBody']))
        elements.append(Spacer(1, 0.1 * inch))
        return elements

    def _build_experience(self, experience: List[Dict[str, Any]]) -> List:
        """Build work experience section."""
        elements = []
        elements.append(Paragraph('WORK EXPERIENCE', self.styles['SectionHeading']))

        for exp in experience:
            job_group = []

            # Title and company (updated field names to match frontend)
            title = exp.get('title') or exp.get('position', 'Position')
            company = exp.get('company', 'Company')

            job_group.append(Paragraph(title, self.styles['JobTitle']))
            job_group.append(Paragraph(company, self.styles['Company']))

            # Duration and location
            duration_parts = []
            if exp.get('duration'):
                duration_parts.append(exp['duration'])
            if exp.get('location'):
                duration_parts.append(exp['location'])

            if duration_parts:
                duration_text = ' | '.join(duration_parts)
                job_group.append(Paragraph(duration_text, self.styles['Duration']))

            # Bullets (updated to use 'bullets' field instead of 'description')
            bullets = exp.get('bullets') or exp.get('description', [])

            if bullets:
                # Handle bullet points
                if isinstance(bullets, list):
                    for item in bullets:
                        if item and item.strip():  # Skip empty bullets
                            job_group.append(Paragraph(f'• {item}', self.styles['ResumeBody']))
                else:
                    # If it's a string, split by newlines and add bullets
                    lines = str(bullets).split('\n')
                    for line in lines:
                        if line.strip():
                            if not line.strip().startswith('•'):
                                line = f'• {line.strip()}'
                            job_group.append(Paragraph(line, self.styles['ResumeBody']))

            elements.append(KeepTogether(job_group))
            elements.append(Spacer(1, 0.08 * inch))  # Reduced from 0.15 to minimize spacing

        return elements

    def _build_education(self, education: List[Dict[str, Any]]) -> List:
        """Build education section."""
        elements = []
        elements.append(Paragraph('EDUCATION', self.styles['SectionHeading']))

        for edu in education:
            edu_group = []

            degree = edu.get('degree', 'Degree')
            institution = edu.get('institution', 'Institution')

            edu_group.append(Paragraph(degree, self.styles['JobTitle']))
            edu_group.append(Paragraph(institution, self.styles['Company']))

            details = []
            if edu.get('year'):
                details.append(str(edu['year']))
            if edu.get('gpa'):
                details.append(f"GPA: {edu['gpa']}")
            if edu.get('location'):
                details.append(edu['location'])

            if details:
                edu_group.append(Paragraph(' | '.join(details), self.styles['Duration']))

            if edu.get('achievements'):
                if isinstance(edu['achievements'], list):
                    for achievement in edu['achievements']:
                        edu_group.append(Paragraph(f'• {achievement}', self.styles['ResumeBody']))
                else:
                    edu_group.append(Paragraph(f'• {edu["achievements"]}', self.styles['ResumeBody']))

            elements.append(KeepTogether(edu_group))
            elements.append(Spacer(1, 0.1 * inch))

        return elements

    def _build_skills(self, skills: Any) -> List:
        """Build skills section."""
        elements = []
        elements.append(Paragraph('SKILLS', self.styles['SectionHeading']))

        if isinstance(skills, dict):
            # Skills categorized by type
            for category, skill_list in skills.items():
                if isinstance(skill_list, list):
                    skills_text = ', '.join(skill_list)
                    elements.append(Paragraph(
                        f'<b>{category.title()}:</b> {skills_text}',
                        self.styles['ResumeBody']
                    ))
        elif isinstance(skills, list):
            # Simple list of skills
            skills_text = ', '.join(skills)
            elements.append(Paragraph(skills_text, self.styles['ResumeBody']))
        else:
            # String of skills
            elements.append(Paragraph(str(skills), self.styles['ResumeBody']))

        elements.append(Spacer(1, 0.1 * inch))
        return elements

    def _build_certifications(self, certifications: List) -> List:
        """Build certifications section."""
        elements = []
        elements.append(Paragraph('CERTIFICATIONS', self.styles['SectionHeading']))

        for cert in certifications:
            cert_group = []

            # Handle both string and dict formats
            if isinstance(cert, str):
                cert_group.append(Paragraph(f'• {cert}', self.styles['ResumeBody']))
            elif isinstance(cert, dict):
                name = cert.get('name', 'Certification')
                cert_group.append(Paragraph(name, self.styles['JobTitle']))

                details = []
                if cert.get('issuer'):
                    details.append(cert['issuer'])
                if cert.get('date'):
                    details.append(cert['date'])
                if cert.get('credential_id'):
                    details.append(f"ID: {cert['credential_id']}")

                if details:
                    cert_group.append(Paragraph(' | '.join(details), self.styles['Duration']))

            elements.append(KeepTogether(cert_group))
            elements.append(Spacer(1, 0.1 * inch))

        return elements

    def _build_projects(self, projects: List[Dict[str, Any]]) -> List:
        """Build projects section."""
        elements = []
        elements.append(Paragraph('PROJECTS', self.styles['SectionHeading']))

        for project in projects:
            project_group = []

            name = project.get('name', 'Project')
            project_group.append(Paragraph(name, self.styles['JobTitle']))

            if project.get('technologies'):
                tech = project['technologies']
                if isinstance(tech, list):
                    tech = ', '.join(tech)
                project_group.append(Paragraph(
                    f'<i>Technologies: {tech}</i>',
                    self.styles['Duration']
                ))

            if project.get('description'):
                project_group.append(Paragraph(
                    project['description'],
                    self.styles['ResumeBody']
                ))

            if project.get('link'):
                project_group.append(Paragraph(
                    f'Link: {project["link"]}',
                    self.styles['Duration']
                ))

            elements.append(KeepTogether(project_group))
            elements.append(Spacer(1, 0.1 * inch))

        return elements


class ModernTemplate(PDFTemplate):
    """Modern, clean template with color accents."""

    def _setup_custom_styles(self):
        """Setup modern template styles."""
        super()._setup_custom_styles()

        # Update with modern colors
        self.styles['SectionHeading'].textColor = colors.HexColor('#3498DB')
        self.styles['SectionHeading'].borderColor = colors.HexColor('#3498DB')


class ClassicTemplate(PDFTemplate):
    """Classic, traditional template."""

    def _setup_custom_styles(self):
        """Setup classic template styles."""
        super()._setup_custom_styles()

        # Classic colors - more conservative
        self.styles['Name'].textColor = colors.HexColor('#000000')
        self.styles['SectionHeading'].textColor = colors.HexColor('#000000')
        self.styles['SectionHeading'].borderColor = colors.HexColor('#000000')
        self.styles['SectionHeading'].fontName = 'Times-Bold'
        self.styles['JobTitle'].fontName = 'Times-Bold'
        self.styles['Company'].fontName = 'Times-Roman'
        self.styles['ResumeBody'].fontName = 'Times-Roman'


class MinimalTemplate(PDFTemplate):
    """Minimal, simple template without colors."""

    def _setup_custom_styles(self):
        """Setup minimal template styles."""
        super()._setup_custom_styles()

        # Minimal - black and white
        self.styles['Name'].textColor = colors.black
        self.styles['Name'].fontSize = 20
        self.styles['Contact'].textColor = colors.black
        self.styles['SectionHeading'].textColor = colors.black
        self.styles['SectionHeading'].borderWidth = 0
        self.styles['SectionHeading'].borderPadding = 0
        self.styles['SectionHeading'].fontSize = 12
        self.styles['JobTitle'].textColor = colors.black
        self.styles['Company'].textColor = colors.black
        self.styles['Duration'].textColor = colors.black
        self.styles['ResumeBody'].textColor = colors.black


class ProfessionalTemplate(PDFTemplate):
    """Professional template with subtle styling."""

    def _setup_custom_styles(self):
        """Setup professional template styles."""
        super()._setup_custom_styles()

        # Professional colors - navy blue
        navy = colors.HexColor('#1A237E')
        self.styles['Name'].textColor = navy
        self.styles['SectionHeading'].textColor = navy
        self.styles['SectionHeading'].borderColor = navy
        self.styles['JobTitle'].textColor = colors.HexColor('#283593')


class ClassicProfessionalTemplate(PDFTemplate):
    """
    Classic Professional template - ATS-optimized design.

    Based on successful resume patterns with clean single-column layout,
    clear hierarchy, and professional styling. Ideal for technical roles
    and corporate positions.
    """

    def _setup_custom_styles(self):
        """Setup classic professional template styles."""
        super()._setup_custom_styles()

        # Professional charcoal and subtle blue accent
        charcoal = colors.HexColor('#2C3E50')
        dark_gray = colors.HexColor('#34495E')
        medium_gray = colors.HexColor('#7F8C8D')
        accent_blue = colors.HexColor('#2E86C1')

        # Name - prominent but professional
        self.styles['Name'].textColor = charcoal
        self.styles['Name'].fontSize = 22
        self.styles['Name'].fontName = 'Helvetica-Bold'
        self.styles['Name'].spaceAfter = 4

        # Contact info - clean and readable
        self.styles['Contact'].textColor = dark_gray
        self.styles['Contact'].fontSize = 9
        self.styles['Contact'].spaceAfter = 16

        # Section headings - clear with subtle accent
        self.styles['SectionHeading'].textColor = charcoal
        self.styles['SectionHeading'].fontSize = 13
        self.styles['SectionHeading'].fontName = 'Helvetica-Bold'
        self.styles['SectionHeading'].spaceAfter = 8
        self.styles['SectionHeading'].spaceBefore = 14
        self.styles['SectionHeading'].borderWidth = 0
        self.styles['SectionHeading'].borderPadding = 0
        self.styles['SectionHeading'].leftIndent = 0
        # Add subtle underline
        self.styles['SectionHeading'].borderWidth = 0
        self.styles['SectionHeading'].borderPadding = (0, 0, 4, 0)
        self.styles['SectionHeading'].borderColor = accent_blue

        # Job titles - clear hierarchy
        self.styles['JobTitle'].textColor = dark_gray
        self.styles['JobTitle'].fontSize = 11
        self.styles['JobTitle'].fontName = 'Helvetica-Bold'
        self.styles['JobTitle'].spaceAfter = 2

        # Company names - professional
        self.styles['Company'].textColor = dark_gray
        self.styles['Company'].fontSize = 10
        self.styles['Company'].fontName = 'Helvetica'
        self.styles['Company'].spaceAfter = 2

        # Duration - subtle but readable
        self.styles['Duration'].textColor = medium_gray
        self.styles['Duration'].fontSize = 9
        self.styles['Duration'].fontName = 'Helvetica'
        self.styles['Duration'].spaceAfter = 6

        # Body text - optimized for readability
        self.styles['ResumeBody'].textColor = charcoal
        self.styles['ResumeBody'].fontSize = 10
        self.styles['ResumeBody'].fontName = 'Helvetica'
        self.styles['ResumeBody'].spaceAfter = 4
        self.styles['ResumeBody'].alignment = TA_LEFT
        self.styles['ResumeBody'].leading = 13

    def _build_header(self, personal_info: Dict[str, Any]) -> List:
        """Build header with clean, professional styling."""
        elements = []

        # Name - centered and prominent
        name = personal_info.get('name', 'No Name')
        elements.append(Paragraph(name, self.styles['Name']))

        # Contact info - single line, centered
        contact_parts = []
        if personal_info.get('email'):
            contact_parts.append(personal_info['email'])
        if personal_info.get('phone'):
            contact_parts.append(personal_info['phone'])
        if personal_info.get('location'):
            contact_parts.append(personal_info['location'])

        # Links on separate line if present
        link_parts = []
        if personal_info.get('linkedin'):
            link_parts.append(f"LinkedIn: {personal_info['linkedin']}")
        if personal_info.get('github'):
            link_parts.append(f"GitHub: {personal_info['github']}")

        contact_text = ' | '.join(contact_parts)
        elements.append(Paragraph(contact_text, self.styles['Contact']))

        if link_parts:
            links_text = ' | '.join(link_parts)
            elements.append(Paragraph(links_text, self.styles['Contact']))

        return elements


class PDFService:
    """Main PDF generation service."""

    TEMPLATES = {
        'modern': ModernTemplate,
        'classic': ClassicTemplate,
        'minimal': MinimalTemplate,
        'professional': ProfessionalTemplate,
        'classic-professional': ClassicProfessionalTemplate,
    }

    @staticmethod
    def generate_resume_pdf(
        resume_content: Dict[str, Any],
        template_name: str = 'modern'
    ) -> BytesIO:
        """
        Generate a resume PDF.

        Args:
            resume_content: Resume data dictionary
            template_name: Template to use (modern/classic/minimal/professional)

        Returns:
            BytesIO: PDF file in memory

        Raises:
            ValueError: If template name is invalid
        """
        if template_name not in PDFService.TEMPLATES:
            raise ValueError(
                f"Invalid template: {template_name}. "
                f"Available templates: {', '.join(PDFService.TEMPLATES.keys())}"
            )

        logger.info(f"Generating PDF with template: {template_name}")

        template_class = PDFService.TEMPLATES[template_name]
        template = template_class()

        try:
            pdf_buffer = template.generate(resume_content)
            logger.info("PDF generated successfully")
            return pdf_buffer
        except Exception as e:
            logger.error(f"Failed to generate PDF: {str(e)}")
            raise


# Service instance
pdf_service = PDFService()
