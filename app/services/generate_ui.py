"""
Orchestrate UI generation: Redis cache → AI → PostgreSQL → Socket.IO events.
"""

from __future__ import annotations

import asyncio
from typing import Any, Awaitable, Callable, Optional

from sqlalchemy.orm import Session

from app.cache import redis_client
from app.crud import generated_ui as generated_ui_crud
from app.schemas.generated_ui import GeneratedUICreate
from app.services.ai_generator import (
    call_external_ai,
    deserialize_cached_payload,
    normalize_component_name,
    payload_hash,
    serialize_cached_payload,
)

ProgressCallback = Callable[[str, dict[str, Any]], Awaitable[None] | None]

AI_CACHE_TTL = 3600


async def _emit(
    callback: Optional[ProgressCallback],
    event: str,
    data: dict[str, Any],
) -> None:
    if callback is None:
        return
    result = callback(event, data)
    if asyncio.iscoroutine(result):
        await result


def _build_history_item(component) -> dict[str, Any]:
    return {
        "id": component.id,
        "user_id": component.user_id,
        "session_id": getattr(component, "session_id", None),
        "component_name": component.component_name,
        "prompt": component.prompt,
        "created_at": component.created_at.isoformat() if component.created_at else None,
    }


async def generate_and_persist(
    db: Session,
    prompt: str | None = None,
    component_name: str | None = None,
    mouse_velocity: float | None = None,
    hesitation_time: float | None = None,
    rage_clicks: int | None = None,
    cognitive_score: float | None = None,
    user_id: int | None = None,
    session_id: int | None = None,
    sid: str | None = None,
    use_cache: bool = True,
    emit: Optional[ProgressCallback] = None,
) -> dict[str, Any]:
    """
    Full generate pipeline with optional Socket.IO progress emissions.
    """
    component_name = (
        component_name.strip() if isinstance(component_name, str) and component_name.strip() else None
    )
    prompt_text = prompt.strip() if isinstance(prompt, str) and prompt.strip() else None

    request_payload: dict[str, Any] = {
        "component_name": component_name or prompt_text or "Payment Form",
        "mouse_velocity": float(mouse_velocity or 0.0),
        "hesitation_time": float(hesitation_time or 0.0),
        "rage_clicks": int(rage_clicks or 0),
    }
    if cognitive_score is not None:
        request_payload["cognitive_score"] = float(cognitive_score)

    cache_hash = payload_hash(request_payload, user_id)

    await _emit(
        emit,
        "ai_started",
        {
            "prompt": prompt_text,
            "component_name": request_payload["component_name"],
            "user_id": user_id,
            "session_id": session_id,
            "progress": 0,
        },
    )

    cached_raw = redis_client.get_cached_ai_response(cache_hash) if use_cache else None
    cached_payload = deserialize_cached_payload(cached_raw) if cached_raw else None
    from_cache = cached_payload is not None

    if from_cache:
        await _emit(
            emit,
            "ai_processing",
            {"progress": 50, "message": "Serving from Redis cache", "cached": True},
        )
        generated = cached_payload
        await _emit(
            emit,
            "ai_processing",
            {"progress": 80, "message": "Cache hit", "cached": True},
        )
    else:
        await _emit(
            emit,
            "ai_processing",
            {"progress": 20, "message": "AI generation started", "cached": False},
        )
        await asyncio.sleep(0.05)
        await _emit(
            emit,
            "ai_processing",
            {"progress": 50, "message": "Sending request to external AI service", "cached": False},
        )
        generated = await call_external_ai(request_payload)
        await _emit(
            emit,
            "ai_processing",
            {"progress": 80, "message": "AI service returned component", "cached": False},
        )
        redis_client.cache_ai_response(
            cache_hash,
            serialize_cached_payload(generated),
            ttl_seconds=AI_CACHE_TTL,
        )

    component_name_value = normalize_component_name(
        generated.get("component_name"), request_payload["component_name"]
    )

    ui_in = GeneratedUICreate(
        user_id=user_id,
        session_id=session_id,
        component_name=component_name_value,
        prompt=prompt_text or request_payload["component_name"],
        generated_code=generated["component"],
    )
    saved = generated_ui_crud.create_generated_ui(db, ui_in)

    result = {
        "status": "success",
        "cached": from_cache,
        "prompt_hash": cache_hash,
        "id": saved.id,
        "user_id": saved.user_id,
        "session_id": saved.session_id,
        "component_name": saved.component_name,
        "prompt": saved.prompt,
        "component": saved.generated_code,
        "generated_code": saved.generated_code,
        "strategy": generated.get("strategy", ""),
        "is_valid": generated.get("is_valid", False),
        "generation_time": generated.get("generation_time", 0.0),
        "created_at": saved.created_at.isoformat() if saved.created_at else None,
    }

    await _emit(
        emit,
        "ai_completed",
        {
            "progress": 100,
            "status": "success",
            "cached": from_cache,
            "component_name": saved.component_name,
            "id": saved.id,
            "component": saved.generated_code,
            "strategy": result["strategy"],
            "is_valid": result["is_valid"],
            "generation_time": result["generation_time"],
        },
    )
    await _emit(
        emit,
        "component_saved",
        {
            "id": saved.id,
            "component_name": saved.component_name,
            "user_id": saved.user_id,
            "session_id": saved.session_id,
        },
    )

    history = generated_ui_crud.get_generated_ui_history(
        db, skip=0, limit=20, user_id=user_id
    )
    await _emit(
        emit,
        "history_updated",
        {
            "items": [_build_history_item(item) for item in history],
            "user_id": user_id,
        },
    )

    return result
