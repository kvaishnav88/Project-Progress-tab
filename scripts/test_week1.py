"""
Week-1 integration smoke tests for AuraGen backend.
Run with the API server already started:
  python scripts/test_week1.py
"""

from __future__ import annotations

import json
import sys
import time
import uuid

import requests

BASE = "http://127.0.0.1:8000"


def ok(label: str, condition: bool, detail: str = "") -> None:
    status = "PASS" if condition else "FAIL"
    suffix = f" — {detail}" if detail else ""
    print(f"[{status}] {label}{suffix}")
    if not condition:
        raise SystemExit(1)


def main() -> None:
    print("=== AuraGen Week-1 Integration Tests ===\n")

    health = requests.get(f"{BASE}/health", timeout=10).json()
    ok("Health endpoint", health.get("status") in ("ok", "degraded"), json.dumps(health))
    ok("PostgreSQL ready", health.get("database") == "ready")
    ok("Redis ready", health.get("redis") == "ready")
    ok("Socket.IO ready", health.get("socketio") == "ready")

    cache = requests.get(f"{BASE}/cache", timeout=10).json()
    ok("Redis set/get/delete", cache.get("success") is True, json.dumps(cache))

    email = f"week1_{uuid.uuid4().hex[:8]}@example.com"
    user = requests.post(
        f"{BASE}/api/users",
        json={"name": "Week1 Tester", "email": email, "password": "secret123"},
        timeout=10,
    )
    ok("Create user", user.status_code == 201, user.text)
    user_id = user.json()["id"]

    session = requests.post(
        f"{BASE}/api/sessions",
        json={"user_id": user_id, "device": "desktop", "browser": "chrome"},
        timeout=10,
    )
    ok("Create session", session.status_code == 201, session.text)
    session_id = session.json()["id"]

    telemetry = requests.post(
        f"{BASE}/api/telemetry",
        json={
            "session_id": session_id,
            "mouse_x": 120.5,
            "mouse_y": 80.0,
            "clicks": 3,
            "hesitation_time": 1.2,
            "cognitive_score": 0.74,
        },
        timeout=10,
    )
    ok("Save telemetry", telemetry.status_code == 201, telemetry.text)
    telemetry_id = telemetry.json()["id"]

    listed = requests.get(f"{BASE}/api/telemetry", timeout=10)
    ok("Get telemetry", listed.status_code == 200 and any(t["id"] == telemetry_id for t in listed.json()))

    ui = requests.post(
        f"{BASE}/api/generated-ui",
        json={
            "user_id": user_id,
            "component_name": "HeroButton",
            "prompt": "Create a primary CTA button",
            "generated_code": "<button class='cta'>Get Started</button>",
        },
        timeout=10,
    )
    ok("Save generated UI", ui.status_code == 201, ui.text)
    ui_id = ui.json()["id"]

    history = requests.get(f"{BASE}/api/generated-ui/history", timeout=10)
    ok("Fetch generated UI history", history.status_code == 200 and any(c["id"] == ui_id for c in history.json()))

    updated = requests.put(
        f"{BASE}/api/users/{user_id}",
        json={"name": "Week1 Updated"},
        timeout=10,
    )
    ok("Update user", updated.status_code == 200 and updated.json()["name"] == "Week1 Updated")

    temp_key = f"sess-{uuid.uuid4().hex[:6]}"
    temp = requests.post(
        f"{BASE}/api/cache/telemetry",
        json={"session_id": temp_key, "payload": {"clicks": 5}, "ttl_seconds": 60},
        timeout=10,
    )
    ok("Store temp telemetry in Redis", temp.status_code == 200, temp.text)
    fetched = requests.get(f"{BASE}/api/cache/telemetry/{temp_key}", timeout=10)
    ok("Retrieve temp telemetry from Redis", fetched.status_code == 200 and fetched.json()["data"]["clicks"] == 5)
    deleted = requests.delete(f"{BASE}/api/cache/telemetry/{temp_key}", timeout=10)
    ok("Delete temp telemetry from Redis", deleted.status_code == 200 and deleted.json()["deleted"] == 1)

    prompt_hash = uuid.uuid4().hex
    ai = requests.post(
        f"{BASE}/api/cache/ai",
        json={"prompt_hash": prompt_hash, "response": "cached-ai-output", "ttl_seconds": 60},
        timeout=10,
    )
    ok("Cache AI response", ai.status_code == 200)
    ai_get = requests.get(f"{BASE}/api/cache/ai/{prompt_hash}", timeout=10)
    ok("Retrieve AI cache", ai_get.status_code == 200 and ai_get.json()["data"] == "cached-ai-output")
    ai_del = requests.delete(f"{BASE}/api/cache/ai/{prompt_hash}", timeout=10)
    ok("Delete AI cache", ai_del.status_code == 200)

    # Cleanup delete path
    del_ui = requests.delete(f"{BASE}/api/generated-ui/{ui_id}", timeout=10)
    ok("Delete generated UI", del_ui.status_code == 204)
    del_tel = requests.delete(f"{BASE}/api/telemetry/{telemetry_id}", timeout=10)
    ok("Delete telemetry", del_tel.status_code == 204)
    end_sess = requests.post(f"{BASE}/api/sessions/{session_id}/end", timeout=10)
    ok("End session", end_sess.status_code == 200 and end_sess.json().get("logout_time") is not None)
    del_sess = requests.delete(f"{BASE}/api/sessions/{session_id}", timeout=10)
    ok("Delete session", del_sess.status_code == 204)
    del_user = requests.delete(f"{BASE}/api/users/{user_id}", timeout=10)
    ok("Delete user", del_user.status_code == 204)

    print("\nAll HTTP/DB/Redis checks passed.")
    print("Run Socket.IO test separately: python scripts/test_socketio.py")


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("FAIL: Could not connect to http://127.0.0.1:8000 — start the server first.")
        sys.exit(1)
