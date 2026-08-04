from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.sql import func
from app.db.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    device = Column(String(100))

    browser = Column(String(100))

    login_time = Column(DateTime(timezone=True), server_default=func.now())

    logout_time = Column(DateTime(timezone=True), nullable=True)