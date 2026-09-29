"""
ChurnGuard — FastAPI Backend
Main application entry point
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend environment variables
env_file = Path(__file__).resolve().parent / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import prediction, analytics, segmentation, performance
from database.database import init_db

# ── App setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ChurnGuard API",
    description="AI-Powered Customer Churn Prediction & Segmentation",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
import os
_env_origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [o.strip() for o in _env_origins.split(",") if o.strip()] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.onrender\.com)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    init_db()


# ── Health check & Root ───────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ok",
        "service": "ChurnGuard API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "ChurnGuard API",
        "version": "1.0.0",
    }


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(prediction.router,   prefix="/api/predict",        tags=["Prediction"])
app.include_router(analytics.router,    prefix="/api/analytics",       tags=["Analytics"])
app.include_router(segmentation.router, prefix="/api",                 tags=["Segmentation"])
app.include_router(performance.router,  prefix="/api",                 tags=["Model Performance"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
