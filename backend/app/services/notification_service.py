"""Notifications: the citizen is notified after every status update
(Blueprint section 7 / TC17)."""

from sqlalchemy.orm import Session

from app import models


def notify(db: Session, *, user_id: str, message: str) -> models.Notification:
    notification = models.Notification(user_id=user_id, message=message)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def notify_status_change(
    db: Session, *, complaint: models.Complaint, new_status: str
) -> models.Notification:
    return notify(
        db,
        user_id=complaint.user_id,
        message=(
            f"Update on your report {complaint.ticket_no}: "
            f"status is now {new_status}."
        ),
    )
