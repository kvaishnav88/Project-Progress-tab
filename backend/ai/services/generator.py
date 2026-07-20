import time

from ai.clients.gemini import generate_response
from ai.logger import logger
from ai.prompts.ui_prompt import build_ui_prompt
from models.telemetry import TelemetryData


def generate_ui(telemetry: TelemetryData) -> dict:
    """
    Generate an adaptive UI component based on telemetry.
    """

    logger.info(
        f"Starting UI generation for component: {telemetry.component_name}"
    )

    prompt = build_ui_prompt(telemetry)

    logger.info("Prompt generated successfully.")

    start = time.perf_counter()

    component = generate_response(prompt)

    end = time.perf_counter()

    generation_time = round(end - start, 2)

    logger.info(
        f"Generation completed in {generation_time} seconds."
    )

    return {
        "component": component,
        "generation_time": generation_time,
    }