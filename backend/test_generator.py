from ai.services.generator import generate_ui
from models.telemetry import TelemetryData

telemetry = TelemetryData(
    component_name="Payment Form",
    cognitive_score=0.91,
    mouse_velocity=15,
    hesitation_time=7.2,
    rage_clicks=6,
)

response = generate_ui(telemetry)

print(response)