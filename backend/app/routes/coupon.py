from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional

from app.database import get_db
from app.services.coupon_service import coupon_service

router = APIRouter()


class ValidateCouponRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    plan: str = Field(default="both")
    region: str = Field(default="both")


class ValidateCouponResponse(BaseModel):
    valid: bool
    discount_percent: int = 0
    code: str = ""
    error: str = ""
    applicable_plans: str = "both"


@router.post("/validate", response_model=ValidateCouponResponse)
async def validate_coupon(
    request: ValidateCouponRequest,
    db: Session = Depends(get_db),
):
    """Validate a coupon code. Public endpoint (no auth required)."""
    result = coupon_service.validate_coupon(
        code=request.code,
        plan=request.plan,
        region=request.region,
        db=db,
    )
    return ValidateCouponResponse(
        valid=result.get("valid", False),
        discount_percent=result.get("discount_percent", 0),
        code=result.get("code", ""),
        error=result.get("error", ""),
        applicable_plans=result.get("applicable_plans", "both"),
    )
