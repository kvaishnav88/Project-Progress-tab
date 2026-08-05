##Socket.IO server for AuraGen's real-time friction detection.

##Listens for the exact events the frontend's telemetry-tracker.ts emits,
##maintains a rolling per-session signal history, computes a Cognitive Load
##Score using the same weighted approach as the project's Friction Engine,
##and emits a `friction` event back to the client whenever the score changes
##meaningfully.


from __future__ import annotations

import time
from collections import deque
from typing import Any

import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
)

WINDOW_SIZE = 8
_session_state: dict[str, dict[str, Any]] = {}


def _get_session(sid: str) -> dict[str, Any]:
    if sid not in _session_state:
        _session_state[sid] = {
            "velocity_history": deque(maxlen=WINDOW_SIZE),
            "acceleration_history": deque(maxlen=WINDOW_SIZE),
            "hesitation_history": deque(maxlen=WINDOW_SIZE),
            "click_count": 0,
            "rage_click_count": 0,
            "scroll_jitter_count": 0,
            "last_field": "unknown",
            "score_history": deque(maxlen=WINDOW_SIZE),
        }
    return _session_state[sid]


def _decide_action(score: float) -> str:
    if score >= 75:
        return "trigger_wizard_regeneration"
    if score >= 50:
        return "simplify_field"
    if score >= 30:
        return "show_inline_hint"
    return "no_action"


def _compute_score(state: dict[str, Any]) -> float:
    velocities = state["velocity_history"]
    accelerations = state["acceleration_history"]
    hesitations = state["hesitation_history"]

    avg_velocity = sum(velocities) / len(velocities) if velocities else 0.0
    avg_acceleration = sum(accelerations) / len(accelerations) if accelerations else 0.0
    avg_hesitation = sum(hesitations) / len(hesitations) if hesitations else 0.0

    raw_score = (
        0.20 * min(avg_velocity / 650, 1.0) * 100
        + 0.15 * min(avg_acceleration / 480, 1.0) * 100
        + 0.20 * min(avg_hesitation / 2800, 1.0) * 100
        + 0.15 * min(state["rage_click_count"] / 3, 1.0) * 100
        + 0.10 * min(state["click_count"] / 10, 1.0) * 100
        + 0.10 * min(state["scroll_jitter_count"] / 5, 1.0) * 100
        + 0.10 * min(len(hesitations) / WINDOW_SIZE, 1.0) * 100
    )
    return round(max(0.0, min(100.0, raw_score)), 2)


async def _emit_friction_update(sid: str) -> None:
    state = _get_session(sid)
    score = _compute_score(state)
    state["score_history"].append(score)
    smoothed = round(sum(state["score_history"]) / len(state["score_history"]), 2)

    await sio.emit(
        "friction",
        {"score": smoothed, "field": state["last_field"], "action": _decide_action(smoothed)},
        to=sid,
    )


@sio.event
async def connect(sid, environ, auth):
    _get_session(sid)
    return True


@sio.event
async def disconnect(sid):
    _session_state.pop(sid, None)


@sio.on("telemetry:mouse")
async def handle_mouse(sid, data):
    state = _get_session(sid)
    state["velocity_history"].append(float(data.get("velocity", 0)))
    state["acceleration_history"].append(float(data.get("acceleration", 0)))
    await _emit_friction_update(sid)


@sio.on("telemetry:click")
async def handle_click(sid, data):
    state = _get_session(sid)
    state["click_count"] = min(state["click_count"] + 1, 999)
    state["last_field"] = data.get("field", state["last_field"])
    await _emit_friction_update(sid)


@sio.on("telemetry:rage_click")
async def handle_rage_click(sid, data):
    state = _get_session(sid)
    state["rage_click_count"] += 1
    state["last_field"] = data.get("field", state["last_field"])
    await sio.emit("rage_click", {"field": state["last_field"], "count": data.get("count", 0)}, to=sid)
    await _emit_friction_update(sid)


@sio.on("telemetry:hesitation")
async def handle_hesitation(sid, data):
    state = _get_session(sid)
    duration_ms = float(data.get("duration_ms", 0))
    state["hesitation_history"].append(duration_ms)
    state["last_field"] = data.get("field", state["last_field"])
    await sio.emit("hesitation", {"field": state["last_field"], "duration_ms": duration_ms}, to=sid)
    await _emit_friction_update(sid)


@sio.on("telemetry:scroll_jitter")
async def handle_scroll_jitter(sid, data):
    state = _get_session(sid)
    state["scroll_jitter_count"] += 1
    await _emit_friction_update(sid)