from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class GeneratedUICreate(BaseModel):
    user_id: Optional[int] = Field(default=None, ge=1)
    session_id: Optional[int] = Field(default=None, ge=1)
    component_name: str = Field(..., min_length=1, max_length=200)
    prompt: str = Field(..., min_length=1, max_length=4000)
    generated_code: str = Field(..., min_length=1, max_length=200_000)


class GeneratedUIRead(GeneratedUICreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GenerateUIRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000, description="Natural language UI request")
    user_id: Optional[int] = Field(default=None, ge=1)
    session_id: Optional[int] = Field(default=None, ge=1)
    use_cache: bool = True


class GenerateUIResponse(BaseModel):
    status: str
    cached: bool
    prompt_hash: str
    id: int
    user_id: Optional[int] = None
    session_id: Optional[int] = None
    component_name: str
    prompt: str
    component: str
    generated_code: str
    created_at: Optional[str] = None
