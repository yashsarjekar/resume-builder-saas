"""
LaTeX-based PDF generation service for the Formal CV template.

Generates a .tex source file from resume content, compiles it with pdflatex,
and returns the resulting PDF as BytesIO. The template reproduces the structure
of the Komodo Formal CV (article class, ATS-clean, bottom-ruled section headings).

Requires pdflatex on the server PATH. On Railway (Nixpacks), add
texlive.combined.scheme-medium to nixpacks.toml.
"""

import os
import re
import subprocess
import tempfile
import logging
from io import BytesIO
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# LaTeX special-character escaping
# ---------------------------------------------------------------------------

# Order matters: backslash must be replaced first so subsequent replacements
# don't double-escape it.
_ESCAPE_MAP = [
    ('\\', r'\textbackslash{}'),
    ('&',  r'\&'),
    ('%',  r'\%'),
    ('$',  r'\$'),
    ('#',  r'\#'),
    ('_',  r'\_'),
    ('{',  r'\{'),
    ('}',  r'\}'),
    ('~',  r'\textasciitilde{}'),
    ('^',  r'\textasciicircum{}'),
    ('<',  r'\textless{}'),
    ('>',  r'\textgreater{}'),
]

# Regex to find em-dashes and en-dashes — convert to LaTeX equivalents
_DASH_RE = re.compile(r'—|–')


def _tex(text: Any) -> str:
    """Escape arbitrary user text for safe inclusion in LaTeX source."""
    if text is None:
        return ''
    s = str(text)
    # Normalise dash characters before escaping special chars
    s = _DASH_RE.sub(lambda m: '---' if m.group() == '—' else '--', s)
    for char, replacement in _ESCAPE_MAP:
        s = s.replace(char, replacement)
    return s


def _href(url: str, display: str) -> str:
    """Produce a \\href{url}{display} command — URLs are NOT escaped."""
    return r'\href{' + url + r'}{' + _tex(display) + r'}'


def _normalise_url(raw: str) -> str:
    """Strip protocol prefix and return just the display hostname+path."""
    return re.sub(r'^https?://', '', raw.strip()).rstrip('/')


# ---------------------------------------------------------------------------
# Section builders
# ---------------------------------------------------------------------------

def _header(personal_info: Dict[str, Any]) -> str:
    name     = _tex(personal_info.get('name', ''))
    location = _tex(personal_info.get('location', ''))
    email    = personal_info.get('email', '').strip()
    phone    = personal_info.get('phone', '').strip()
    linkedin = personal_info.get('linkedin', '').strip()
    github   = personal_info.get('github', '').strip()

    contact_parts: List[str] = []
    if email:
        contact_parts.append(_href(f'mailto:{email}', email))
    if phone:
        contact_parts.append(_tex(phone))
    if linkedin:
        display = _normalise_url(linkedin)
        url = linkedin if linkedin.startswith('http') else f'https://{linkedin}'
        contact_parts.append(_href(url, display))
    if github:
        display = _normalise_url(github)
        url = github if github.startswith('http') else f'https://{github}'
        contact_parts.append(_href(url, display))

    # Join with LaTeX visible pipe separator
    contact_line = r' \ | \ '.join(contact_parts)

    lines = [r'\begin{center}']
    lines.append(r'    {\LARGE \textbf{' + name + r'}} \\[0.3em]')
    if location:
        lines.append(r'    {\normalsize ' + location + r'} \\[0.3em]')
    if contact_line:
        lines.append(r'    {\small ' + contact_line + r'}')
    lines.append(r'\end{center}')
    return '\n'.join(lines) + '\n'


def _summary(summary: str) -> str:
    if not summary or not summary.strip():
        return ''
    return (
        r'\resumesec{Professional Summary}' + '\n'
        + _tex(summary) + '\n\n'
    )


def _experience(experience: List[Dict[str, Any]]) -> str:
    if not experience:
        return ''

    out = [r'\resumesec{Work Experience}', '']

    for exp in experience:
        # Support both "title" (from builder) and "position" (from parsed upload)
        title    = _tex(exp.get('title') or exp.get('position', ''))
        company  = _tex(exp.get('company', ''))
        duration = _tex(exp.get('duration', ''))
        location = _tex(exp.get('location', ''))
        bullets: Union[List[str], str] = exp.get('bullets') or exp.get('description', [])

        # "Title, Company" left  ←→  "Duration" right
        if title and company:
            left = r'\textbf{' + title + ', ' + company + r'}'
        elif title:
            left = r'\textbf{' + title + r'}'
        elif company:
            left = r'\textbf{' + company + r'}'
        else:
            left = ''

        if left:
            out.append(r'\noindent' + left + (r' \hfill \textit{' + duration + r'}' if duration else '') + r' \\')

        if location:
            out.append(r'\textit{' + location + r'} \\')

        # Bullet list
        bullet_lines: List[str] = []
        if isinstance(bullets, list):
            bullet_lines = [b.strip() for b in bullets if b and str(b).strip()]
        elif isinstance(bullets, str) and bullets.strip():
            bullet_lines = [l.strip() for l in bullets.split('\n') if l.strip()]

        if bullet_lines:
            out.append(r'\begin{cvitems}')
            for b in bullet_lines:
                out.append(r'    \item ' + _tex(b))
            out.append(r'\end{cvitems}')

        out.append('')

    return '\n'.join(out) + '\n'


def _projects(projects: List[Dict[str, Any]]) -> str:
    if not projects:
        return ''

    out = [r'\resumesec{Selected Projects}', '']

    for proj in projects:
        name        = _tex(proj.get('name', ''))
        link        = proj.get('link', '').strip()
        description = _tex(proj.get('description', ''))
        technologies = proj.get('technologies', '')

        if link:
            display = _normalise_url(link)
            url = link if link.startswith('http') else f'https://{link}'
            name_part = (r'\noindent\textbf{' + name + r'}'
                         + r' \hfill ' + _href(url, display))
        else:
            name_part = r'\noindent\textbf{' + name + r'}'

        out.append(name_part + (r' \\' if name else ''))

        items: List[str] = []
        if description:
            items.append(description)
        if technologies:
            if isinstance(technologies, list):
                tech_str = ', '.join(_tex(t) for t in technologies if t)
            else:
                tech_str = _tex(str(technologies))
            items.append(r'\textbf{Tech}: ' + tech_str)

        if items:
            out.append(r'\begin{cvitems}')
            for item in items:
                out.append(r'    \item ' + item)
            out.append(r'\end{cvitems}')

        out.append('')

    return '\n'.join(out) + '\n'


def _skills(skills: Union[List[str], Dict, str]) -> str:
    if not skills:
        return ''

    out = [r'\resumesec{Technical Skills}', r'\begin{cvitems}']

    if isinstance(skills, dict):
        for category, skill_list in skills.items():
            if isinstance(skill_list, list):
                skills_text = ', '.join(_tex(s) for s in skill_list if s)
            else:
                skills_text = _tex(str(skill_list))
            if skills_text:
                out.append(r'    \item \textbf{' + _tex(str(category).title()) + r'}: ' + skills_text)
    elif isinstance(skills, list):
        # Flat list — emit as one wrapped line per skill group
        # If skills are already "Category: skill1, skill2" strings, preserve structure
        for s in skills:
            if s and str(s).strip():
                out.append(r'    \item ' + _tex(str(s).strip()))
    else:
        out.append(r'    \item ' + _tex(str(skills)))

    out.append(r'\end{cvitems}')
    return '\n'.join(out) + '\n\n'


def _education(education: List[Dict[str, Any]]) -> str:
    if not education:
        return ''

    out = [r'\resumesec{Education}', '']

    for edu in education:
        institution = _tex(edu.get('institution', ''))
        degree      = _tex(edu.get('degree', ''))
        year        = _tex(str(edu.get('year', '')))
        gpa         = edu.get('gpa', '')

        # Degree bold left  ←→  Year italic right
        out.append(
            r'\noindent\textbf{' + degree + r'}'
            + (r' \hfill \textit{' + year + r'}' if year else '')
            + r' \\'
        )

        # Institution + optional GPA
        if institution:
            if gpa:
                out.append(institution + r' \hfill CGPA: ' + _tex(str(gpa)))
            else:
                out.append(institution)

        out.append('')

    return '\n'.join(out) + '\n'


def _certifications(certifications: List) -> str:
    if not certifications:
        return ''

    out = [r'\resumesec{Certifications \& Training}', r'\begin{cvitems}']

    for cert in certifications:
        if isinstance(cert, str):
            out.append(r'    \item ' + _tex(cert))
        elif isinstance(cert, dict):
            name   = _tex(cert.get('name', ''))
            issuer = _tex(cert.get('issuer', ''))
            date   = _tex(cert.get('date', ''))
            entry  = name
            if issuer:
                entry += ', ' + issuer
            if date:
                entry += ' (' + date + ')'
            out.append(r'    \item ' + entry)

    out.append(r'\end{cvitems}')
    return '\n'.join(out) + '\n\n'


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

_PREAMBLE = r"""\documentclass[a4paper,11pt]{article}
\usepackage[top=1.5cm, bottom=1.5cm, left=1.5cm, right=1.5cm]{geometry}
\usepackage[hidelinks]{hyperref}
\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlength{\parskip}{4pt}

% Section heading with rule — no titlesec needed (not in scheme-medium)
\newcommand{\resumesec}[1]{%
  \vspace{8pt}\noindent{\large\bfseries #1}\par\vspace{1pt}%
  \noindent\rule{\linewidth}{0.4pt}\vspace{5pt}%
}

% Compact bullet list — no enumitem needed (not in scheme-medium)
\newenvironment{cvitems}{%
  \begin{list}{\textbullet}{%
    \setlength{\leftmargin}{1.2em}%
    \setlength{\itemsep}{2pt}%
    \setlength{\topsep}{2pt}%
    \setlength{\parsep}{0pt}%
    \setlength{\partopsep}{0pt}%
  }%
}{\end{list}}

\begin{document}
"""

_POSTAMBLE = '\n' + r'\end{document}' + '\n'


def generate_formal_cv_latex(content: Dict[str, Any]) -> str:
    """
    Generate a complete .tex document from normalised resume content.

    Content is expected in camelCase format (personalInfo, experience, etc.)
    as produced by normalize_resume_content() in resume.py.
    """
    personal_info  = content.get('personalInfo', {})
    summary        = content.get('summary', '')
    experience     = content.get('experience', [])
    education_list = content.get('education', [])
    skills_data    = content.get('skills', [])
    certifications = content.get('certifications', [])
    projects_list  = content.get('projects', [])

    body = (
        _header(personal_info)
        + _summary(summary)
        + _experience(experience)
        + (_projects(projects_list) if projects_list else '')
        + (_skills(skills_data) if skills_data else '')
        + (_education(education_list) if education_list else '')
        + (_certifications(certifications) if certifications else '')
    )

    return _PREAMBLE + body + _POSTAMBLE


def compile_latex_to_pdf(tex_source: str) -> BytesIO:
    """
    Write tex_source to a temp file, compile with pdflatex, return PDF bytes.

    Runs pdflatex twice (second pass ensures cross-references / TOC are stable).
    Raises RuntimeError on compilation failure or missing pdflatex binary.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, 'resume.tex')
        pdf_path = os.path.join(tmpdir, 'resume.pdf')

        with open(tex_path, 'w', encoding='utf-8') as fh:
            fh.write(tex_source)

        cmd = [
            'pdflatex',
            '-interaction=nonstopmode',
            '-halt-on-error',
            '-output-directory', tmpdir,
            tex_path,
        ]

        def _run() -> subprocess.CompletedProcess:
            return subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=tmpdir,
            )

        try:
            result = _run()
            # Run twice — standard practice for correct layout
            if os.path.exists(pdf_path):
                _run()
            else:
                # First pass failed; log and raise
                logger.error('pdflatex first pass failed.\nSTDOUT:\n%s\nSTDERR:\n%s',
                             result.stdout[-3000:], result.stderr[-1000:])
                raise RuntimeError(
                    f'LaTeX compilation failed (return code {result.returncode}). '
                    'Check server logs for pdflatex output.'
                )

            if not os.path.exists(pdf_path):
                raise RuntimeError('pdflatex did not produce a PDF after two passes.')

            with open(pdf_path, 'rb') as fh:
                return BytesIO(fh.read())

        except FileNotFoundError:
            raise RuntimeError(
                'pdflatex not found on PATH. '
                'Install TeX Live: add texlive.combined.scheme-medium to nixpacks.toml '
                'or run: apt-get install texlive-latex-recommended texlive-fonts-recommended texlive-latex-extra'
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError('LaTeX compilation timed out (60 s limit).')
