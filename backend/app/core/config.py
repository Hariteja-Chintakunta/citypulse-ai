"""Configuration from environment variables (never commit secrets)."""

import os

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "sqlite:///./citypulse.db"
)
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)
CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000"
    ).split(",")
    if origin.strip()
]

# AI analysis (Blueprint section 7)
VISION_API_KEY = os.environ.get("VISION_API_KEY", "")
VISION_API_MODEL = os.environ.get("VISION_API_MODEL", "citypulse-vision-mock-v1")
AI_CONFIDENCE_THRESHOLD = float(os.environ.get("AI_CONFIDENCE_THRESHOLD", "0.70"))

# Duplicate matching (Blueprint section 7)
DUPLICATE_RADIUS_M = float(os.environ.get("DUPLICATE_RADIUS_M", "50"))
DUPLICATE_WINDOW_DAYS = int(os.environ.get("DUPLICATE_WINDOW_DAYS", "14"))

# Upload limits (TC04)
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Hyderabad wards covered by the demo (Blueprint / documentation)
WARDS = [
    "Jubilee Hills", "Banjara Hills", "Begumpet", "Secunderabad",
    "Kukatpally", "LB Nagar", "Uppal", "Malakpet", "Charminar", "Golconda",
    # Bachupally: added for the resident-reported chemical-factory
    # pollution issue (ticket CP-2026-0016).
    "Bachupally",
]
