import logging
import os
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.user import User, SubscriptionType
from app.models.drip_email_log import DripEmailLog
from app.services.coupon_service import coupon_service
from app.services.email_service import email_service

logger = logging.getLogger(__name__)

# (day_offset, drip_step, discount_percent or None)
DRIP_SCHEDULE = [
    (2, 1, None),
    (4, 2, 20),
    (6, 3, 30),
    (8, 4, 50),
    (10, 5, 80),
]

DRIP_EMAIL_SUBJECTS = {
    1: "Are you still working on your resume?",
    2: "Something I wanted to share with you",
    3: "Still in the job hunt?",
    4: "One thing most job seekers overlook",
    5: "A last note from me",
}

DRIP_TEMPLATE_NAMES = {
    1: "drip_step1_reminder.html",
    2: "drip_step2_20off.html",
    3: "drip_step3_30off.html",
    4: "drip_step4_50off.html",
    5: "drip_step5_80off.html",
}

DRIP_TEXT_TEMPLATES = {
    1: (
        "Hi {{user_name}},\n\n"
        "I noticed you signed up for Resume Builder a couple of days ago. How's it going so far?\n\n"
        "One thing I see people miss is the AI optimization feature -- it rewrites your resume bullets "
        "to match each job description's exact keywords, which makes a real difference when your resume "
        "goes through ATS screening. There's also unlimited ATS scoring, a cover letter generator, and "
        "LinkedIn profile tools.\n\n"
        "If any of that sounds useful, you can see what's included in each plan here:\n{{pricing_url}}\n\n"
        "Happy to help if you have any questions -- just reply to this email.\n\n"
        "Yash\nResume Builder"
    ),
    2: (
        "Hi {{user_name}},\n\n"
        "Have you tried the ATS analysis tool yet? It shows exactly which keywords your resume is "
        "missing for a specific job posting -- most people find it pretty eye-opening the first time "
        "they run it.\n\n"
        "I've set up a code for you at checkout: {{coupon_code}} (valid {{expiry_days}} days)\n"
        "{{pricing_url}}\n\n"
        "Let me know if you have any questions.\n\n"
        "Yash\nResume Builder"
    ),
    3: (
        "Hi {{user_name}},\n\n"
        "Quick check-in -- are you still working on job applications?\n\n"
        "I've bumped up the code from last time. Use {{coupon_code}} at checkout -- it's valid for "
        "{{expiry_days}} days:\n{{pricing_url}}\n\n"
        "The AI optimization rewrites your resume bullets to match each job description's keywords -- "
        "most users start seeing more callbacks within the first week.\n\n"
        "Reply if you have any questions. Happy to help.\n\n"
        "Yash\nResume Builder"
    ),
    4: (
        "Hi {{user_name}},\n\n"
        "Something worth knowing: most resumes don't get rejected because they're bad -- they get "
        "filtered out because the ATS doesn't find the right keywords. The AI optimization in Resume "
        "Builder handles that automatically, rewriting your bullets to match the job description.\n\n"
        "If you want to try it, I've set a code for you at checkout: {{coupon_code}} "
        "(valid {{expiry_days}} days)\n{{pricing_url}}\n\n"
        "Happy to help if you have any questions.\n\n"
        "Yash\nResume Builder"
    ),
    5: (
        "Hi {{user_name}},\n\n"
        "This will be my last email -- I don't want to keep showing up in your inbox if the timing "
        "isn't right.\n\n"
        "I do have one last code if you ever want to give it a shot: {{coupon_code}}, "
        "good for {{expiry_days}} days\n{{pricing_url}}\n\n"
        "Hope the job search is going well. Feel free to reach out anytime.\n\n"
        "Yash\nResume Builder"
    ),
}


def _build_drip_text(step: int, template_vars: dict) -> str:
    """Build plain text version of a drip email."""
    text = DRIP_TEXT_TEMPLATES.get(step, "")
    for key, value in template_vars.items():
        text = text.replace(f"{{{{{key}}}}}", str(value))
    return text


def process_drip_emails(db: Session) -> dict:
    """Main drip processor. Called by cron endpoint. Returns stats."""
    now = datetime.utcnow()
    stats = {
        "checked": 0,
        "sent": 0,
        "skipped_upgraded": 0,
        "skipped_already_sent": 0,
        "errors": 0,
    }
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

    free_users = (
        db.query(User)
        .filter(User.subscription_type == SubscriptionType.FREE)
        .all()
    )

    for user in free_users:
        stats["checked"] += 1
        drip_start = user.drip_restarted_at if user.drip_restarted_at else user.created_at
        days_since_signup = (now - drip_start).days

        for day_offset, drip_step, discount_pct in DRIP_SCHEDULE:
            if days_since_signup < day_offset:
                continue

            # Already sent this step?
            existing = (
                db.query(DripEmailLog)
                .filter(
                    DripEmailLog.user_id == user.id,
                    DripEmailLog.drip_step == drip_step,
                )
                .first()
            )
            if existing:
                stats["skipped_already_sent"] += 1
                continue

            # User upgraded mid-loop?
            if user.subscription_type != SubscriptionType.FREE:
                stats["skipped_upgraded"] += 1
                break

            # Generate coupon if this step has a discount
            coupon_code = None
            if discount_pct:
                coupon_code = coupon_service.generate_drip_coupon(
                    user_id=user.id,
                    drip_step=drip_step,
                    discount_percent=discount_pct,
                    db=db,
                )

            pricing_url = f"{frontend_url}/pricing"
            if coupon_code:
                pricing_url += f"?coupon={coupon_code}"

            try:
                subject = DRIP_EMAIL_SUBJECTS[drip_step]
                template_name = DRIP_TEMPLATE_NAMES[drip_step]

                template_vars = {
                    "user_name": user.name,
                    "discount_percent": str(discount_pct) if discount_pct else "",
                    "coupon_code": coupon_code or "",
                    "pricing_url": pricing_url,
                    "expiry_days": "3",
                    "frontend_url": frontend_url,
                }

                html_content = email_service._load_template(template_name, template_vars)
                text_content = _build_drip_text(drip_step, template_vars)
                email_service.send_email(
                    to_email=user.email,
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content,
                )

                log_entry = DripEmailLog(
                    user_id=user.id,
                    drip_step=drip_step,
                    coupon_code=coupon_code,
                )
                db.add(log_entry)
                db.commit()

                stats["sent"] += 1
                logger.info(f"Drip step {drip_step} sent to user {user.id} ({user.email})")

            except IntegrityError:
                db.rollback()
                stats["skipped_already_sent"] += 1
            except Exception as e:
                db.rollback()
                stats["errors"] += 1
                logger.error(f"Failed drip step {drip_step} for user {user.id}: {e}")

            # Only process one step per user per cron run
            break

    return stats
