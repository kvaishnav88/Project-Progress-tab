from ai.constants import (
    HIGH_COGNITIVE_LOAD,
    MEDIUM_COGNITIVE_LOAD,
)
from ai.factory import get_llm_client
from ai.logger import logger
from ai.prompts.ui_prompt import build_ui_prompt

llm = get_llm_client()


def analyze_telemetry(state):
    """
    Analyze telemetry data and determine the cognitive load strategy.
    """

    telemetry = state["telemetry"]
    score = telemetry.cognitive_score

    if score >= HIGH_COGNITIVE_LOAD:
        strategy = "high_cognitive_load"

    elif score >= MEDIUM_COGNITIVE_LOAD:
        strategy = "medium_cognitive_load"

    else:
        strategy = "low_cognitive_load"

    logger.info("Selected strategy: %s", strategy)

    state["strategy"] = strategy

    return state


def build_prompt(state):
    """
    Build the LLM prompt from telemetry data.
    """

    logger.info("Building prompt...")

    state["prompt"] = build_ui_prompt(
        state["telemetry"]
    )

    return state


def generate_component(state):
    """
    Generate the React component using the configured LLM.
    """

    logger.info("Generating component...")

    try:
        state["component"] = llm.generate(
            state["prompt"]
        )

        state["is_valid"] = True

    except Exception as e:
        logger.error("Component generation failed: %s", e)

        state["component"] = ""
        state["is_valid"] = False
        state["errors"].append(str(e))

    return state