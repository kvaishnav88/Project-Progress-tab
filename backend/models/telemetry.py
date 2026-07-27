from typing import Optional

from pydantic import BaseModel, Field

class TelemetryData(BaseModel):
    component_name: str = Field(..., description="Current UI component")

    cognitive_score: Optional[float] = None

    mouse_velocity: float

    hesitation_time: float

    rage_clicks: int = Field(..., ge=0)