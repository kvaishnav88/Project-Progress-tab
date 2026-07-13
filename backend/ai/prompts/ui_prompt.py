from models.telemetry import TelemetryData


def get_cognitive_state(score: float) -> str:
    """
    Convert cognitive score into a human-readable state.
    """
    if score >= 0.8:
        return "High Cognitive Load"
    elif score >= 0.5:
        return "Moderate Cognitive Load"
    else:
        return "Low Cognitive Load"


def get_behavior_summary(telemetry: TelemetryData) -> list[str]:
    """
    Convert telemetry values into user behavior observations.
    """
    observations = []

    if telemetry.hesitation_time >= 5:
        observations.append(
            "The user hesitated before interacting with the interface."
        )

    if telemetry.rage_clicks >= 3:
        observations.append(
            "The user repeatedly clicked interface elements."
        )

    if telemetry.mouse_velocity <= 20:
        observations.append(
            "The user's mouse movements were slow and cautious."
        )

    if not observations:
        observations.append(
            "The user interacted normally."
        )

    return observations


def build_ui_prompt(telemetry: TelemetryData) -> str:
    """
    Build a structured prompt for Gemini based on telemetry.
    """

    cognitive_state = get_cognitive_state(
        telemetry.cognitive_score
    )

    observations = "\n".join(
        f"- {obs}" for obs in get_behavior_summary(telemetry)
    )

    return f"""
You are an expert React, TypeScript and Tailwind CSS engineer.

Your task is to redesign the UI for better usability.

Current Component:
{telemetry.component_name}

User State:
{cognitive_state}

Observed Behaviour:
{observations}

Requirements:

- Generate clean React TypeScript code.
- Use Tailwind CSS only.
- Reduce cognitive load.
- Improve readability.
- Keep the layout simple.
- Use large buttons and inputs.
- Improve accessibility.
- Return ONLY the React component code.
"""