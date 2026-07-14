from fastapi import FastAPI

from api.generate import router as generate_router

app = FastAPI(
    title="AuraGen AI Backend",
    version="1.0.0",
)


@app.get("/")
def home():
    return {"message": "AuraGen Backend Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(generate_router)