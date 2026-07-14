from typing import TypedDict

from models.telemetry import TelemetryData


class GraphState(TypedDict):
    """
    Shared state passed between LangGraph nodes.
    """

    telemetry: TelemetryData

    strategy: str

    prompt: str

    component: str

    is_valid: bool

    errors: list[str]

    generation_time: float