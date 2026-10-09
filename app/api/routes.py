from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session as DbSession

from app.cache import redis_client
from app.crud import (
    user as user_crud,
    telemetry as telemetry_crud,
    generated_ui as generated_ui_crud,
    session as session_crud,
)
from app.db.database import get_db
from app.schemas.generated_ui import (
    GenerateUIRequest,
    GenerateUIResponse,
    GeneratedUICreate,
    GeneratedUIRead,
)
from app.schemas.session import SessionCreate, SessionRead, SessionUpdate
from app.schemas.telemetry import TelemetryCreate, TelemetryRead
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.generate_ui import generate_and_persist
from app.websocket.socketio_server import sio

router = APIRouter()


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=150)
    password: str = Field(..., min_length=1, max_length=255)


class TempTelemetryRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=100)
    payload: dict
    ttl_seconds: int = Field(default=300, ge=1, le=86_400)


class AICacheRequest(BaseModel):
    prompt_hash: str = Field(..., min_length=1, max_length=128)
    response: str = Field(..., min_length=1, max_length=200_000)
    ttl_seconds: int = Field(default=3600, ge=1, le=86_400)


@router.post("/login")
def login_user(credentials: LoginRequest, db: DbSession = Depends(get_db)):
    matched = user_crud.get_user_by_email(db, credentials.email.strip())
    if not matched or matched.password != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Login successful", "user": UserRead.model_validate(matched)}


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: DbSession = Depends(get_db)):
    existing = user_crud.get_user_by_email(db, str(user_in.email))
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    return user_crud.create_user(db, user_in)


@router.get("/users", response_model=list[UserRead])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: DbSession = Depends(get_db),
):
    return user_crud.get_users(db, skip=skip, limit=limit)


@router.get("/users/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: DbSession = Depends(get_db)):
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserRead)
def update_user(user_id: int, user_in: UserUpdate, db: DbSession = Depends(get_db)):
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_crud.update_user(db, user, user_in)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: DbSession = Depends(get_db)):
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_crud.delete_user(db, user)
    return None


@router.post("/sessions", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def create_session(session_in: SessionCreate, db: DbSession = Depends(get_db)):
    user = user_crud.get_user(db, session_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return session_crud.create_session(db, session_in)


@router.get("/sessions", response_model=list[SessionRead])
def list_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: DbSession = Depends(get_db),
):
    return session_crud.get_sessions(db, skip=skip, limit=limit)


@router.get("/sessions/{session_id}", response_model=SessionRead)
def get_session(session_id: int, db: DbSession = Depends(get_db)):
    session = session_crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.put("/sessions/{session_id}", response_model=SessionRead)
def update_session(session_id: int, session_in: SessionUpdate, db: DbSession = Depends(get_db)):
    session = session_crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_crud.update_session(db, session, session_in)


@router.post("/sessions/{session_id}/end", response_model=SessionRead)
def end_session(session_id: int, db: DbSession = Depends(get_db)):
    session = session_crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_crud.end_session(db, session)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: int, db: DbSession = Depends(get_db)):
    session = session_crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session_crud.delete_session(db, session)
    return None


@router.post("/telemetry", response_model=TelemetryRead, status_code=status.HTTP_201_CREATED)
def create_telemetry(telemetry_in: TelemetryCreate, db: DbSession = Depends(get_db)):
    if telemetry_in.session_id is not None:
        session = session_crud.get_session(db, telemetry_in.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    return telemetry_crud.create_telemetry(db, telemetry_in)


@router.get("/telemetry", response_model=list[TelemetryRead])
def list_telemetry(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    session_id: int | None = Query(default=None, ge=1),
    db: DbSession = Depends(get_db),
):
    return telemetry_crud.get_telemetry(db, skip=skip, limit=limit, session_id=session_id)


@router.get("/telemetry/{telemetry_id}", response_model=TelemetryRead)
def get_telemetry(telemetry_id: int, db: DbSession = Depends(get_db)):
    telemetry = telemetry_crud.get_telemetry_by_id(db, telemetry_id)
    if not telemetry:
        raise HTTPException(status_code=404, detail="Telemetry not found")
    return telemetry


@router.delete("/telemetry/{telemetry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_telemetry(telemetry_id: int, db: DbSession = Depends(get_db)):
    telemetry = telemetry_crud.get_telemetry_by_id(db, telemetry_id)
    if not telemetry:
        raise HTTPException(status_code=404, detail="Telemetry not found")
    telemetry_crud.delete_telemetry(db, telemetry)
    return None


@router.post(
    "/generate-ui",
    response_model=GenerateUIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate UI from telemetry or prompt",
    responses={
        400: {"description": "Bad Request — invalid payload"},
        404: {"description": "User or session not found"},
        500: {"description": "Server Error"},
    },
)
async def generate_ui(body: GenerateUIRequest, db: DbSession = Depends(get_db)):
    """
    Generate a React component using telemetry and optional prompt/component_name.

    Flow: Redis cache check → external AI service → save PostgreSQL → emit Socket.IO events.
    """
    prompt = body.prompt.strip() if body.prompt else None
    component_name = body.component_name.strip() if body.component_name else None
    if not prompt and not component_name:
        raise HTTPException(
            status_code=400,
            detail="Either prompt or component_name is required for generation",
        )

    if body.user_id is not None and not user_crud.get_user(db, body.user_id):
        raise HTTPException(status_code=404, detail="User not found")
    if body.session_id is not None and not session_crud.get_session(db, body.session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    async def emit(event: str, data: dict):
        await sio.emit(event, data)

    result = await generate_and_persist(
        db,
        prompt=prompt,
        component_name=component_name,
        mouse_velocity=body.mouse_velocity,
        hesitation_time=body.hesitation_time,
        rage_clicks=body.rage_clicks,
        cognitive_score=body.cognitive_score,
        user_id=body.user_id,
        session_id=body.session_id,
        use_cache=body.use_cache,
        emit=emit,
    )
    return result


@router.post("/generated-ui", response_model=GeneratedUIRead, status_code=status.HTTP_201_CREATED)
def create_generated_ui(generated_ui_in: GeneratedUICreate, db: DbSession = Depends(get_db)):
    if generated_ui_in.user_id is not None and not user_crud.get_user(db, generated_ui_in.user_id):
        raise HTTPException(status_code=404, detail="User not found")
    if generated_ui_in.session_id is not None and not session_crud.get_session(db, generated_ui_in.session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    return generated_ui_crud.create_generated_ui(db, generated_ui_in)


@router.get(
    "/generated-ui/history",
    response_model=list[GeneratedUIRead],
    summary="AI generation history",
)
def list_generated_ui_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    user_id: int | None = Query(default=None, ge=1),
    db: DbSession = Depends(get_db),
):
    return generated_ui_crud.get_generated_ui_history(db, skip=skip, limit=limit, user_id=user_id)


@router.get("/generated-ui/{component_id}", response_model=GeneratedUIRead)
def get_generated_ui(component_id: int, db: DbSession = Depends(get_db)):
    component = generated_ui_crud.get_generated_ui(db, component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Generated UI not found")
    return component


@router.delete("/generated-ui/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_generated_ui(component_id: int, db: DbSession = Depends(get_db)):
    component = generated_ui_crud.get_generated_ui(db, component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Generated UI not found")
    generated_ui_crud.delete_generated_ui(db, component)
    return None


@router.post("/cache/telemetry")
def store_temp_telemetry(body: TempTelemetryRequest):
    ok = redis_client.store_temp_telemetry(body.session_id, body.payload, body.ttl_seconds)
    if not ok:
        raise HTTPException(status_code=503, detail="Redis unavailable")
    return {"success": True, "key": f"telemetry:temp:{body.session_id}"}


@router.get("/cache/telemetry/{session_id}")
def get_temp_telemetry(session_id: str):
    data = redis_client.get_temp_telemetry(session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Temp telemetry not found")
    return {"success": True, "data": data}


@router.delete("/cache/telemetry/{session_id}")
def delete_temp_telemetry(session_id: str):
    deleted = redis_client.delete_temp_telemetry(session_id)
    return {"success": True, "deleted": deleted}


@router.post("/cache/ai")
def store_ai_cache(body: AICacheRequest):
    ok = redis_client.cache_ai_response(body.prompt_hash, body.response, body.ttl_seconds)
    if not ok:
        raise HTTPException(status_code=503, detail="Redis unavailable")
    return {"success": True, "key": f"ai:response:{body.prompt_hash}"}


@router.get("/cache/ai/{prompt_hash}")
def get_ai_cache(prompt_hash: str):
    data = redis_client.get_cached_ai_response(prompt_hash)
    if data is None:
        raise HTTPException(status_code=404, detail="Cached AI response not found")
    return {"success": True, "data": data}


@router.delete("/cache/ai/{prompt_hash}")
def delete_ai_cache(prompt_hash: str):
    deleted = redis_client.delete_cached_ai_response(prompt_hash)
    return {"success": True, "deleted": deleted}
