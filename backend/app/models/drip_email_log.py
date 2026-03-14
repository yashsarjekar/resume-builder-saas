from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from datetime import datetime
from ..database import Base


class DripEmailLog(Base):
    __tablename__ = "drip_email_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    drip_step = Column(Integer, nullable=False)
    coupon_code = Column(String(50), nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "drip_step", name="uq_drip_user_step"),
    )
