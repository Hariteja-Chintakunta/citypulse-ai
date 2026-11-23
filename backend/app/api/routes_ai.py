"""AI routes: POST /ai/analyze (Blueprint sections 6–7).

TC06 — verify the AI category suggestion for a labelled sample image.
TC07 — low confidence routes the report to human review.
TC18 — an AI provider timeout is handled gracefully (503 + human review).
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app import schemas
from app.core import config
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/analyze", response_model=schemas.AiAnalyzeResponse)
async def analyze_image(
    file: UploadFile | None = File(default=None),
    filename: str | None = Form(default=None),
    hint_category: str | None = Form(default=None),
    simulate_timeout: bool = Form(default=False),
):
    """Analyse an uploaded image. Rejects unsupported/oversized files
    (same rules as media upload, TC04)."""
    name = filename or (file.filename if file else None)
    contents: bytes | None = None
    mime_type = "image/jpeg"
    if file is not None:
        if file.content_type not in config.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Unsupported image type",
            )
        contents = await file.read()
        mime_type = file.content_type or mime_type
        if len(contents) > config.MAX_IMAGE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image too large. Maximum 5 MB.",
            )
    try:
        result = await ai_service.analyse_image(
            filename=name, hint_category=hint_category,
            simulate_timeout=simulate_timeout,
            image_bytes=contents, mime_type=mime_type,
            description=hint_category,
        )
    except ai_service.AiProviderError:
        # Provider failed (not a timeout): fail soft to human review.
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "detail": "AI service unavailable. The report was routed to human review.",
                "predicted_category": hint_category or "Other",
                "confidence": 0.0,
                "suggested_severity": "Medium",
                "visible_evidence": "AI unavailable — human review required",
                "needs_human_review": True,
                "model_version": config.VISION_API_MODEL,
                "mode": "mock",
            },
        )
    except ai_service.AiProviderTimeout:
        # TC18 — fail soft: flag for human review instead of failing the report.
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "detail": "AI service timed out. The report was routed to human review.",
                "predicted_category": hint_category or "Other",
                "confidence": 0.0,
                "suggested_severity": "Medium",
                "visible_evidence": "AI unavailable — human review required",
                "needs_human_review": True,
                "model_version": config.VISION_API_MODEL,
                "mode": "mock",
            },
        )
    return schemas.AiAnalyzeResponse(**result)
