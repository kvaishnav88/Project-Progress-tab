from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Index
from sqlalchemy.sql import func
from app.db.database import Base


class GeneratedComponent(Base):
    __tablename__ = "generated_components"
    __table_args__ = (
        Index("ix_generated_components_user_id", "user_id"),
        Index("ix_generated_components_session_id", "session_id"),
        Index("ix_generated_components_created_at", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)

    component_name = Column(String(200), nullable=False)

    prompt = Column(Text, nullable=False)

    generated_code = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
