from ai.clients.gemini import generate_response
from ai.prompts.ui_prompt import build_ui_prompt
from models.telemetry import TelemetryData


def generate_ui(telemetry: TelemetryData) -> str:
    """
    Generate a UI component based on telemetry data.
    """

    prompt = build_ui_prompt(telemetry)

    return generate_response(prompt)