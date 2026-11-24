"""Pydantic request/response schemas for /api/v1 (Blueprint section 6)."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core import config

CATEGORIES = [
    "Pothole", "Garbage", "Streetlight", "Waterlogging",
    "Traffic Congestion", "Footpath", "Drainage", "Other",
    # Added with the grouped report dropdown (roads & traffic, water &
    # drainage, environment & community) in the latest app version.
    "Traffic Police Challan", "Wrong-Way Driving", "Chemical Factory Pollution",
    "Political Complaint", "Drainage Overflow", "Rainwater Harvesting",
    "Water Conservation",
]
STATUSES = [
    "SUBMITTED", "UNDER REVIEW", "VERIFIED", "IN PROGRESS", "RESOLVED",
    "REJECTED", "DUPLICATE_MERGED",
]
SEVERITIES = ["Low", "Medium", "High"]


# --- Auth -------------------------------------------------------------------
class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str


# --- Complaints -------------------------------------------------------------
class LocationIn(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    address: str | None = None


class ComplaintCreate(BaseModel):
    category: str
    description: str = Field(min_length=10, max_length=2000)
    ward: str
    location: LocationIn
    ai_analysis_id: str | None = None
    # Optional contact for rewards: the promo code is sent here when the
    # report goes past its 3-day deadline. Either, both, or neither.
    reporter_phone: str | None = Field(default=None, max_length=20)
    reporter_email: EmailStr | None = None

    @field_validator("category")
    @classmethod
    def category_known(cls, value: str) -> str:
        if value not in CATEGORIES:
            raise ValueError(f"category must be one of {CATEGORIES}")
        return value

    @field_validator("ward")
    @classmethod
    def ward_known(cls, value: str) -> str:
        if value not in config.WARDS:
            raise ValueError(f"ward must be one of {config.WARDS}")
        return value


class ComplaintOut(BaseModel):
    id: str
    ticket_no: str
    category: str
    description: str
    status: str
    severity: str
    ward: str
    address: str | None
    latitude: float | None
    longitude: float | None
    is_demo: bool
    created_at: datetime
    # Overdue rewards (live-computed; see reward_service).
    reporter_phone: str | None = None
    reporter_email: str | None = None
    sla_deadline: datetime | None = None
    reward_points: int = 0
    promo_code: str | None = None
    promo_value_inr: int = 0
    days_overdue: int = 0


class StatusHistoryOut(BaseModel):
    old_status: str | None
    new_status: str
    remarks: str | None
    reason: str | None
    created_at: datetime


class CommentIn(BaseModel):
    comment: str = Field(min_length=1, max_length=1000)


class CommentOut(BaseModel):
    id: str
    user_name: str
    comment: str
    created_at: datetime


# --- AI ---------------------------------------------------------------------
class AiAnalyzeRequest(BaseModel):
    # The frontend sends the uploaded image as multipart; this schema covers
    # the JSON variant (e.g. filename hints for the mock analyser).
    filename: str | None = None
    hint_category: str | None = None


class AiAnalyzeResponse(BaseModel):
    predicted_category: str
    confidence: float
    suggested_severity: str
    visible_evidence: str
    needs_human_review: bool
    model_version: str
    analysed_at: datetime
    mode: str  # "mock" until a vision API key is configured


# --- Duplicates -------------------------------------------------------------
class DuplicateOut(BaseModel):
    complaint_id: str
    ticket_no: str
    category: str
    distance_m: float
    similarity: float
    decision: str


# --- Admin ------------------------------------------------------------------
class StatusUpdateRequest(BaseModel):
    new_status: str
    remarks: str | None = None
    reason: str | None = None

    @field_validator("new_status")
    @classmethod
    def status_known(cls, value: str) -> str:
        if value not in STATUSES:
            raise ValueError(f"new_status must be one of {STATUSES}")
        return value


# --- Map / analytics / misc -------------------------------------------------
class MapIssueOut(BaseModel):
    id: str
    ticket_no: str
    category: str
    status: str
    latitude: float
    longitude: float
    ward: str


class AnalyticsOverview(BaseModel):
    total: int
    open: int
    resolved: int
    by_status: dict[str, int]
    by_category: dict[str, int]
    by_ward: dict[str, int]


class NotificationOut(BaseModel):
    id: str
    message: str
    read_at: datetime | None
    created_at: datetime


class LeaderboardEntry(BaseModel):
    name: str
    points: int


# --- Overdue rewards --------------------------------------------------------
class RewardOut(BaseModel):
    complaint_id: str
    ticket_no: str
    category: str
    status: str
    sla_deadline: datetime | None
    days_overdue: int
    reward_points: int
    promo_code: str | None
    promo_code_created_at: datetime | None
    promo_value_inr: int
    promo_code_new: bool = False
    reporter_email: str | None
    reporter_phone: str | None
