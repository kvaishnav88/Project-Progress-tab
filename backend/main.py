from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from socketio import ASGIApp
from api.generate import router as generate_router
from websocket.socketio_server import sio

fastapi_app = FastAPI(
    title="AuraGen AI Backend",
    version="1.0.0",
)

# Allow frontend to call backend
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@fastapi_app.get("/")
def home():
    return {"message": "AuraGen Backend Running"}


@fastapi_app.get("/health")
def health():
    return {"status": "healthy"}


fastapi_app.include_router(generate_router)

# Wrap FastAPI with Socket.IO so both HTTP and WebSocket traffic
# share a single ASGI app, served on the same port.
app = ASGIApp(sio, other_asgi_app=fastapi_app)