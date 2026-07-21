import time

from ai.factory import get_llm_client
from ai.logger import logger
from ai.prompts.ui_prompt import build_ui_prompt
from ai.services.cognitive_analyzer import CognitiveAnalyzer
analyzer = CognitiveAnalyzer()

llm = get_llm_client()


def analyze_telemetry(state):
    """
    Analyze telemetry and determine the UI adaptation strategy.
    """

    telemetry = state["telemetry"]

    score, strategy = analyzer.analyze(telemetry)

    telemetry.cognitive_score = score

    logger.info(
        "Cognitive Score: %.2f | Strategy: %s",
        score,
        strategy,
    )

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