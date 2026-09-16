from typing import Optional
from fastapi import Request, HTTPException, status
from pydantic import BaseModel
from app.config import settings


class AuthenticatedUser(BaseModel):
    api_key: Optional[str] = None
    role: str = "PUBLIC"
    is_authenticated: bool = False


def extract_api_key(request: Request) -> Optional[str]:
    # 1. Check X-API-Key header
    api_key = request.headers.get("X-API-Key")
    if api_key:
        return api_key.strip()

    # 2. Check Authorization: Bearer <key>
    auth_header = request.headers.get("Authorization")
    if auth_header:
        parts = auth_header.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1].strip()

    # 3. Check query param ?api_key= (convenient for browser inspection)
    query_key = request.query_params.get("api_key")
    if query_key:
        return query_key.strip()

    return None


def resolve_current_user(request: Request) -> AuthenticatedUser:
    key = extract_api_key(request)
    if not key:
        return AuthenticatedUser(role="PUBLIC", is_authenticated=False)

    keys_map = settings.api_keys_map
    role = keys_map.get(key)
    if not role:
        # Invalid key provided
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "type": "https://errors.apix.mospi.gov.in/invalid-api-key",
                "title": "Invalid or Expired API Key",
                "status": 401,
                "detail": "The provided API key is invalid or unrecognized by the MoSPI/RBI API gateway.",
                "instance": str(request.url.path),
            },
        )

    return AuthenticatedUser(api_key=key, role=role, is_authenticated=True)


def require_authenticated_role(allowed_roles: list[str]):
    def dependency(request: Request) -> AuthenticatedUser:
        user = resolve_current_user(request)
        if not user.is_authenticated:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "type": "https://errors.apix.mospi.gov.in/missing-api-key",
                    "title": "Authentication Required",
                    "status": 401,
                    "detail": "Access to this endpoint requires a valid NSO or RBI API key in X-API-Key or Authorization: Bearer.",
                    "instance": str(request.url.path),
                },
            )
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "type": "https://errors.apix.mospi.gov.in/insufficient-permissions",
                    "title": "Forbidden Resource",
                    "status": 403,
                    "detail": f"User role '{user.role}' lacks sufficient privileges to access this resource.",
                    "instance": str(request.url.path),
                },
            )
        return user

    return dependency
