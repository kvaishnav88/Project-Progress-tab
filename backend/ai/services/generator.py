from ai.factory import get_llm_client
from ai.logger import logger
from ai.prompts.ui_prompt import build_ui_prompt
from models.telemetry import TelemetryData


llm = get_llm_client()


def generate_ui(telemetry: TelemetryData) -> str:
    """
    Generate a React UI component based on telemetry data.
    """

    logger.info(
        "Starting UI generation for component: %s",
        telemetry.component_name,
    )

    prompt = build_ui_prompt(telemetry)

    logger.info("Prompt generated successfully.")

    response = llm.generate(prompt)

    logger.info("UI generation completed successfully.")

    return response