"""Admin routes: PATCH /admin/complaints/{id}/status (Blueprint section 6).

TC12 — citizens cannot change admin-only statuses (403 for non-admins).
TC13 — invalid status transitions are rejected (422).
TC14 — every status change is persisted in the append-only audit history.
TC17 — the citizen is notified after a status update.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import require_admin
from app.core.database import get_db
from app.core.workflow import is_transition_allowed, reason_required_for
from app.services import notification_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.patch("/complaints/{complaint_id}/status",
              response_model=schemas.ComplaintOut)
def update_status(
    complaint_id: str,
    payload: schemas.StatusUpdateRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id
    ).first()
    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found"
        )
    if not is_transition_allowed(complaint.status, payload.new_status):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Invalid status transition: {complaint.status} -> "
                f"{payload.new_status}"
            ),
        )
    if reason_required_for(payload.new_status) and not (
        payload.reason and payload.reason.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"A reason is required for {payload.new_status}",
        )
    old_status = complaint.status
    complaint.status = payload.new_status
    db.add(models.StatusHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=payload.new_status,
        updated_by=admin.id,
        remarks=payload.remarks,
        reason=payload.reason,
    ))
    db.commit()
    db.refresh(complaint)
    notification_service.notify_status_change(
        db, complaint=complaint, new_status=payload.new_status
    )
    location = complaint.location
    return schemas.ComplaintOut(
        id=str(complaint.id),
        ticket_no=complaint.ticket_no,
        category=complaint.category,
        description=complaint.description,
        status=complaint.status,
        severity=complaint.severity,
        ward=complaint.ward,
        address=complaint.address,
        latitude=location.latitude if location else None,
        longitude=location.longitude if location else None,
        is_demo=complaint.is_demo,
        created_at=complaint.created_at,
    )
