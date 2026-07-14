import time

from ai.factory import get_llm_client
from ai.logger import logger
from ai.prompts.ui_prompt import build_ui_prompt

llm = get_llm_client()


def analyze_telemetry(state):
    """
    Decide adaptation strategy from telemetry.
    """

    telemetry = state["telemetry"]

    score = telemetry.cognitive_score

    if score >= 0.8:
        strategy = "high_cognitive_load"
    elif score >= 0.5:
        strategy = "medium_cognitive_load"
    else:
        strategy = "low_cognitive_load"

    logger.info("Selected strategy: %s", strategy)

    state["strategy"] = strategy

    return state


def build_prompt(state):
    """
    Build the prompt for the LLM.
    """

    logger.info("Building prompt...")

    state["prompt"] = build_ui_prompt(state["telemetry"])

    return state


def generate_component(state):
    """
    Generate UI component using Gemini.
    """

    logger.info("Generating component...")

    start = time.perf_counter()

    try:

        state["component"] = llm.generate(state["prompt"])

        end = time.perf_counter()

        state["generation_time"] = round(end - start, 2)

        state["is_valid"] = True

    except Exception as e:

        end = time.perf_counter()

        state["generation_time"] = round(end - start, 2)

        state["component"] = ""

        state["is_valid"] = False

        state["errors"].append(str(e))

    return state