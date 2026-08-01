from typing import Any, Optional

import json
import redis
from app.core.config import settings

# protocol=2 keeps compatibility with older Redis servers that lack RESP3 HELLO
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True, protocol=2)

TELEMETRY_PREFIX = "telemetry:temp:"
AI_CACHE_PREFIX = "ai:response:"


def ping_redis() -> bool:
    try:
        return bool(redis_client.ping())
    except (redis.exceptions.RedisError, ConnectionError, OSError):
        return False


def cache_set(key: str, value: str, ttl_seconds: Optional[int] = None) -> bool:
    try:
        if ttl_seconds is None:
            return bool(redis_client.set(key, value))
        return bool(redis_client.setex(key, ttl_seconds, value))
    except (redis.exceptions.RedisError, ConnectionError, OSError):
        return False


def cache_get(key: str) -> Optional[str]:
    try:
        return redis_client.get(key)
    except (redis.exceptions.RedisError, ConnectionError, OSError):
        return None


def cache_delete(key: str) -> int:
    try:
        return int(redis_client.delete(key))
    except (redis.exceptions.RedisError, ConnectionError, OSError):
        return 0


def store_temp_telemetry(session_id: str, payload: dict[str, Any], ttl_seconds: int = 300) -> bool:
    return cache_set(f"{TELEMETRY_PREFIX}{session_id}", json.dumps(payload), ttl_seconds)


def get_temp_telemetry(session_id: str) -> Optional[dict[str, Any]]:
    raw = cache_get(f"{TELEMETRY_PREFIX}{session_id}")
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def delete_temp_telemetry(session_id: str) -> int:
    return cache_delete(f"{TELEMETRY_PREFIX}{session_id}")


def cache_ai_response(prompt_hash: str, response: str, ttl_seconds: int = 3600) -> bool:
    return cache_set(f"{AI_CACHE_PREFIX}{prompt_hash}", response, ttl_seconds)


def get_cached_ai_response(prompt_hash: str) -> Optional[str]:
    return cache_get(f"{AI_CACHE_PREFIX}{prompt_hash}")


def delete_cached_ai_response(prompt_hash: str) -> int:
    return cache_delete(f"{AI_CACHE_PREFIX}{prompt_hash}")
