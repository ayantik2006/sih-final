import time
import asyncio
from typing import Tuple, Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from app.config import settings
from app.auth import extract_api_key

# Global in-memory storage for sliding window timestamps: key -> list of float timestamps
_memory_store: Dict[str, List[float]] = {}
_lock = asyncio.Lock()

# Try connecting to Redis if available
_redis_client = None
_redis_available = False

try:
    import redis
    _redis_client = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=0.5)
    _redis_client.ping()
    _redis_available = True
except Exception:
    _redis_available = False


async def check_rate_limit(identifier: str, limit: int, window_seconds: int = 60) -> Tuple[bool, int, int, str]:
    """
    Returns (is_allowed, remaining, reset_time_epoch, backend_type)
    """
    now = time.time()
    reset_epoch = int(now) + window_seconds
    backend = "Redis" if _redis_available and _redis_client else "In-Memory"

    if _redis_available and _redis_client:
        try:
            pipe = _redis_client.pipeline()
            key = f"rl:{identifier}"
            pipe.zremrangebyscore(key, 0, now - window_seconds)
            pipe.zcard(key)
            pipe.zadd(key, {str(now): now})
            pipe.expire(key, window_seconds)
            _, count, _, _ = pipe.execute()

            if count > limit:
                return False, 0, reset_epoch, backend
            remaining = max(0, limit - count)
            return True, remaining, reset_epoch, backend
        except Exception:
            # Fall back to in-memory if Redis call fails
            backend = "In-Memory"

    # In-memory sliding window
    async with _lock:
        timestamps = _memory_store.get(identifier, [])
        valid_from = now - window_seconds
        timestamps = [ts for ts in timestamps if ts > valid_from]

        if len(timestamps) >= limit:
            _memory_store[identifier] = timestamps
            return False, 0, reset_epoch, backend

        timestamps.append(now)
        _memory_store[identifier] = timestamps
        remaining = max(0, limit - len(timestamps))
        return True, remaining, reset_epoch, backend


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Exclude OpenAPI docs and static / favicon / health
        path = request.url.path
        if path in ["/docs", "/redoc", "/openapi.json", "/favicon.ico", "/api/health"]:
            return await call_next(request)

        # Determine client identifier and rate limit threshold
        api_key = extract_api_key(request)
        client_ip = request.client.host if request.client else "unknown"

        if api_key and api_key in settings.api_keys_map:
            identifier = f"key:{api_key}"
            limit = settings.RATE_LIMIT_AUTH
        else:
            identifier = f"ip:{client_ip}"
            limit = settings.RATE_LIMIT_PUBLIC

        is_allowed, remaining, reset_epoch, backend = await check_rate_limit(identifier, limit)

        if not is_allowed:
            retry_after = max(1, reset_epoch - int(time.time()))
            problem = {
                "type": "https://errors.apix.mospi.gov.in/rate-limit-exceeded",
                "title": "Rate Limit Exceeded",
                "status": 429,
                "detail": f"Rate limit of {limit} requests per minute exceeded. Try again in {retry_after} seconds.",
                "instance": path,
            }
            response = JSONResponse(
                status_code=429,
                content=problem,
                headers={
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_epoch),
                    "X-RateLimit-Backend": backend,
                    "Retry-After": str(retry_after),
                },
            )
            return response

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_epoch)
        response.headers["X-RateLimit-Backend"] = backend
        return response
