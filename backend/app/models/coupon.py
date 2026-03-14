from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, CheckConstraint
from datetime import datetime
from ..database import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    discount_percent = Column(Integer, nullable=False)
    max_uses = Column(Integer, nullable=True)  # NULL = unlimited
    current_uses = Column(Integer, default=0, nullable=False)
    valid_from = Column(DateTime, default=datetime.utcnow, nullable=False)
    valid_until = Column(DateTime, nullable=True)  # NULL = never expires
    is_active = Column(Boolean, default=True, nullable=False)
    applicable_plans = Column(String(20), default="both", nullable=False)  # starter/pro/both
    region = Column(String(10), default="both", nullable=False)  # IN/INTL/both

    # Drip campaign fields
    is_drip_coupon = Column(Boolean, default=False, nullable=False)
    drip_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    drip_step = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("discount_percent > 0 AND discount_percent <= 100", name="valid_discount"),
    )
