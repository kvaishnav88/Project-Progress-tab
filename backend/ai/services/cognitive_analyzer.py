from models.telemetry import TelemetryData


class CognitiveAnalyzer:
    """
    Analyze telemetry and determine the user's cognitive load.
    """

    def analyze(self, telemetry: TelemetryData) -> tuple[float, str]:
        score = 0.0

        # Hesitation contributes up to 0.4
        if telemetry.hesitation_time >= 6:
            score += 0.4
        elif telemetry.hesitation_time >= 3:
            score += 0.2

        # Rage clicks contribute up to 0.4
        if telemetry.rage_clicks >= 4:
            score += 0.4
        elif telemetry.rage_clicks >= 2:
            score += 0.2

        # Slow mouse movement contributes up to 0.2
        if telemetry.mouse_velocity <= 20:
            score += 0.2

        score = round(score, 2)

        if score >= 0.8:
            strategy = "high_cognitive_load"
        elif score >= 0.4:
            strategy = "medium_cognitive_load"
        else:
            strategy = "low_cognitive_load"

        return score, strategy