from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from api.generate import router as generate_router

app = FastAPI(
    title="AuraGen AI Backend",
    version="1.0.0",
)

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "AuraGen Backend Running",
        "docs": "/docs",
        "generate_ui": {
            "GET": "/generate-ui",
            "POST": "/generate-ui",
        },
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

app.include_router(generate_router)