from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TelemetryCreate(BaseModel):
    session_id: Optional[int] = Field(default=None, ge=1)
    mouse_x: Optional[float] = None
    mouse_y: Optional[float] = None
    clicks: Optional[int] = Field(default=None, ge=0)
    scroll_speed: Optional[float] = Field(default=None, ge=0)
    hesitation_time: Optional[float] = Field(default=None, ge=0)
    cognitive_score: Optional[float] = Field(default=None, ge=0, le=1)


class TelemetryRead(TelemetryCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
