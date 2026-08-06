from fastapi import APIRouter, Query

from graph.workflow import workflow
from models.response import GenerateResponse
from models.telemetry import TelemetryData

router = APIRouter(
    prefix="/generate-ui",
    tags=["AI Generator"],
)


def _run_generation(telemetry: TelemetryData) -> GenerateResponse:
    result = workflow.invoke(
        {
            "telemetry": telemetry,
            "strategy": "",
            "decision": {},
            "prompt_type": "",
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
        errors=result.get("errors") or [],
    )


@router.get(
    "",
    response_model=GenerateResponse,
    summary="Generate UI (GET / browser-friendly)",
)
def generate_ui_get(
    component_name: str = Query("Payment Form"),
    mouse_velocity: float = Query(18.0),
    hesitation_time: float = Query(7.5),
    rage_clicks: int = Query(6, ge=0),
    cognitive_score: float | None = Query(0.92),
):
    """
    Same as POST, but callable from the browser via query params.
    Example: /generate-ui?component_name=Checkout&rage_clicks=3
    """
    telemetry = TelemetryData(
        component_name=component_name,
        cognitive_score=cognitive_score,
        mouse_velocity=mouse_velocity,
        hesitation_time=hesitation_time,
        rage_clicks=rage_clicks,
    )
    return _run_generation(telemetry)


@router.post(
    "",
    response_model=GenerateResponse,
    summary="Generate UI (POST / JSON body)",
)
def generate_ui(telemetry: TelemetryData):
    """
    Generate an adaptive UI using LangGraph.
    """
    return _run_generation(telemetry)
