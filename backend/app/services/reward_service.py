"""Overdue rewards — 3-day resolution SLA, 1000 points per overdue day,
promo code for government challan / bill payments.

Rules (agreed with the product owner):
- Every report gets 3 days to be resolved: sla_deadline = created + 3 days.
- From the day after the deadline, the reporter earns 1000 points per day
  until the ticket is resolved. Accrual freezes at resolution.
- REJECTED and DUPLICATE_MERGED tickets earn nothing (closed by decision,
  not left hanging).
- When points first become greater than zero, a promo code is generated:
  CP-RWD-XXXXXX. Demo value rule: 1000 points = Rs 100 off. The app labels
  the code as a demo concept — no real government payment integration
  exists, so the code cannot be used on a real payment portal yet.
"""

import math
import secrets
import string
from datetime import datetime, timedelta

SLA_DAYS = 3
POINTS_PER_DAY = 1000
RUPEES_PER_1000_POINTS = 100

_ALPHABET = string.ascii_uppercase + string.digits


def generate_promo_code() -> str:
    """CP-RWD-XXXXXX, 6 random upper-case letters/digits."""
    return "CP-RWD-" + "".join(secrets.choice(_ALPHABET) for _ in range(6))


def sla_deadline(created_at: datetime) -> datetime:
    return created_at + timedelta(days=SLA_DAYS)


def _naive(dt: datetime) -> datetime:
    """Supabase TIMESTAMPTZ comes back timezone-aware; the app works in
    naive UTC everywhere else. Strip the offset (values are UTC)."""
    if dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt


def days_overdue(deadline: datetime, end: datetime) -> int:
    """Full days past the deadline — points accrue per completed day
    overdue (a ticket 2 days and 3 seconds late has earned 2 days)."""
    if _naive(end) <= _naive(deadline):
        return 0
    seconds = (_naive(end) - _naive(deadline)).total_seconds()
    return math.floor(seconds / 86400)


def promo_value_inr(points: int) -> int:
    """Demo value: 1000 points = Rs 100 off."""
    return (points // POINTS_PER_DAY) * RUPEES_PER_1000_POINTS


def compute_reward(created_at: datetime, status: str,
                   resolved_at=None, now: datetime | None = None):
    """Return (days_overdue, points, value_inr) for a complaint.

    `resolved_at` is the time the ticket reached RESOLVED (from the audit
    history); when given, accrual stops there. Open tickets accrue up to
    `now`. REJECTED / DUPLICATE_MERGED earn nothing.
    """
    now = _naive(now or datetime.utcnow())
    if status in ("REJECTED", "DUPLICATE_MERGED"):
        return 0, 0, 0
    deadline = sla_deadline(_naive(created_at))
    end = _naive(resolved_at) if resolved_at is not None else now
    days = days_overdue(deadline, end)
    points = days * POINTS_PER_DAY
    return days, points, promo_value_inr(points)


def resolved_at_for(db, complaint_id: str):
    """Time the ticket last reached RESOLVED, from the append-only audit
    history. None when it never resolved (still open)."""
    from app import models  # local import: avoids a circular import

    row = (
        db.query(models.StatusHistory)
        .filter(models.StatusHistory.complaint_id == complaint_id,
                models.StatusHistory.new_status == "RESOLVED")
        .order_by(models.StatusHistory.created_at.desc())
        .first()
    )
    return row.created_at if row else None


def refresh_reward(db, complaint, now: datetime | None = None):
    """Recompute a complaint's reward, persist the points, and generate the
    promo code the first time points become greater than zero.

    Returns (reward dict, promo_code_new). Called on the reward endpoints
    (user-initiated reads), never silently on list reads.
    """
    now = _naive(now or datetime.utcnow())
    resolved_at = (
        resolved_at_for(db, str(complaint.id))
        if complaint.status == "RESOLVED" else None
    )
    days, points, value = compute_reward(
        complaint.created_at, complaint.status,
        resolved_at=resolved_at, now=now,
    )
    promo_code_new = False
    if points > 0 and not complaint.promo_code:
        complaint.promo_code = generate_promo_code()
        complaint.promo_code_created_at = now
        promo_code_new = True
    if complaint.reward_points != points:
        complaint.reward_points = points
    if complaint.sla_deadline is None:
        complaint.sla_deadline = sla_deadline(_naive(complaint.created_at))
    db.commit()
    db.refresh(complaint)
    reward = {
        "complaint_id": str(complaint.id),
        "ticket_no": complaint.ticket_no,
        "category": complaint.category,
        "status": complaint.status,
        "sla_deadline": complaint.sla_deadline,
        "days_overdue": days,
        "reward_points": points,
        "promo_code": complaint.promo_code,
        "promo_code_created_at": complaint.promo_code_created_at,
        "promo_value_inr": value,
        "promo_code_new": promo_code_new,
        "reporter_email": complaint.reporter_email,
        "reporter_phone": complaint.reporter_phone,
    }
    return reward, promo_code_new
