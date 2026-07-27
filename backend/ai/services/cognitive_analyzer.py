from models.telemetry import TelemetryData


class CognitiveAnalyzer:
    """
    Analyze telemetry and determine the user's cognitive load.
    """

    def analyze(self, telemetry: TelemetryData) -> tuple[float, str]:
        score = 0.0

        # Rule 1: Long hesitation
        if telemetry.hesitation_time >= 5:
            score += 0.4

        # Rule 2: Rage clicks
        if telemetry.rage_clicks >= 3:
            score += 0.4

        # Rule 3: Slow mouse movement
        if telemetry.mouse_velocity <= 20:
            score += 0.2

        score = round(score, 2)

        if score >= 0.8:
            strategy = "high_cognitive_load"
        elif score >= 0.5:
            strategy = "medium_cognitive_load"
        else:
            strategy = "low_cognitive_load"

        return score, strategy