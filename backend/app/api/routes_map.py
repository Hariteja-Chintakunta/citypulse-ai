"""Map routes: GET /map/issues (Blueprint section 6).

TC15 — issue markers are displayed at the correct coordinates.
Markers carry no reporter identity: the map is a public geographic view.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.database import get_db

router = APIRouter(prefix="/map", tags=["map"])


@router.get("/issues", response_model=list[schemas.MapIssueOut])
def map_issues(
    category: str | None = None,
    status: str | None = None,
    ward: str | None = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(models.Complaint, models.Location)
        .join(models.Location,
              models.Location.complaint_id == models.Complaint.id)
        .filter(models.Complaint.status.notin_(("REJECTED",)))
    )
    if category:
        query = query.filter(models.Complaint.category == category)
    if status:
        query = query.filter(models.Complaint.status == status)
    if ward:
        query = query.filter(models.Complaint.ward == ward)
    return [
        schemas.MapIssueOut(
            id=str(c.id), ticket_no=c.ticket_no, category=c.category,
            status=c.status, latitude=loc.latitude, longitude=loc.longitude,
            ward=c.ward,
        )
        for c, loc in query.order_by(models.Complaint.created_at.desc()).all()
    ]
