import logging
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DbSession
from socketio import ASGIApp

from app.api.routes import router as api_router
from app.cache.redis_client import cache_delete, cache_get, cache_set, ping_redis
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.db.database import check_db_connection, init_db
from app.middleware.request_logging import RequestLoggingMiddleware
from app.websocket.socketio_server import sio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("auragen")

fastapi_app = FastAPI(
    title=settings.APP_NAME,
    version="0.2.0",
    description=(
        "AuraGen Week 2 backend: AI UI generation with PostgreSQL persistence, "
        "Redis response cache, and Socket.IO live progress/telemetry."
    ),
)

register_exception_handlers(fastapi_app)

fastapi_app.add_middleware(RequestLoggingMiddleware)
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@fastapi_app.on_event("startup")
def startup_event():
    db_ok = check_db_connection()
    if not db_ok:
        logger.error("PostgreSQL connection failed. Check DATABASE_URL and docker-compose.")
    else:
        init_db()
        logger.info("Connected to PostgreSQL")

    redis_ok = ping_redis()
    logger.info("Connected to Redis: %s", redis_ok)
    logger.info("Socket.IO server ready at /socket.io")


@fastapi_app.get("/")
def home():
    return {"message": "AuraGen Backend Running Successfully", "status": "ready"}


@fastapi_app.get("/health")
def health_check():
    db_ok = check_db_connection()
    redis_ok = ping_redis()
    status = "ok" if db_ok and redis_ok else "degraded"
    return {
        "status": status,
        "database": "ready" if db_ok else "unavailable",
        "redis": "ready" if redis_ok else "unavailable",
        "socketio": "ready",
    }


@fastapi_app.get("/cache")
def cache_test():
    key = "project"
    wrote = cache_set(key, "AuraGen", ttl_seconds=60)
    value = cache_get(key)
    deleted = cache_delete(key)
    return {
        "success": wrote and value == "AuraGen" and deleted == 1,
        "set": wrote,
        "get": value,
        "deleted": deleted,
    }


fastapi_app.include_router(api_router, prefix="/api", tags=["api"])

# Wrap FastAPI with Socket.IO so both HTTP and WS share one ASGI app
app = ASGIApp(sio, other_asgi_app=fastapi_app)
