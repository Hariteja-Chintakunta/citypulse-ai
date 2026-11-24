"""Duplicate detection (Blueprint section 7).

Suggested MVP logic: same/related category, a configurable radius
(default 50 m), a configurable time window (default 14 days) and optional
description similarity. Returns a ranked list of possible matches.
A nearby issue is NOT automatically the same defect — the citizen or
reviewer chooses to support the existing ticket or file separately.
"""

import math
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app import models
from app.core import config

RELATED_CATEGORIES: dict[str, set[str]] = {
    # Same/related categories from the live demo prototype.
    "Pothole": {"Pothole", "Road Damage"},
    "Road Damage": {"Road Damage", "Pothole"},
    "Waterlogging": {"Waterlogging", "Drainage"},
    "Drainage": {"Drainage", "Waterlogging"},
    "Garbage": {"Garbage"},
    "Streetlight": {"Streetlight"},
    "Traffic": {"Traffic"},
    "Safety": {"Safety"},
    "Other": {"Other"},
}


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_m = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return 2 * radius_m * math.asin(math.sqrt(a))


def _description_similarity(a: str, b: str) -> float:
    words_a = set(a.lower().split())
    words_b = set(b.lower().split())
    if not words_a or not words_b:
        return 0.0
    return len(words_a & words_b) / len(words_a | words_b)


def find_possible_duplicates(
    db: Session,
    *,
    category: str,
    latitude: float,
    longitude: float,
    description: str,
    exclude_id: str | None = None,
    since: datetime | None = None,
) -> list[dict]:
    """Return ranked possible duplicates for a new report."""
    window_start = since or (
        datetime.utcnow() - timedelta(days=config.DUPLICATE_WINDOW_DAYS)
    )
    related = RELATED_CATEGORIES.get(category, {category})
    candidates = (
        db.query(models.Complaint)
        .filter(models.Complaint.category.in_(related))
        .filter(models.Complaint.status.notin_(("REJECTED", "DUPLICATE_MERGED")))
        .filter(models.Complaint.created_at >= window_start)
        .all()
    )
    matches: list[dict] = []
    for candidate in candidates:
        if exclude_id and candidate.id == exclude_id:
            continue
        if candidate.location is None:
            continue
        distance = haversine_m(
            latitude, longitude,
            candidate.location.latitude, candidate.location.longitude,
        )
        if distance > config.DUPLICATE_RADIUS_M * 20:  # coarse pre-filter
            continue
        similarity = _description_similarity(description, candidate.description)
        # Rank: close + same category + similar words score highest.
        score = round(
            0.5 * max(0.0, 1 - distance / (config.DUPLICATE_RADIUS_M * 20))
            + 0.3 * (1.0 if candidate.category == category else 0.6)
            + 0.2 * similarity,
            2,
        )
        matches.append({
            "complaint_id": str(candidate.id),
            "ticket_no": candidate.ticket_no,
            "category": candidate.category,
            "distance_m": round(distance, 1),
            "similarity": score,
            "decision": "pending",
            "within_radius": distance <= config.DUPLICATE_RADIUS_M,
        })
    matches.sort(key=lambda m: (-m["similarity"], m["distance_m"]))
    return matches
