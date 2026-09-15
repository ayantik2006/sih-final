from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_db
from app.schemas.health import HealthResponse
from app.rate_limit import _redis_available

router = APIRouter(prefix="/api", tags=["Operational Health & Monitoring"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Operational health check",
    description="Returns live connection status for database and rate-limiter layers. Public access.",
)
async def get_health(db: AsyncSession = Depends(get_db)):
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    rate_limiter_status = "connected (Redis)" if _redis_available else "connected (In-Memory Sliding Window Fallback)"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        database=db_status,
        rate_limiter=rate_limiter_status,
        timestamp=datetime.now(timezone.utc).isoformat(),
        version="1.0.0",
    )
