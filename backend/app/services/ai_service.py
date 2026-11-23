"""AI image analysis (Blueprint section 7).

AI outputs are SUGGESTIONS, not authoritative civic findings. The service
never infers road depth, ownership, legal responsibility or completed
repairs, and an estimated severity is never a verified engineering
assessment. Low confidence (< AI_CONFIDENCE_THRESHOLD, default 0.70) sets
``needs_human_review=True`` so the report is routed to human review (TC07).
A provider timeout is handled gracefully by the caller (TC18).

Two modes, always labelled in the response (``mode`` field):
- **live** — a ``VISION_API_KEY`` is configured and image bytes were supplied:
  the photo is sent to the configured OpenAI-compatible vision endpoint and
  the JSON suggestion is returned.
- **mock** — no key is configured (or no image bytes were supplied): the
  clearly-labelled mock analyser classifies from the filename and any
  caller-provided hint. Mock mode exists so the demo, the Playwright suite
  (TC06/TC07) and local development work without a key; it must never be
  used in production.
"""

import asyncio
import base64
import json
import os
from datetime import datetime, timezone

import httpx

from app.core import config

# Keyword hints used ONLY by the mock analyser, to make the demo explainable.
_FILENAME_KEYWORDS: dict[str, tuple[str, str, str]] = {
    "pothole": ("Pothole", "High", "Dark cavity in road surface with broken edges"),
    "garbage": ("Garbage", "Medium", "Waste spilling from an overflowing bin"),
    "trash": ("Garbage", "Medium", "Waste spilling from an overflowing bin"),
    "streetlight": ("Streetlight", "Medium", "Lamp post visible with no light emitted"),
    "light": ("Streetlight", "Medium", "Lamp post visible with no light emitted"),
    "water": ("Waterlogging", "High", "Standing water covering the road surface"),
    "flood": ("Waterlogging", "High", "Standing water covering the road surface"),
    "traffic": ("Traffic", "Medium", "Long queue of vehicles at a junction"),
    "road": ("Road Damage", "Medium", "Broken carriageway edge; exposed aggregate"),
    "drain": ("Drainage", "High", "Blocked drain with stagnant water"),
    "railing": ("Safety", "High", "Footpath edge without barrier"),
}

CATEGORIES = [
    "Pothole", "Road Damage", "Garbage", "Streetlight", "Waterlogging",
    "Drainage", "Traffic", "Safety", "Other",
]

DEFAULT_MOCK = ("Pothole", 0.62, "Medium", "Road surface damage visible in photo")


class AiProviderTimeout(Exception):
    """Raised when the vision provider does not answer in time (TC18)."""


class AiProviderError(Exception):
    """Raised when the vision provider fails or returns an unreadable reply."""


def _mock_analyse(filename: str | None, hint_category: str | None) -> dict:
    lowered = (filename or "").lower()
    for keyword, (category, severity, evidence) in _FILENAME_KEYWORDS.items():
        if keyword in lowered:
            return {
                "predicted_category": category,
                "confidence": 0.88,
                "suggested_severity": severity,
                "visible_evidence": evidence,
            }
    if hint_category:
        return {
            "predicted_category": hint_category,
            "confidence": 0.66,
            "suggested_severity": "Medium",
            "visible_evidence": "Category supplied by the reporter; image unclear",
        }
    category, confidence, severity, evidence = DEFAULT_MOCK
    return {
        "predicted_category": category,
        "confidence": confidence,
        "suggested_severity": severity,
        "visible_evidence": evidence,
    }


async def _vision_analyse(
    image_bytes: bytes, mime_type: str, description: str | None
) -> dict:
    """Call the configured OpenAI-compatible vision endpoint."""
    base_url = os.environ.get("AI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = config.VISION_API_MODEL
    timeout = float(os.environ.get("AI_TIMEOUT_SECONDS", "20"))
    image_b64 = base64.b64encode(image_bytes).decode("ascii")
    prompt = (
        "You classify photos of civic issues in Hyderabad for CityPulse AI. "
        "Return ONLY JSON with keys: predicted_category (one of: "
        + ", ".join(CATEGORIES)
        + "), confidence (0-1), suggested_severity (Low/Medium/High), "
        "visible_evidence (one short sentence describing what is visible). "
        "Do NOT infer road depth, ownership, legal responsibility or "
        "completed repairs. If unsure, use a low confidence. "
        f"Citizen description: {description or 'none'}"
    )
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{image_b64}"},
                    },
                ],
            }
        ],
        "max_tokens": 300,
    }
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {config.VISION_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
    except httpx.TimeoutException as exc:
        raise AiProviderTimeout(
            f"Vision provider timed out after {timeout}s"
        ) from exc
    except httpx.HTTPError as exc:
        raise AiProviderError(f"Vision provider request failed: {exc}") from exc
    if response.status_code != 200:
        raise AiProviderError(
            f"Vision provider returned HTTP {response.status_code}"
        )
    try:
        content = response.json()["choices"][0]["message"]["content"]
        data = json.loads(content)
        category = str(data["predicted_category"])
        confidence = float(data["confidence"])
        severity = str(data["suggested_severity"])
        evidence = str(data["visible_evidence"])
    except (KeyError, IndexError, ValueError, TypeError, json.JSONDecodeError) as exc:
        raise AiProviderError(
            "Vision provider returned an unreadable response"
        ) from exc
    if category not in CATEGORIES:
        category = "Other"
    return {
        "predicted_category": category,
        "confidence": max(0.0, min(1.0, confidence)),
        "suggested_severity": severity,
        "visible_evidence": evidence,
    }


async def analyse_image(
    filename: str | None = None,
    hint_category: str | None = None,
    *,
    simulate_timeout: bool = False,
    image_bytes: bytes | None = None,
    mime_type: str = "image/jpeg",
    description: str | None = None,
) -> dict:
    """Analyse an image. Returns the AI response fields from the blueprint.

    With a real VISION_API_KEY and image bytes, the vision API is called
    (timeout from AI_TIMEOUT_SECONDS, default 20 s, TC18). Without a key —
    or without image bytes — the labelled mock analyser runs instead.
    """
    if simulate_timeout:
        await asyncio.sleep(0.2)
        raise AiProviderTimeout("Vision provider did not respond in time")

    if config.VISION_API_KEY and image_bytes:
        result = await _vision_analyse(image_bytes, mime_type, description)
        mode = "live"
    else:
        result = _mock_analyse(filename, hint_category)
        mode = "mock"

    result["needs_human_review"] = (
        result["confidence"] < config.AI_CONFIDENCE_THRESHOLD
    )
    result["model_version"] = config.VISION_API_MODEL
    result["analysed_at"] = datetime.now(timezone.utc)
    result["mode"] = mode
    return result
