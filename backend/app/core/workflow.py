"""Complaint workflow rules (Blueprint section 8).

SUBMITTED -> UNDER REVIEW -> VERIFIED -> IN PROGRESS -> RESOLVED.
REJECTED and DUPLICATE_MERGED are separate outcomes and must include a
reason. Transitions are enforced server-side; citizens cannot change
admin-controlled statuses (enforced in the admin router).

Admins may also resolve a ticket directly from any open status
(SUBMITTED, UNDER REVIEW, VERIFIED) — for example when the fix is already
confirmed — instead of walking it through every step.
"""

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "SUBMITTED": {"UNDER REVIEW", "REJECTED", "DUPLICATE_MERGED", "RESOLVED"},
    "UNDER REVIEW": {"VERIFIED", "REJECTED", "DUPLICATE_MERGED", "RESOLVED"},
    "VERIFIED": {"IN PROGRESS", "REJECTED", "DUPLICATE_MERGED", "RESOLVED"},
    "IN PROGRESS": {"RESOLVED", "REJECTED", "DUPLICATE_MERGED"},
    "RESOLVED": set(),
    "REJECTED": set(),
    "DUPLICATE_MERGED": set(),
}

REASON_REQUIRED = {"REJECTED", "DUPLICATE_MERGED"}


def is_transition_allowed(old_status: str, new_status: str) -> bool:
    return new_status in ALLOWED_TRANSITIONS.get(old_status, set())


def reason_required_for(new_status: str) -> bool:
    return new_status in REASON_REQUIRED
