import secrets
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.coupon import Coupon


class CouponService:
    """Service for coupon validation, application, and generation."""

    def validate_coupon(self, code: str, plan: str, region: str, db: Session) -> dict:
        """Validate a coupon code. Returns dict with valid/error/discount_percent."""
        coupon = db.query(Coupon).filter(Coupon.code == code.upper()).first()

        if not coupon:
            return {"valid": False, "error": "Invalid coupon code"}
        if not coupon.is_active:
            return {"valid": False, "error": "Coupon is no longer active"}
        if coupon.valid_until and coupon.valid_until < datetime.utcnow():
            return {"valid": False, "error": "Coupon has expired"}
        if coupon.valid_from > datetime.utcnow():
            return {"valid": False, "error": "Coupon is not yet active"}
        if coupon.max_uses is not None and coupon.current_uses >= coupon.max_uses:
            return {"valid": False, "error": "Coupon usage limit reached"}
        if coupon.applicable_plans != "both" and coupon.applicable_plans != plan:
            return {"valid": False, "error": f"Coupon not valid for {plan} plan"}
        if coupon.region != "both" and coupon.region != region:
            return {"valid": False, "error": "Coupon not valid for your region"}

        return {
            "valid": True,
            "discount_percent": coupon.discount_percent,
            "code": coupon.code,
            "applicable_plans": coupon.applicable_plans,
        }

    def apply_coupon(self, code: str, db: Session) -> None:
        """Increment usage count after successful payment."""
        coupon = db.query(Coupon).filter(Coupon.code == code.upper()).first()
        if coupon:
            coupon.current_uses += 1

    def calculate_discounted_amount(self, original_amount: int, discount_percent: int) -> int:
        """Calculate discounted amount in paise/cents."""
        discount = int(original_amount * discount_percent / 100)
        return max(original_amount - discount, 0)

    def generate_drip_coupon(
        self, user_id: int, drip_step: int, discount_percent: int, db: Session
    ) -> str:
        """Generate a unique single-use drip coupon. Returns the code."""
        while True:
            random_part = "".join(
                secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8)
            )
            code = f"DRIP-{drip_step}-{random_part}"
            if not db.query(Coupon).filter(Coupon.code == code).first():
                break

        coupon = Coupon(
            code=code,
            discount_percent=discount_percent,
            max_uses=1,
            current_uses=0,
            valid_from=datetime.utcnow(),
            valid_until=datetime.utcnow() + timedelta(days=3),
            is_active=True,
            applicable_plans="both",
            region="both",
            is_drip_coupon=True,
            drip_user_id=user_id,
            drip_step=drip_step,
        )
        db.add(coupon)
        db.flush()
        return code


coupon_service = CouponService()
