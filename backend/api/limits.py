import os
import threading
import time
from collections import defaultdict, deque
from datetime import date

from fastapi import HTTPException, Request

PER_MIN = int(os.getenv("GEN_PER_MIN", "6"))
DAILY = int(os.getenv("DAILY_GEN_BUDGET", "200"))

_lock = threading.Lock()
_hits = defaultdict(deque)
_day = {"d": date.today(), "n": 0}


def allowed_origins() -> list[str]:
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    extra = os.getenv("FRONTEND_URL", "")
    origins += [u.strip().rstrip("/") for u in extra.split(",") if u.strip()]
    return origins


def client_ip(request: Request) -> str:
    h = request.headers
    for name in ("true-client-ip", "cf-connecting-ip"):
        if h.get(name):
            return h[name].strip()
    fwd = h.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def generate_guard(request: Request):
    ip = client_ip(request)
    now = time.monotonic()
    with _lock:
        today = date.today()
        if _day["d"] != today:
            _day["d"], _day["n"] = today, 0
        if _day["n"] >= DAILY:
            raise HTTPException(status_code=429, detail="Daily demo limit reached. Please try again tomorrow.")
        if len(_hits) > 5000:
            for k in [k for k, v in _hits.items() if not v]:
                del _hits[k]
        dq = _hits[ip]
        while dq and now - dq[0] > 60:
            dq.popleft()
        if len(dq) >= PER_MIN:
            raise HTTPException(status_code=429, detail="Too many requests. Please wait a minute.")
        dq.append(now)
        _day["n"] += 1