"""Notification routes: GET /notifications (Blueprint section 6)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_current_user
from app.core.database import get_db

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[schemas.NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    rows = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user.id)
        .order_by(models.Notification.created_at.desc())
        .all()
    )
    return [schemas.NotificationOut(
        id=str(r.id), message=r.message, read_at=r.read_at,
        created_at=r.created_at,
    ) for r in rows]


@router.patch("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    from datetime import datetime

    row = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == user.id,
    ).first()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    row.read_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return schemas.NotificationOut(
        id=str(row.id), message=row.message, read_at=row.read_at,
        created_at=row.created_at,
    )
