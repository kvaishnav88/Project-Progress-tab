"""
Socket.IO smoke test for AuraGen.
Requires the API server to be running.
"""

from __future__ import annotations

import sys

try:
    import socketio
except ImportError:
    print("Install python-socketio first: pip install python-socketio")
    sys.exit(1)

URL = "http://127.0.0.1:8000"


def main() -> None:
    client = socketio.Client(reconnection=False)
    events: dict = {}

    @client.on("connect_ack")
    def on_ack(data):
        events["connect_ack"] = data

    @client.on("pong_server")
    def on_pong(data):
        events["pong_server"] = data

    @client.on("cognitive_score")
    def on_score(data):
        events["cognitive_score"] = data

    print("Connecting to Socket.IO...")
    client.connect(URL, socketio_path="socket.io", wait_timeout=5)
    print("[PASS] Client connected" if client.connected else "[FAIL] Client not connected")
    if not client.connected:
        sys.exit(1)

    client.sleep(0.5)
    if "connect_ack" not in events:
        print("[FAIL] Did not receive connect_ack")
        client.disconnect()
        sys.exit(1)
    print(f"[PASS] Server sent connect_ack: {events['connect_ack']}")

    client.emit("ping_server", {"hello": "auragen"})
    client.sleep(0.5)
    if "pong_server" not in events:
        print("[FAIL] Did not receive pong_server")
        client.disconnect()
        sys.exit(1)
    print(f"[PASS] Server replied to ping: {events['pong_server']}")

    client.emit(
        "telemetry",
        {
            "session_id": "socket-test-1",
            "mouse_x": 10,
            "mouse_y": 20,
            "clicks": 2,
            "hesitation_time": 0.5,
            "cognitive_score": 0.8,
        },
    )
    client.sleep(0.5)
    if "cognitive_score" not in events:
        print("[FAIL] Did not receive cognitive_score")
        client.disconnect()
        sys.exit(1)
    print(f"[PASS] Client received cognitive_score: {events['cognitive_score']}")

    client.disconnect()
    print("\nSocket.IO communication test passed.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"[FAIL] Socket.IO test error: {exc}")
        sys.exit(1)
