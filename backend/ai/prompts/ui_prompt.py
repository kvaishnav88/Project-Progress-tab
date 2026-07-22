from models.telemetry import TelemetryData


def get_cognitive_state(score: float) -> str:
    """
    Convert cognitive score into a human-readable state.
    """
    if score >= 0.8:
        return "High Cognitive Load"
    elif score >= 0.5:
        return "Moderate Cognitive Load"
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


def get_system_prompt() -> str:
    """
    Defines the AI's role.
    """
    return """
You are a Senior React, TypeScript, Tailwind CSS and UX Engineer.

Your responsibility is to generate adaptive UI components
that reduce user cognitive load.

Always produce:
- Clean React TypeScript code
- Tailwind CSS only
- Accessible UI
- Readable code
- Responsive layout

Return ONLY the React component code.
"""


def get_context_prompt(
    telemetry: TelemetryData,
    cognitive_state: str,
    observations: str,
) -> str:
    """
    Build telemetry context section.
    """
    return f"""
Current Component:
{telemetry.component_name}

User Cognitive State:
{cognitive_state}

Observed Behaviour:
{observations}
"""


def get_decision_prompt(decision: dict) -> str:
    """
    Build decision engine section.
    """
    return f"""
UI Adaptation Strategy

Layout:
{decision["layout"]}

Spacing:
{decision["spacing"]}

Button Size:
{decision["buttons"]}

Secondary Actions:
{decision["secondary_actions"]}

Visual Complexity:
{decision["visual_complexity"]}
"""


def get_generation_rules() -> str:
    """
    Build generation rules section.
    """
    return """
Requirements

- Use React with TypeScript.
- Use Tailwind CSS only.
- Follow the UI Adaptation Strategy exactly.
- Reduce cognitive load.
- Improve accessibility.
- Increase readability.
- Avoid unnecessary complexity.
- Return ONLY the React component code.
"""


def build_ui_prompt(
    telemetry: TelemetryData,
    decision: dict,
) -> str:
    """
    Build the final prompt sent to Gemini.
    """

    cognitive_state = get_cognitive_state(
        telemetry.cognitive_score
    )

    observations = "\n".join(
        f"- {obs}"
        for obs in get_behavior_summary(telemetry)
    )

    prompt = "\n\n".join(
        [
            get_system_prompt(),
            get_context_prompt(
                telemetry,
                cognitive_state,
                observations,
            ),
            get_decision_prompt(decision),
            get_generation_rules(),
        ]
    )

    return prompt