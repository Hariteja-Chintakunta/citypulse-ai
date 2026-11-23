"""SQLAlchemy models — the 10 tables from Blueprint section 5."""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, CheckConstraint, DateTime, Double, ForeignKey, Index, Integer,
    String, Text, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="citizen")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    complaints = relationship("Complaint", back_populates="reporter")
    comments = relationship("IssueComment", back_populates="author")


class Complaint(Base):
    __tablename__ = "complaints"
    __table_args__ = (
        UniqueConstraint("ticket_no"),
        Index("idx_complaints_status", "status"),
        Index("idx_complaints_ward", "ward"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    ticket_no: Mapped[str] = mapped_column(String(20), nullable=False)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="SUBMITTED")
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="Medium")
    ward: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    reporter = relationship("User", back_populates="complaints")
    media = relationship("ComplaintMedia", back_populates="complaint",
                         cascade="all, delete-orphan")
    location = relationship("Location", back_populates="complaint", uselist=False,
                            cascade="all, delete-orphan")
    ai_analysis = relationship("AiAnalysis", back_populates="complaint", uselist=False,
                               cascade="all, delete-orphan")
    history = relationship("StatusHistory", back_populates="complaint",
                           cascade="all, delete-orphan")
    comments = relationship("IssueComment", back_populates="complaint",
                            cascade="all, delete-orphan")


class ComplaintMedia(Base):
    __tablename__ = "complaint_media"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    complaint_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("complaints.id"), nullable=False
    )
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    complaint = relationship("Complaint", back_populates="media")


class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90 AND 90"),
        CheckConstraint("longitude BETWEEN -180 AND 180"),
        Index("idx_locations_geo", "latitude", "longitude"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    complaint_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("complaints.id"), nullable=False
    )
    latitude: Mapped[float] = mapped_column(Double, nullable=False)
    longitude: Mapped[float] = mapped_column(Double, nullable=False)
    address: Mapped[str | None] = mapped_column(Text)

    complaint = relationship("Complaint", back_populates="location")


class AiAnalysis(Base):
    __tablename__ = "ai_analysis"
    __table_args__ = (CheckConstraint("confidence BETWEEN 0 AND 1"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    complaint_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("complaints.id")
    )
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    predicted_category: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Double, nullable=False)
    suggested_severity: Mapped[str | None] = mapped_column(String(20))
    visible_evidence: Mapped[str | None] = mapped_column(Text)
    needs_human_review: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    human_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    human_correction: Mapped[str | None] = mapped_column(String(50))
    analysed_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    complaint = relationship("Complaint", back_populates="ai_analysis")


class DuplicateMatch(Base):
    __tablename__ = "duplicate_matches"
    __table_args__ = (CheckConstraint("similarity BETWEEN 0 AND 1"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    complaint_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("complaints.id"), nullable=False
    )
    matched_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("complaints.id"), nullable=False
    )
    distance_m: Mapped[float] = mapped_column(Double, nullable=False)
    similarity: Mapped[float] = mapped_column(Double, nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )


class StatusHistory(Base):
    """Append-only audit trail. Rows are never updated or deleted."""

    __tablename__ = "status_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    complaint_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("complaints.id"), nullable=False
    )
    old_status: Mapped[str | None] = mapped_column(String(20))
    new_status: Mapped[str] = mapped_column(String(20), nullable=False)
    updated_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    remarks: Mapped[str | None] = mapped_column(Text)
    reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    complaint = relationship("Complaint", back_populates="history")


class IssueComment(Base):
    __tablename__ = "issue_comments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    complaint_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("complaints.id"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    complaint = relationship("Complaint", back_populates="comments")
    author = relationship("User", back_populates="comments")


class CitizenPoints(Base):
    __tablename__ = "citizen_points"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reason: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
