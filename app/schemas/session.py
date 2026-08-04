from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SessionCreate(BaseModel):
    user_id: int
    device: Optional[str] = None
    browser: Optional[str] = None


class SessionUpdate(BaseModel):
    device: Optional[str] = None
    browser: Optional[str] = None
    logout_time: Optional[datetime] = None


class SessionRead(BaseModel):
    id: int
    user_id: int
    device: Optional[str] = None
    browser: Optional[str] = None
    login_time: Optional[datetime] = None
    logout_time: Optional[datetime] = None

    class Config:
        from_attributes = True
