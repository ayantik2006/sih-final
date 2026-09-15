from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="ok", examples=["ok"])
    database: str = Field(default="connected", examples=["connected"])
    rate_limiter: str = Field(default="connected", examples=["connected (in-memory)"])
    timestamp: str = Field(..., examples=["2026-09-15T18:00:00Z"])
    version: str = Field(default="1.0.0", examples=["1.0.0"])
