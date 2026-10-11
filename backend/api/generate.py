import json

from fastapi import APIRouter, Depends, HTTPException

from api.limits import generate_guard
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
    dependencies=[Depends(generate_guard)],
)
def generate_ui(telemetry: TelemetryData):
    """
    Generate an adaptive UI using LangGraph.
    """
    if len(telemetry.component_name or "") > 80:
        raise HTTPException(status_code=413, detail="component_name is too long")
    ui_state = getattr(telemetry, "ui_state", None) or {}
    if len(json.dumps(ui_state, default=str)) > 4000:
        raise HTTPException(status_code=413, detail="ui_state is too large")

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
    )