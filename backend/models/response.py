from pydantic import BaseModel


class GenerateResponse(BaseModel):
    """
    Response returned by the AI generation API.
    """

    strategy: str

    component: str

    is_valid: bool

    generation_time: float