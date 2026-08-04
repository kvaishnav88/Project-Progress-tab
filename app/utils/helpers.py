from datetime import datetime, timezone


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def success_response(data=None, message: str = "ok"):
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return payload
