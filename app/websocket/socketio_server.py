"""
Socket.IO real-time server for AuraGen.

Events (client → server):
  - connect / disconnect
  - ping_server
  - telemetry          → save Redis + PostgreSQL, emit cognitive_score
  - generate_ui        → AI pipeline with progress events

Events (server → client):
  - connect_ack
  - pong_server
  - telemetry_received
  - cognitive_score
  - ai_started
  - ai_processing      (progress: 20 / 50 / 80)
  - ai_completed
  - component_saved
  - history_updated
  - error
"""

from __future__ import annotations

import asyncio
from typing import Any

import socketio

from app.cache.redis_client import store_temp_telemetry
from app.crud import session as session_crud
from app.crud import telemetry as telemetry_crud
from app.crud import user as user_crud
from app.db.database import SessionLocal
from app.schemas.telemetry import TelemetryCreate

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


def _to_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _compute_cognitive_score(payload: dict[str, Any]) -> float:
    """Lightweight cognitive-load estimate from interaction signals."""
    mouse_x = _to_float(payload.get("mouse_x")) or 0.0
    mouse_y = _to_float(payload.get("mouse_y")) or 0.0
    clicks = _to_float(payload.get("clicks")) or 0.0
    hesitation = _to_float(payload.get("hesitation_time")) or 0.0
    scroll = _to_float(payload.get("scroll_speed")) or 0.0
    explicit = _to_float(payload.get("cognitive_score"))

    if explicit is not None:
        return max(0.0, min(1.0, round(explicit, 2)))

    # Normalize rough signals into 0–1 range for Week-2 demo scoring
    movement = min(1.0, (abs(mouse_x) + abs(mouse_y)) / 2000.0)
    click_factor = min(1.0, clicks / 20.0)
    hesitation_factor = min(1.0, hesitation / 5.0)
    scroll_factor = min(1.0, scroll / 100.0)
    score = (movement * 0.2) + (click_factor * 0.3) + (hesitation_factor * 0.3) + (scroll_factor * 0.2)
    return round(score, 2)


@sio.event
async def connect(sid, environ, auth):
    await sio.emit(
        "connect_ack",
        {"status": "connected", "sid": sid, "message": "Client Connected"},
        to=sid,
    )
    return True


@sio.event
async def ping_server(sid, data=None):
    await sio.emit("pong_server", {"message": "pong", "echo": data}, to=sid)


@sio.event
async def telemetry(sid, data):
    payload = data if isinstance(data, dict) else {}
    score = _compute_cognitive_score(payload)

    session_raw = payload.get("session_id")
    session_id_int = _to_int(session_raw)
    redis_key = str(session_raw if session_raw is not None else sid)

    enriched = {
        **payload,
        "cognitive_score": score,
        "mouse_x": _to_float(payload.get("mouse_x")),
        "mouse_y": _to_float(payload.get("mouse_y")),
        "clicks": _to_int(payload.get("clicks")),
        "scroll_speed": _to_float(payload.get("scroll_speed")),
        "hesitation_time": _to_float(payload.get("hesitation_time")),
    }

    # Non-blocking Redis write
    await asyncio.to_thread(store_temp_telemetry, redis_key, enriched, 300)

    saved_id = None
    # Persist to PostgreSQL when session_id is a valid FK
    if session_id_int is not None:
        def _save_pg():
            db = SessionLocal()
            try:
                if not session_crud.get_session(db, session_id_int):
                    return None
                row = telemetry_crud.create_telemetry(
                    db,
                    TelemetryCreate(
                        session_id=session_id_int,
                        mouse_x=enriched["mouse_x"],
                        mouse_y=enriched["mouse_y"],
                        clicks=enriched["clicks"],
                        scroll_speed=enriched["scroll_speed"],
                        hesitation_time=enriched["hesitation_time"],
                        cognitive_score=score,
                    ),
                )
                return row.id
            finally:
                db.close()

        saved_id = await asyncio.to_thread(_save_pg)

    await sio.emit(
        "telemetry_received",
        {
            "status": "ok",
            "session_id": session_id_int if session_id_int is not None else redis_key,
            "saved_id": saved_id,
            "persisted": saved_id is not None,
            "score": score,
        },
        to=sid,
    )
    await sio.emit(
        "cognitive_score",
        {
            "score": score,
            "session_id": session_id_int if session_id_int is not None else redis_key,
            "mouse_x": enriched["mouse_x"],
            "mouse_y": enriched["mouse_y"],
            "clicks": enriched["clicks"],
            "scroll_speed": enriched["scroll_speed"],
        },
        to=sid,
    )


@sio.event
async def generate_ui(sid, data):
    """
    Real-time UI generation with progress events.
    Client payload: { prompt, user_id?, session_id?, use_cache? }
    """
    payload = data if isinstance(data, dict) else {}
    prompt = str(payload.get("prompt") or "").strip()
    if not prompt:
        await sio.emit("error", {"event": "generate_ui", "detail": "prompt is required"}, to=sid)
        return

    user_id = _to_int(payload.get("user_id"))
    session_id = _to_int(payload.get("session_id"))
    use_cache = bool(payload.get("use_cache", True))

    from app.services.generate_ui import generate_and_persist

    db = SessionLocal()
    try:
        if user_id is not None and not user_crud.get_user(db, user_id):
            await sio.emit("error", {"event": "generate_ui", "detail": "User not found"}, to=sid)
            return
        if session_id is not None and not session_crud.get_session(db, session_id):
            await sio.emit("error", {"event": "generate_ui", "detail": "Session not found"}, to=sid)
            return

        async def emit(event: str, event_data: dict):
            await sio.emit(event, event_data, to=sid)

        await generate_and_persist(
            db,
            prompt=prompt,
            user_id=user_id,
            session_id=session_id,
            sid=sid,
            use_cache=use_cache,
            emit=emit,
        )
    except Exception as exc:
        await sio.emit("error", {"event": "generate_ui", "detail": str(exc)}, to=sid)
    finally:
        db.close()


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
