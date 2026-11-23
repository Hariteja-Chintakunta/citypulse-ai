"""CityPulse AI — FastAPI entrypoint.

Run:  uvicorn main:app --reload
Docs: http://localhost:8000/docs  (OpenAPI / Swagger)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    routes_admin, routes_ai, routes_analytics, routes_auth,
    routes_complaints, routes_leaderboard, routes_map, routes_notifications,
)
from app.core import config
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CityPulse AI API",
    description=(
        "Hyderabad civic intelligence platform — citizen reporting, "
        "AI-assisted classification, duplicate detection, transparent "
        "complaint tracking. CityFix Buildathon (Tutedude)."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_auth.router, prefix="/api/v1")
app.include_router(routes_complaints.router, prefix="/api/v1")
app.include_router(routes_ai.router, prefix="/api/v1")
app.include_router(routes_admin.router, prefix="/api/v1")
app.include_router(routes_map.router, prefix="/api/v1")
app.include_router(routes_analytics.router, prefix="/api/v1")
app.include_router(routes_notifications.router, prefix="/api/v1")
app.include_router(routes_leaderboard.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "service": "citypulse-ai", "version": "1.0.0"}


@app.get("/")
def root():
    return {
        "service": "CityPulse AI API",
        "docs": "/docs",
        "api": "/api/v1",
        "note": "Demo data is clearly labelled; no government affiliation is claimed.",
    }
