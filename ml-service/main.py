# ml-service/main.py
"""FastAPI microservice: personalized place recommendations (scikit-learn)."""

from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from recommend_engine import recommend

load_dotenv()

app = FastAPI(title="TravelAI ML Service", version="1.0.0")

_origins = os.getenv("ML_CORS_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000").split(",")
_origins = [o.strip() for o in _origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserSignals(BaseModel):
    preferred_categories: list[str] = Field(default_factory=list)
    query_text: str = ""


class RecommendRequest(BaseModel):
    places: list[dict[str, Any]]
    user_signals: UserSignals = Field(default_factory=UserSignals)
    limit: int = 15


class RecommendResponse(BaseModel):
    recommendations: list[dict[str, Any]]
    count: int


@app.get("/")
def root():
    return {
        "service": "TravelAI ML",
        "docs": "/docs",
        "health": "/health",
        "recommend": "POST /recommend",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/recommend", response_model=RecommendResponse)
def recommend_endpoint(body: RecommendRequest):
    lim = max(1, min(body.limit, 50))
    recs = recommend(body.places, body.user_signals.model_dump(), lim)
    return RecommendResponse(recommendations=recs, count=len(recs))
