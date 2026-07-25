from graph.workflow import workflow
from models.telemetry import TelemetryData

telemetry = TelemetryData(
    component_name="Payment Form",
    cognitive_score=0.85,
    mouse_velocity=20,
    hesitation_time=6.5,
    rage_clicks=5,
)

result = workflow.invoke({
    "telemetry": telemetry,
    "strategy": "",
    "prompt": "",
    "component": "",
    "is_valid": False,
    "errors": [],
    "generation_time": 0.0,
})

print("=== STRATEGY ===")
print(result["strategy"])
print()
print("=== GENERATED COMPONENT ===")
print(result["component"])
print()
print("=== IS VALID ===")
print(result["is_valid"])
print()
print("=== GENERATION TIME ===")
print(result["generation_time"])