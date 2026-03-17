import logging
import os
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import get_settings
from app.services.drip_service import process_drip_emails, DRIP_EMAIL_SUBJECTS, DRIP_TEMPLATE_NAMES, _build_drip_text
from app.services.email_service import email_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/drip-emails")
async def run_drip_emails(
    x_cron_secret: str = Header(..., alias="X-Cron-Secret"),
    db: Session = Depends(get_db),
):
    """Process drip email campaign. Protected by CRON_SECRET header."""
    settings = get_settings()
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        logger.warning("Drip email cron called with invalid secret")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid cron secret",
        )

    stats = process_drip_emails(db)
    logger.info(f"Drip email cron completed: {stats}")
    return {"status": "ok", "stats": stats}


class TestDripRequest(BaseModel):
    email: str
    drip_step: int  # 1-5
    name: Optional[str] = "Test User"


@router.post("/test-drip-email")
async def test_drip_email(
    request: TestDripRequest,
    x_cron_secret: str = Header(..., alias="X-Cron-Secret"),
):
    """
    Send a test drip email to a specific address. Protected by CRON_SECRET.
    Useful for previewing email templates before enabling cron.

    Steps: 1=reminder, 2=20%off, 3=30%off, 4=50%off, 5=80%off
    """
    settings = get_settings()
    if not settings.CRON_SECRET or x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid cron secret",
        )

    if request.drip_step < 1 or request.drip_step > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="drip_step must be between 1 and 5",
        )

    # Build template variables with test data
    discount_map = {1: None, 2: 20, 3: 30, 4: 50, 5: 80}
    discount_pct = discount_map[request.drip_step]
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    coupon_code = f"TEST-{request.drip_step}-ABCD1234"
    pricing_url = f"{frontend_url}/pricing"
    if coupon_code and discount_pct:
        pricing_url += f"?coupon={coupon_code}"

    template_vars = {
        "user_name": request.name,
        "discount_percent": str(discount_pct) if discount_pct else "",
        "coupon_code": coupon_code if discount_pct else "",
        "pricing_url": pricing_url,
        "expiry_days": "3",
        "frontend_url": frontend_url,
    }

    subject = DRIP_EMAIL_SUBJECTS[request.drip_step]
    template_name = DRIP_TEMPLATE_NAMES[request.drip_step]

    try:
        html_content = email_service._load_template(template_name, template_vars)
        text_content = _build_drip_text(request.drip_step, template_vars)
        email_service.send_email(
            to_email=request.email,
            subject=f"[TEST] {subject}",
            html_content=html_content,
            text_content=text_content,
        )
        return {
            "status": "sent",
            "to": request.email,
            "drip_step": request.drip_step,
            "subject": f"[TEST] {subject}",
        }
    except Exception as e:
        logger.error(f"Test drip email failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test email: {str(e)}",
        )
