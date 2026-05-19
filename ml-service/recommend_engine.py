# ml-service/recommend_engine.py
"""Content-based ranking with TF-IDF + rating boost + category signals."""

from __future__ import annotations

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def _place_text(p: dict) -> str:
    tags = p.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]
    parts = [
        str(p.get("city", "")),
        str(p.get("category", "")),
        str(p.get("name", "")),
        " ".join(tags),
        str(p.get("description", "")),
    ]
    return " ".join(parts).lower()


def recommend(
    places: list[dict],
    user_signals: dict | None,
    limit: int = 15,
) -> list[dict]:
    if not places:
        return []

    if len(places) < 2:
        ranked = sorted(places, key=lambda p: float(p.get("rating") or 0), reverse=True)[:limit]
        return [{"place": p, "score": float(p.get("rating") or 0) / 5.0} for p in ranked]

    user_signals = user_signals or {}
    cats = user_signals.get("preferred_categories") or []
    query_text = (user_signals.get("query_text") or "").strip()

    texts = [_place_text(p) for p in places]
    query_parts = []
    if query_text:
        query_parts.append(query_text)
    if cats:
        query_parts.extend(str(c) for c in cats)
    query = " ".join(query_parts).strip() or "travel sightseeing food culture"

    vectorizer = TfidfVectorizer(
        max_features=4096,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1,
    )
    matrix = vectorizer.fit_transform(texts + [query])
    sim = cosine_similarity(matrix[-1], matrix[:-1]).flatten()

    ratings = np.array([float(p.get("rating") or 0) for p in places])
    rating_norm = np.clip(ratings / 5.0, 0, 1)

    cat_boost = np.zeros(len(places))
    for i, p in enumerate(places):
        pc = str(p.get("category", "")).lower()
        for c in cats:
            if c and str(c).lower() in pc:
                cat_boost[i] += 0.12

    combined = sim + 0.08 * rating_norm + cat_boost
    order = np.argsort(combined)[::-1][:limit]

    out = []
    for idx in order:
        out.append({"place": places[int(idx)], "score": float(round(combined[int(idx)], 4))})
    return out
