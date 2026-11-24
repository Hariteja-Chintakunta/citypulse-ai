"""Auth routes: POST /auth/register, POST /auth/login (Blueprint section 6)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=schemas.UserOut)
def read_me(user: models.User = Depends(get_current_user)):
      """Return the signed-in user's profile, including role.
  
      The frontend uses this after sign-in to decide which portal to show:
      the admin portal requires role "admin"; everyone else uses the
      citizen (user) portal.
      """
  return schemas.UserOut(
        id=str(user.id), name=user.name, email=user.email, role=user.role
  )


  @router.post("/register", response_model=schemas.UserOut,
             status_code=status.HTTP_201_CREATED)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    """TC01 — register a new citizen with valid details."""
    existing = db.query(models.User).filter(
        models.User.email == payload.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="citizen",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.UserOut(id=str(user.id), name=user.name, email=user.email, role=user.role)


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    """TC02 — invalid credentials are rejected with 401."""
    user = db.query(models.User).filter(
        models.User.email == payload.email
    ).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return {"access_token": create_access_token(user.id), "token_type": "bearer"}
