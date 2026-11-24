"""Rewards routes: GET /rewards/me — the signed-in citizen's tickets that
have earned (or are earning) overdue points, with their promo codes.

The promo code is generated on first read once a ticket is overdue (see
reward_service.refresh_reward); the list therefore also surfaces codes
the citizen has not opened yet.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_current_user
from app.core.database import get_db
from app.services import reward_service

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.get("/me", response_model=list[schemas.RewardOut])
def my_rewards(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    complaints = (
        db.query(models.Complaint)
        .filter(models.Complaint.user_id == user.id)
        .order_by(models.Complaint.created_at.desc())
        .all()
    )
    rewards = []
    for complaint in complaints:
        reward, _ = reward_service.refresh_reward(db, complaint)
        # Only tickets that are overdue, or already carry points / a code.
        if reward["days_overdue"] > 0 or reward["reward_points"] > 0:
            rewards.append(schemas.RewardOut(**reward))
    rewards.sort(key=lambda r: r.reward_points, reverse=True)
    return rewards
