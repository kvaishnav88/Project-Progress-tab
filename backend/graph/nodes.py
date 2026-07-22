import time

from ai.factory import get_llm_client
from ai.logger import logger
from ai.prompts.ui_prompt import build_ui_prompt
from ai.services.cognitive_analyzer import CognitiveAnalyzer
from ai.services.decision_engine import DecisionEngine

llm = get_llm_client()
analyzer = CognitiveAnalyzer()
decision_engine = DecisionEngine()


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

def decide_adaptation(state):
    """
    Decide how the UI should adapt based on the cognitive load strategy.
    """

    logger.info("Running Decision Engine...")

    decision = decision_engine.decide(state["strategy"])

    state["decision"] = decision

    logger.info("Decision: %s", decision)

    return state


def build_prompt(state):
    """
    Build the prompt for the LLM.
    """

    logger.info("Building prompt...")

    state["prompt"] = build_ui_prompt(
    state["telemetry"],
    state["decision"],
    )

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

