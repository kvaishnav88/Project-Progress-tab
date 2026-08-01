"""
Week-2 end-to-end integration tests for AuraGen backend.

Covers:
  - AI generate → PostgreSQL save
  - Generation history
  - Redis AI cache hit on repeated prompt
  - Socket.IO telemetry → Redis + PostgreSQL
  - Socket.IO generate_ui progress events

Run with the API server already started:
  python scripts/test_week2.py
"""

from __future__ import annotations

import json
import sys
import time
import uuid

import requests

try:
    import socketio
except ImportError:
    print("Install python-socketio first: pip install python-socketio")
    sys.exit(1)

BASE = "http://127.0.0.1:8000"


def ok(label: str, condition: bool, detail: str = "") -> None:
    status = "PASS" if condition else "FAIL"
    suffix = f" — {detail}" if detail else ""
    print(f"[{status}] {label}{suffix}")
    if not condition:
        raise SystemExit(1)


def main() -> None:
    print("=== AuraGen Week-2 End-to-End Tests ===\n")

    health = requests.get(f"{BASE}/health", timeout=10).json()
    ok("Health endpoint", health.get("status") in ("ok", "degraded"), json.dumps(health))
    ok("PostgreSQL ready", health.get("database") == "ready")
    ok("Redis ready", health.get("redis") == "ready")
    ok("Socket.IO ready", health.get("socketio") == "ready")

    email = f"week2_{uuid.uuid4().hex[:8]}@example.com"
    user = requests.post(
        f"{BASE}/api/users",
        json={"name": "Week2 Tester", "email": email, "password": "secret123"},
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

    # --- Step 1 & 2: Generate UI + history ---
    prompts = [
        "Create Login Page",
        "Generate Dashboard",
        "Generate Profile Page",
    ]
    component_ids: list[int] = []

    for prompt in prompts:
        resp = requests.post(
            f"{BASE}/api/generate-ui",
            json={
                "prompt": prompt,
                "user_id": user_id,
                "session_id": session_id,
                "use_cache": True,
            },
            timeout=30,
        )
        ok(f"Generate UI: {prompt}", resp.status_code == 201, resp.text)
        body = resp.json()
        ok(f"  status success ({prompt})", body.get("status") == "success")
        ok(f"  has component code ({prompt})", bool(body.get("component")))
        ok(f"  first gen not cached ({prompt})", body.get("cached") is False)
        component_ids.append(body["id"])

    history = requests.get(
        f"{BASE}/api/generated-ui/history",
        params={"user_id": user_id, "limit": 50},
        timeout=10,
    )
    ok("History endpoint", history.status_code == 200, history.text)
    items = history.json()
    ok("History has 3+ entries", len(items) >= 3, f"count={len(items)}")
    names = {i["component_name"] for i in items}
    ok(
        "History includes Login/Dashboard/Profile",
        {"LoginPage", "DashboardPage", "ProfilePage"}.issubset(names),
        str(names),
    )

    # --- Step 5: Redis cache hit ---
    t0 = time.perf_counter()
    cached = requests.post(
        f"{BASE}/api/generate-ui",
        json={
            "prompt": "Create Login Page",
            "user_id": user_id,
            "session_id": session_id,
            "use_cache": True,
        },
        timeout=30,
    )
    elapsed_ms = (time.perf_counter() - t0) * 1000
    ok("Repeated Login generate", cached.status_code == 201, cached.text)
    ok("Redis cache hit", cached.json().get("cached") is True, cached.text)
    ok("Cache response reasonably fast", elapsed_ms < 2000, f"{elapsed_ms:.1f}ms")

    # Verify cache key exists via Redis API
    prompt_hash = cached.json()["prompt_hash"]
    cache_get = requests.get(f"{BASE}/api/cache/ai/{prompt_hash}", timeout=10)
    ok("AI cache readable via API", cache_get.status_code == 200, cache_get.text)

    # --- Step 3: HTTP telemetry ---
    telemetry = requests.post(
        f"{BASE}/api/telemetry",
        json={
            "session_id": session_id,
            "mouse_x": 340,
            "mouse_y": 260,
            "clicks": 4,
            "scroll_speed": 12.5,
            "hesitation_time": 0.8,
            "cognitive_score": 0.78,
        },
        timeout=10,
    )
    ok("HTTP telemetry saved", telemetry.status_code == 201, telemetry.text)

    # --- Step 3 & 4: Socket.IO telemetry + generate_ui ---
    client = socketio.Client(reconnection=False)
    events: dict = {}

    @client.on("connect_ack")
    def on_ack(data):
        events["connect_ack"] = data

    @client.on("telemetry_received")
    def on_tel(data):
        events["telemetry_received"] = data

    @client.on("cognitive_score")
    def on_score(data):
        events["cognitive_score"] = data

    @client.on("ai_started")
    def on_started(data):
        events["ai_started"] = data
        events.setdefault("progress", []).append(data.get("progress"))

    @client.on("ai_processing")
    def on_processing(data):
        events.setdefault("ai_processing", []).append(data)
        events.setdefault("progress", []).append(data.get("progress"))

    @client.on("ai_completed")
    def on_completed(data):
        events["ai_completed"] = data
        events.setdefault("progress", []).append(data.get("progress"))

    @client.on("component_saved")
    def on_saved(data):
        events["component_saved"] = data

    @client.on("history_updated")
    def on_hist(data):
        events["history_updated"] = data

    @client.on("error")
    def on_error(data):
        events["error"] = data

    print("\nConnecting Socket.IO...")
    client.connect(BASE, socketio_path="socket.io", wait_timeout=5)
    ok("Socket connected", client.connected)
    client.sleep(0.5)
    ok("connect_ack received", "connect_ack" in events, str(events.get("connect_ack")))

    client.emit(
        "telemetry",
        {
            "session_id": session_id,
            "mouse_x": 340,
            "mouse_y": 260,
            "clicks": 4,
            "scroll_speed": 12.5,
            "hesitation_time": 0.8,
        },
    )
    client.sleep(1.0)
    ok("telemetry_received", "telemetry_received" in events, str(events.get("telemetry_received")))
    ok(
        "telemetry persisted to PostgreSQL",
        events.get("telemetry_received", {}).get("persisted") is True,
        str(events.get("telemetry_received")),
    )
    ok("cognitive_score emitted", "cognitive_score" in events, str(events.get("cognitive_score")))

    # Temp Redis telemetry
    temp = requests.get(f"{BASE}/api/cache/telemetry/{session_id}", timeout=10)
    ok("Telemetry also in Redis", temp.status_code == 200, temp.text)

    client.emit(
        "generate_ui",
        {
            "prompt": "Create Signup Page",
            "user_id": user_id,
            "session_id": session_id,
            "use_cache": True,
        },
    )
    client.sleep(2.0)
    ok("ai_started", "ai_started" in events, str(events.get("ai_started")))
    ok("ai_processing", bool(events.get("ai_processing")), str(events.get("ai_processing")))
    ok("ai_completed", "ai_completed" in events, str(events.get("ai_completed")))
    ok("component_saved", "component_saved" in events, str(events.get("component_saved")))
    ok("history_updated", "history_updated" in events, str(events.get("history_updated")))
    ok(
        "progress reached 100",
        100 in (events.get("progress") or []),
        str(events.get("progress")),
    )
    ok("no socket error", "error" not in events, str(events.get("error")))

    client.disconnect()

    # Validation / security smoke
    bad = requests.post(
        f"{BASE}/api/generate-ui",
        json={"prompt": ""},
        timeout=10,
    )
    ok("Reject empty prompt", bad.status_code in (400, 422), bad.text)

    missing = requests.post(
        f"{BASE}/api/generate-ui",
        json={"prompt": "Create Login Page", "user_id": 999_999_999},
        timeout=10,
    )
    ok("Reject unknown user", missing.status_code == 404, missing.text)

    print("\nWeek-2 end-to-end tests passed.")


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:
        print(f"[FAIL] Week-2 test error: {exc}")
        sys.exit(1)
