import logging
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import get_settings
from app.services.drip_service import process_drip_emails

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
