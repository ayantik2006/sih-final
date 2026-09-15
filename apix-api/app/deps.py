from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.auth import (
    AuthenticatedUser,
    resolve_current_user,
    require_authenticated_role,
)

# Common role requirements
require_nso_or_rbi = Depends(
    require_authenticated_role(["NSO_STATISTICIAN", "RBI_ANALYST"])
)
require_nso_only = Depends(
    require_authenticated_role(["NSO_STATISTICIAN"])
)
require_rbi_only = Depends(
    require_authenticated_role(["RBI_ANALYST"])
)
