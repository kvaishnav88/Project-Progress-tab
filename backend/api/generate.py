from fastapi import APIRouter

from graph.workflow import workflow
from models.response import GenerateResponse
from models.telemetry import TelemetryData

router = APIRouter(
    prefix="/generate-ui",
    tags=["AI Generator"],
)


@router.post(
    "",
    response_model=GenerateResponse,
)
def generate_ui(
    telemetry: TelemetryData,
):
    """
    Generate an adaptive UI using LangGraph.
    """

    result = workflow.invoke(
    {
        "telemetry": telemetry,
        "strategy": "",
        "decision": {},
        "prompt": "",
        "component": "",
        "is_valid": False,
        "errors": [],
        "generation_time": 0.0,
    }
)

    return GenerateResponse(
        strategy=result["strategy"],
        component=result["component"],
        is_valid=result["is_valid"],
        generation_time=result["generation_time"],
)