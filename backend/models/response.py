from typing import List

from pydantic import BaseModel, Field


class GenerateResponse(BaseModel):
    """
    Response returned by the AI generation API.
    """

    strategy: str

    component: str

    is_valid: bool

    generation_time: float

    errors: List[str] = Field(default_factory=list)
