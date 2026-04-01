#!/usr/bin/env python3
"""
Phase 5: Seed 100 high-intent blog keywords into blog_keywords table.

Run once:
    cd backend
    python scripts/seed_keywords.py

Idempotent — skips keywords that already exist.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal
from app.models.blog import BlogKeyword

# ── Keyword bank ─────────────────────────────────────────────────────────
# Format: (keyword, category, search_volume_estimate, competition, buyer_intent 1-10)

KEYWORDS = [
    # ── ATS / Resume Format ───────────────────────────────────────────────
    ("ATS resume format for freshers", "resume-tips", 8200, "low",  9),
    ("how to make ATS friendly resume", "resume-tips", 7400, "low",  9),
    ("ATS resume checker free India", "resume-tips", 6100, "medium", 9),
    ("best resume format for software engineer India", "resume-tips", 5800, "medium", 8),
    ("resume format for TCS freshers 2025", "resume-tips", 5200, "low", 9),
    ("Infosys resume format freshers", "resume-tips", 4900, "low",  9),
    ("Wipro resume tips fresher", "resume-tips", 4600, "low",  8),
    ("one page resume format India", "resume-tips", 4400, "medium", 8),
    ("resume skills section for IT freshers", "resume-tips", 4100, "low", 8),
    ("how to write summary in resume for freshers", "resume-tips", 3900, "low", 8),
    ("resume action words for IT professionals", "resume-tips", 3700, "low", 7),
    ("how to list projects in resume fresher", "resume-tips", 3500, "low", 8),
    ("resume format for MBA freshers India", "resume-tips", 3300, "low", 8),
    ("BCA resume format for freshers 2025", "resume-tips", 3100, "low", 8),
    ("MCA resume format for freshers 2025", "resume-tips", 3000, "low", 8),
    ("resume tips for 2 years experience India", "resume-tips", 2900, "low", 7),
    ("how to write quantifiable achievements in resume", "resume-tips", 2800, "medium", 7),
    ("engineering fresher resume format India", "resume-tips", 2700, "low", 8),
    ("resume gaps how to explain India", "resume-tips", 2600, "low", 7),
    ("ATS keywords for software developer resume", "resume-tips", 2500, "medium", 8),
    ("best font for resume India", "resume-tips", 2400, "low", 6),
    ("how to write objective in resume for fresher", "resume-tips", 2300, "low", 7),
    ("resume format for data analyst India", "resume-tips", 2200, "medium", 8),
    ("how to add certifications in resume India", "resume-tips", 2100, "low", 7),
    ("resume dos and don'ts India 2025", "resume-tips", 2000, "low", 7),

    # ── Interview Prep ────────────────────────────────────────────────────
    ("TCS NQT interview questions and answers", "interview-prep", 9100, "low",  10),
    ("Infosys interview questions for freshers 2025", "interview-prep", 8400, "low", 10),
    ("HR interview questions and answers for freshers", "interview-prep", 7800, "medium", 9),
    ("top interview questions for software engineer India", "interview-prep", 7100, "medium", 9),
    ("Wipro interview process freshers", "interview-prep", 6500, "low", 9),
    ("Cognizant interview questions freshers 2025", "interview-prep", 6100, "low", 9),
    ("tell me about yourself answer for fresher IT", "interview-prep", 5800, "medium", 8),
    ("technical interview questions for Java developer India", "interview-prep", 5400, "medium", 9),
    ("group discussion topics for campus placement 2025", "interview-prep", 5100, "low", 8),
    ("Accenture interview questions freshers", "interview-prep", 4900, "low", 9),
    ("Capgemini interview questions 2025", "interview-prep", 4600, "low", 9),
    ("HCL interview process freshers India", "interview-prep", 4300, "low", 8),
    ("how to crack campus placement interview India", "interview-prep", 4100, "medium", 9),
    ("Python interview questions for freshers India", "interview-prep", 3900, "medium", 8),
    ("SQL interview questions for data analyst India", "interview-prep", 3700, "medium", 8),
    ("aptitude test preparation for TCS NQT", "interview-prep", 3500, "low", 8),
    ("body language tips for interview India", "interview-prep", 3300, "low", 7),
    ("what to wear to interview India fresher", "interview-prep", 3100, "low", 6),
    ("how to answer why should we hire you fresher", "interview-prep", 2900, "medium", 8),
    ("React JS interview questions India 2025", "interview-prep", 2800, "medium", 8),
    ("Node.js interview questions for freshers India", "interview-prep", 2600, "medium", 8),
    ("system design interview preparation India", "interview-prep", 2500, "high", 8),
    ("how to negotiate salary fresher India", "interview-prep", 2400, "low", 8),
    ("common mistakes in HR interview India", "interview-prep", 2200, "low", 7),
    ("mock interview tips India engineering college", "interview-prep", 2100, "low", 7),

    # ── Career Advice ─────────────────────────────────────────────────────
    ("how to get first job after engineering India", "career-advice", 8800, "medium", 9),
    ("how to switch IT company India 2025", "career-advice", 7600, "medium", 9),
    ("career options after BCA India 2025", "career-advice", 7100, "low", 8),
    ("highest paying IT jobs India 2025", "career-advice", 6800, "medium", 8),
    ("how to get job in Google India", "career-advice", 6400, "medium", 8),
    ("LinkedIn profile tips for freshers India", "career-advice", 6000, "medium", 8),
    ("how to write cold email to recruiter India", "career-advice", 5600, "low", 8),
    ("off campus placement tips India 2025", "career-advice", 5300, "low", 9),
    ("freelancing vs full time job India fresh graduate", "career-advice", 5000, "low", 7),
    ("how to get internship in top MNC India", "career-advice", 4800, "medium", 9),
    ("salary hike tips India IT professional", "career-advice", 4500, "low", 8),
    ("best certifications for software engineer India 2025", "career-advice", 4300, "medium", 8),
    ("work from home IT jobs for freshers India", "career-advice", 4100, "low", 8),
    ("how to crack MAANG interview India", "career-advice", 3900, "high", 9),
    ("career growth in TCS vs startup India", "career-advice", 3600, "low", 7),
    ("how to build portfolio for software developer India", "career-advice", 3400, "medium", 8),
    ("GitHub profile tips for fresher India", "career-advice", 3200, "low", 7),
    ("career after 10 years gap India", "career-advice", 3000, "low", 8),
    ("how to ask for promotion India IT", "career-advice", 2800, "low", 7),
    ("networking tips for job seekers India", "career-advice", 2600, "medium", 7),
    ("job search strategy for experienced IT professional India", "career-advice", 2500, "medium", 8),
    ("how to ace Naukri profile India", "career-advice", 2300, "low", 7),
    ("best job boards India IT 2025", "career-advice", 2200, "low", 7),
    ("how to handle job rejection India", "career-advice", 2000, "low", 6),
    ("work life balance IT industry India tips", "career-advice", 1900, "low", 6),

    # ── Bonus high-intent ─────────────────────────────────────────────────
    ("free ATS resume builder India", "resume-tips", 9500, "medium", 10),
    ("online resume builder India free 2025", "resume-tips", 8900, "medium", 10),
    ("resume builder for freshers India", "resume-tips", 8300, "medium", 10),
    ("ATS score checker India free", "resume-tips", 7800, "medium", 10),
    ("how to increase ATS score resume India", "resume-tips", 7200, "medium", 9),
    ("TCS digital profile tips 2025", "interview-prep", 6700, "low", 9),
    ("campus placement preparation guide India 2025", "interview-prep", 6300, "medium", 9),
    ("data science career path India fresher", "career-advice", 5900, "medium", 9),
    ("cloud computing career India 2025", "career-advice", 5500, "medium", 8),
    ("DevOps engineer salary India 2025", "career-advice", 5100, "medium", 8),
    ("AI ML engineer career path India", "career-advice", 4800, "medium", 8),
    ("how to get remote job India international", "career-advice", 4500, "medium", 9),
    ("upskilling tips for IT professionals India", "career-advice", 4200, "low", 7),
    ("product manager career path India 2025", "career-advice", 3900, "medium", 8),
    ("full stack developer roadmap India fresher", "career-advice", 3700, "medium", 8),
    ("cybersecurity career India 2025", "career-advice", 3400, "medium", 8),
    ("blockchain developer career India", "career-advice", 3100, "medium", 7),
    ("internship to full time conversion tips India", "career-advice", 2900, "low", 8),
    ("GATE vs job which is better India CSE", "career-advice", 2700, "low", 7),
    ("how to become software architect India", "career-advice", 2500, "medium", 7),
    ("resume for career change IT to management India", "resume-tips", 2300, "low", 8),
    ("how to mention notice period in resume India", "resume-tips", 2100, "low", 7),
    ("interview questions for team lead India", "interview-prep", 2000, "medium", 8),
    ("appraisal tips for IT professionals India", "career-advice", 1900, "low", 7),
    ("how to get job in product startup India 2025", "career-advice", 1800, "low", 8),
]


def run() -> None:
    db = SessionLocal()
    inserted = skipped = 0

    try:
        for keyword, category, volume, competition, intent in KEYWORDS:
            existing = (
                db.query(BlogKeyword)
                .filter(BlogKeyword.keyword == keyword)
                .first()
            )
            if existing:
                skipped += 1
                continue

            db.add(BlogKeyword(
                keyword       = keyword,
                category      = category,
                search_volume = volume,
                competition   = competition,
                buyer_intent  = intent,
                status        = "pending",
            ))
            inserted += 1

        db.commit()
        print(f"✅ Done — {inserted} inserted, {skipped} skipped.")
        total = db.query(BlogKeyword).filter(BlogKeyword.status == "pending").count()
        print(f"📊 Total pending keywords: {total}")

    except Exception as exc:
        db.rollback()
        print(f"❌ Error: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
