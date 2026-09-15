from typing import Optional
from pydantic import BaseModel, Field


class ProblemDetails(BaseModel):
    type: str = Field(default="about:blank", description="A URI reference that identifies the problem type.")
    title: str = Field(..., description="A short, human-readable summary of the problem type.")
    status: int = Field(..., description="The HTTP status code.")
    detail: str = Field(..., description="A human-readable explanation specific to this occurrence of the problem.")
    instance: Optional[str] = Field(default=None, description="A URI reference that identifies the specific occurrence.")
