from collections import deque
from typing import Deque, Dict
from dataclasses import dataclass

@dataclass
class Telemetry:
    mouse_velocity: float = 0.0
    mouse_acceleration: float = 0.0
    hesitation_time_ms: float = 0.0
    click_count: int = 0
    click_error_rate: float = 0.0
    scroll_jitter_count: int = 0
    correction_count: int = 0

def compute_cognitive_load_score(t: Telemetry) -> float:
    raw_score = (
        0.20 * (t.mouse_velocity / 650) * 100
        + 0.15 * (t.mouse_acceleration / 480) * 100
        + 0.20 * (t.hesitation_time_ms / 2800) * 100
        + 0.15 * (t.click_error_rate) * 100
        + 0.10 * (min(t.click_count, 10) / 10) * 100
        + 0.10 * (min(t.correction_count, 10) / 10) * 100
        + 0.10 * (min(t.scroll_jitter_count, 10) / 10) * 100
    )
    return round(max(0.0, min(100.0, raw_score)), 2)

def decide_ui_action(score: float, threshold: float = 75.0) -> str:
    if score >= threshold:
        return "trigger_wizard_regeneration"
    if score >= 50:
        return "simplify_field"
    if score >= 30:
        return "show_inline_hint"
    return "no_action"

class SessionFrictionTracker:
    def __init__(self, window_size: int = 5):
        self.window_size = window_size
        self._sessions: Dict[str, Deque[float]] = {}

    def record_event(self, session_id: str, telemetry: Telemetry) -> Dict[str, float]:
        score = compute_cognitive_load_score(telemetry)

        if session_id not in self._sessions:
            self._sessions[session_id] = deque(maxlen=self.window_size)
        history = self._sessions[session_id]

        history.append(score)
        smoothed = round(sum(history) / len(history), 2)

        return {"instant_score": score, "smoothed_score": smoothed}