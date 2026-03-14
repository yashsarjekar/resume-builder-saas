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
    1: "Your free plan is powerful -- but you're leaving features on the table",
    2: "Exclusive: 20% off any Resume Builder plan (48 hrs only)",
    3: "Going fast: 30% off Pro & Starter -- upgrade today",
    4: "Your biggest deal yet: 50% off Resume Builder Pro",
    5: "Final offer: 80% off -- we won't offer this again",
}

DRIP_TEMPLATE_NAMES = {
    1: "drip_step1_reminder.html",
    2: "drip_step2_20off.html",
    3: "drip_step3_30off.html",
    4: "drip_step4_50off.html",
    5: "drip_step5_80off.html",
}


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
        days_since_signup = (now - user.created_at).days

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
                email_service.send_email(
                    to_email=user.email,
                    subject=subject,
                    html_content=html_content,
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
