"""Vercel serverless entrypoint for the CityPulse AI FastAPI backend.

Vercel runs this file with ``backend/`` as the project root, so ``main``
and the ``app`` package live one level up from this file. Add that
directory to ``sys.path`` first, then expose the FastAPI app through
Mangum as ``handler``.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from mangum import Mangum

from main import app

handler = Mangum(app)
