from typing import Any, Optional

from pydantic import BaseModel, Field


class TelemetryData(BaseModel):
    component_name: str = Field(..., description="Current UI component")

    cognitive_score: Optional[float] = None

    mouse_velocity: float

    hesitation_time: float

    rage_clicks: int = Field(..., ge=0)

    ui_state: dict[str, Any] = Field(
        default_factory=dict,
        description="Relevant current UI/input state to preserve during regeneration",
    )