from graph.workflow import workflow
from models.telemetry import TelemetryData

telemetry = TelemetryData(
    component_name="Payment Form",
    cognitive_score=0.91,
    mouse_velocity=15,
    hesitation_time=7.2,
    rage_clicks=6,
)

result = workflow.invoke(
    {
        "telemetry": telemetry,
        "strategy": "",
        "prompt": "",
        "component": "",
        "is_valid": False,
        "errors": [],
    }
)

print(result["component"])