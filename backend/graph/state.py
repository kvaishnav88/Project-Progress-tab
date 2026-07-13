from typing import TypedDict

from models.telemetry import TelemetryData


class GraphState(TypedDict):
    """
    Shared state passed between LangGraph nodes.
    """

    # Input received from FastAPI / Frontend
    telemetry: TelemetryData

    # Strategy selected by AI
    strategy: str

    # Prompt generated for the LLM
    prompt: str

    # Generated React component
    component: str

    # Validation result
    is_valid: bool

    # Any errors generated during workflow
    errors: list[str]