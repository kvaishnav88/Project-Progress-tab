from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, Index
from sqlalchemy.sql import func
from app.db.database import Base


class Telemetry(Base):
    __tablename__ = "telemetry_logs"
    __table_args__ = (
        Index("ix_telemetry_logs_session_id", "session_id"),
        Index("ix_telemetry_logs_created_at", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)

    mouse_x = Column(Float)

    mouse_y = Column(Float)

    clicks = Column(Integer)

    scroll_speed = Column(Float)

    hesitation_time = Column(Float)

    cognitive_score = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
