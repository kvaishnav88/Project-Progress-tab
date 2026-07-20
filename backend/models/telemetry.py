from pydantic import BaseModel, Field


class TelemetryData(BaseModel):
    component_name: str = Field(..., description="Current UI component")
    cognitive_score: float = Field(..., ge=0, le=1)
    mouse_velocity: float
    hesitation_time: float
    rage_clicks: int = Field(..., ge=0)