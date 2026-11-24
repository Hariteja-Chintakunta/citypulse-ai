"""Complaint routes (Blueprint section 6).

POST   /complaints                  create complaint (TC03, TC05, TC10)
GET    /complaints                  list permitted complaints
GET    /complaints/{id}             complaint details (TC11 — authorised only)
POST   /complaints/{id}/media       upload image (TC04, TC19)
GET    /complaints/{id}/duplicates  possible matches (TC08, TC09)
POST   /complaints/{id}/comments    add comment
"""

from datetime import datetime

from fastapi import (
    APIRouter, Depends, File, HTTPException, UploadFile, status,
)
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_current_user
from app.core import config
from app.core.database import get_db
from app.services import duplicate_service, reward_service

router = APIRouter(prefix="/complaints", tags=["complaints"])


def _ticket_no(db: Session) -> str:
    """Unique ticket number, e.g. CP-2026-0001 (TC10)."""
    year = datetime.utcnow().year
    count = db.query(models.Complaint).count()
    for attempt in range(1, 100):
        candidate = f"CP-{year}-{count + attempt:04d}"
        exists = db.query(models.Complaint).filter(
            models.Complaint.ticket_no == candidate
        ).first()
        if not exists:
            return candidate
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Could not generate a unique ticket number",
    )


def _to_out(complaint: models.Complaint) -> schemas.ComplaintOut:
    location = complaint.location
    # Live reward math (read-only here; the promo code itself is only
    # generated on the reward endpoints). Resolved tickets accrue up to
    # their last update, which is the resolution write.
    end = complaint.updated_at if complaint.status == "RESOLVED" else None
    days, points, value = reward_service.compute_reward(
        complaint.created_at, complaint.status, resolved_at=end,
    )
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
        reporter_phone=complaint.reporter_phone,
        reporter_email=complaint.reporter_email,
        sla_deadline=complaint.sla_deadline,
        reward_points=points,
        promo_code=complaint.promo_code,
        promo_value_inr=value,
        days_overdue=days,
    )


def _get_owned_or_admin(
    db: Session, complaint_id: str, user: models.User
) -> models.Complaint:
    """TC11 — complaint details are restricted to the owner and admins."""
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id
    ).first()
    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found"
        )
    if user.role != "admin" and complaint.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorised to view this complaint",
        )
    return complaint


@router.post("", response_model=schemas.ComplaintOut,
             status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: schemas.ComplaintCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """TC03 / TC05 / TC10 — create a complaint with image metadata, category
    and location (all mandatory; validated by the schema). The 3-day
    resolution SLA starts at creation; phone / email are optional and are
    only used to send the promo code if the report goes overdue."""
    now = datetime.utcnow()
    complaint = models.Complaint(
        ticket_no=_ticket_no(db),
        user_id=user.id,
        category=payload.category,
        description=payload.description,
        status="SUBMITTED",
        severity="Medium",
        ward=payload.ward,
        address=payload.location.address,
        reporter_phone=(payload.reporter_phone or None),
        reporter_email=(payload.reporter_email or None),
        sla_deadline=reward_service.sla_deadline(now),
    )
    db.add(complaint)
    db.flush()
    db.add(models.Location(
        complaint_id=complaint.id,
        latitude=payload.location.latitude,
        longitude=payload.location.longitude,
        address=payload.location.address,
    ))
    # Append-only audit history starts at creation (TC14).
    db.add(models.StatusHistory(
        complaint_id=complaint.id,
        old_status=None,
        new_status="SUBMITTED",
        updated_by=user.id,
        remarks="Report created by citizen.",
    ))
    # P2 rewards: +50 points for reporting.
    db.add(models.CitizenPoints(
        user_id=user.id, points=50,
        reason=f"Report submitted: {complaint.ticket_no}",
    ))
    db.commit()
    db.refresh(complaint)
    return _to_out(complaint)


@router.get("", response_model=list[schemas.ComplaintOut])
def list_complaints(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Citizens list their own complaints; admins list all."""
    query = db.query(models.Complaint)
    if user.role != "admin":
        query = query.filter(models.Complaint.user_id == user.id)
    return [_to_out(c) for c in query.order_by(
        models.Complaint.created_at.desc()).all()]


@router.get("/duplicates", response_model=list[schemas.DuplicateOut])
def check_duplicates(
    category: str,
    latitude: float,
    longitude: float,
    description: str = "",
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Pre-creation duplicate check used by the report form: same/related
    category, ~50 m radius, 14-day window (TC08/TC09). Matches are flagged,
    never silently discarded — the citizen decides. Defined before
    /{complaint_id} so the static path is matched first."""
    matches = duplicate_service.find_possible_duplicates(
        db,
        category=category,
        latitude=latitude,
        longitude=longitude,
        description=description,
    )
    return [schemas.DuplicateOut(**m) for m in matches
            if m["within_radius"] or m["similarity"] >= 0.7]


@router.get("/{complaint_id}", response_model=schemas.ComplaintOut)
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return _to_out(_get_owned_or_admin(db, complaint_id, user))


@router.get("/{complaint_id}/reward", response_model=schemas.RewardOut)
def get_reward(
    complaint_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Overdue reward for one ticket (owner or admin only).

    Recomputes the points, generates the promo code the first time the
    ticket is overdue, and reports whether the code is new — the frontend
    uses that flag to email the code once to the reporter's email.
    """
    complaint = _get_owned_or_admin(db, complaint_id, user)
    reward, _ = reward_service.refresh_reward(db, complaint)
    return schemas.RewardOut(**reward)


@router.get("/{complaint_id}/history",
            response_model=list[schemas.StatusHistoryOut])
def get_history(
    complaint_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """TC14 — every status change is persisted in audit history."""
    complaint = _get_owned_or_admin(db, complaint_id, user)
    rows = (
        db.query(models.StatusHistory)
        .filter(models.StatusHistory.complaint_id == complaint.id)
        .order_by(models.StatusHistory.created_at.asc())
        .all()
    )
    return [schemas.StatusHistoryOut(
        old_status=r.old_status, new_status=r.new_status,
        remarks=r.remarks, reason=r.reason, created_at=r.created_at,
    ) for r in rows]


@router.post("/{complaint_id}/media", status_code=status.HTTP_201_CREATED)
async def upload_media(
    complaint_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """TC04 — reject unsupported formats and oversized files.
    TC19 — only the owner or an admin may attach (and later access) media;
    the stored object is referenced by path only, never served publicly.
    """
    complaint = _get_owned_or_admin(db, complaint_id, user)
    if file.content_type not in config.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type. Allowed: {sorted(config.ALLOWED_IMAGE_TYPES)}",
        )
    contents = await file.read()
    if len(contents) > config.MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image too large. Maximum {config.MAX_IMAGE_BYTES // (1024 * 1024)} MB.",
        )
    # In production this uploads to Supabase Storage and stores the object
    # key; the demo/dev build records the reference only.
    storage_path = f"complaints/{complaint.id}/{file.filename}"
    media = models.ComplaintMedia(
        complaint_id=complaint.id,
        storage_path=storage_path,
        mime_type=file.content_type,
        file_size=len(contents),
    )
    db.add(media)
    db.commit()
    return {"storage_path": storage_path, "mime_type": file.content_type,
            "file_size": len(contents)}


@router.get("/{complaint_id}/duplicates",
            response_model=list[schemas.DuplicateOut])
def get_duplicates(
    complaint_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """TC08 / TC09 — possible matches for an existing complaint."""
    complaint = _get_owned_or_admin(db, complaint_id, user)
    location = complaint.location
    if location is None:
        return []
    matches = duplicate_service.find_possible_duplicates(
        db,
        category=complaint.category,
        latitude=location.latitude,
        longitude=location.longitude,
        description=complaint.description,
        exclude_id=complaint.id,
    )
    return [schemas.DuplicateOut(**m) for m in matches
            if m["within_radius"] or m["similarity"] >= 0.7]


@router.post("/{complaint_id}/comments", response_model=schemas.CommentOut,
             status_code=status.HTTP_201_CREATED)
def add_comment(
    complaint_id: str,
    payload: schemas.CommentIn,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    complaint = _get_owned_or_admin(db, complaint_id, user)
    comment = models.IssueComment(
        complaint_id=complaint.id, user_id=user.id, comment=payload.comment
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return schemas.CommentOut(
        id=str(comment.id), user_name=user.name,
        comment=comment.comment, created_at=comment.created_at,
    )
