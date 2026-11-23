"""Analytics routes: GET /analytics/overview (Blueprint section 6).

TC16 — dashboard metrics refresh after a new complaint (counts are always
computed live from the database, never cached).
"""

from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=schemas.AnalyticsOverview)
def overview(db: Session = Depends(get_db)):
    complaints = db.query(
        models.Complaint.status, models.Complaint.category,
        models.Complaint.ward,
    ).all()
    by_status = Counter(c.status for c in complaints)
    by_category = Counter(c.category for c in complaints)
    by_ward = Counter(c.ward for c in complaints)
    total = len(complaints)
    resolved = by_status.get("RESOLVED", 0)
    return schemas.AnalyticsOverview(
        total=total,
        open=total - resolved - by_status.get("REJECTED", 0)
        - by_status.get("DUPLICATE_MERGED", 0),
        resolved=resolved,
        by_status=dict(by_status),
        by_category=dict(by_category),
        by_ward=dict(by_ward),
    )
