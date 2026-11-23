"""Leaderboard routes: GET /leaderboard (P2 citizen rewards)."""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.database import get_db

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[schemas.LeaderboardEntry])
def leaderboard(db: Session = Depends(get_db)):
    rows = (
        db.query(models.User.name, func.sum(models.CitizenPoints.points))
        .join(models.CitizenPoints,
              models.CitizenPoints.user_id == models.User.id)
        .group_by(models.User.id, models.User.name)
        .order_by(func.sum(models.CitizenPoints.points).desc())
        .limit(10)
        .all()
    )
    return [schemas.LeaderboardEntry(name=name, points=int(points))
            for name, points in rows]
