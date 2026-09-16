from typing import List
from pydantic import BaseModel, Field


class TopRouteSummary(BaseModel):
    pair: str = Field(..., examples=["DEL-BOM"])
    index: float = Field(..., examples=[115.2])
    current_avg_fare: float = Field(..., examples=[4450.0])
    trend: str = Field(..., examples=["+1.4%"])


class PublicSummaryResponse(BaseModel):
    status: str = "success"
    latest_daily_index: float = Field(..., examples=[102.45])
    latest_monthly_index: float = Field(..., examples=[113.70])
    mom_change_pct: float = Field(..., examples=[0.8])
    yoy_change_pct: float = Field(..., examples=[4.2])
    top_routes: List[TopRouteSummary]
    last_updated: str = Field(..., examples=["2026-09-14T18:00:00Z"])
    data_classification: str = "OPEN_GOVERNMENT_DATA_LICENSED"
    notice: str = "Public read-only summary for transparency. High-frequency microdata and raw quotations require authorized NSO/RBI API credentials."
