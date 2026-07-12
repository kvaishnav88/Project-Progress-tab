from fastapi import FastAPI

app = FastAPI(
    title="AuraGen AI Backend",
    description="AI Backend for AuraGen Self-Healing UI",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "status": "success",
        "message": "AuraGen AI Backend Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }