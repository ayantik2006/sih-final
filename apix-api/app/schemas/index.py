from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class SectorPoint(BaseModel):
    pair: str = Field(..., examples=["DEL-BOM"])
    index: float = Field(..., examples=[115.2])
    weight: float = Field(..., examples=[0.18])


class DailyIndexItem(BaseModel):
    date: str = Field(..., examples=["2026-09-14"])
    laspeyres: float = Field(..., examples=[102.45])
    fisher: float = Field(..., examples=[102.10])
    ci_lower: float = Field(..., examples=[101.20])
    ci_upper: float = Field(..., examples=[103.60])
    windows: Dict[str, float] = Field(
        ...,
        examples=[{"T+1": 120.3, "T+7": 115.2, "T+15": 110.1, "T+30": 108.7, "T+45": 107.9}],
    )
    sectors: List[SectorPoint] = Field(default_factory=list)


class DailyIndexResponse(BaseModel):
    status: str = "success"
    base_period: str = Field(default="2025-01-01=100")
    total_records: int
    data: List[DailyIndexItem]


class WeeklyIndexItem(BaseModel):
    week_ending: str = Field(..., examples=["2026-09-14"])
    week_number: int = Field(..., examples=[37])
    rolling_laspeyres_7d: float = Field(..., examples=[102.20])
    rolling_fisher_7d: float = Field(..., examples=[101.95])
    windows: Dict[str, float] = Field(
        ...,
        examples=[{"T+1": 119.5, "T+7": 114.8, "T+15": 109.8, "T+30": 108.4, "T+45": 107.5}],
    )


class WeeklyIndexResponse(BaseModel):
    status: str = "success"
    base_period: str = Field(default="2025-01-01=100")
    total_weeks: int
    data: List[WeeklyIndexItem]


class MonthlyIndexResponse(BaseModel):
    status: str = "success"
    year: int = Field(..., examples=[2026])
    month: int = Field(..., examples=[8])
    formula: str = Field(default="chained_laspeyres", examples=["chained_laspeyres"])
    base_period: str = "2025-01-01=100"
    index: float = Field(..., examples=[113.7])
    mom_change_pct: float = Field(..., examples=[0.8])
    yoy_change_pct: float = Field(..., examples=[4.2])
    contribution_to_cpi_transport: float = Field(
        ..., examples=[0.15], description="Percentage point contribution to CPI Transport and Communication group"
    )
    sector_weights: Dict[str, float] = Field(
        ...,
        examples=[{
            "DEL-BOM": 0.18,
            "DEL-BLR": 0.14,
            "BOM-BLR": 0.12,
            "DEL-CCU": 0.09,
            "BLR-HYD": 0.08,
            "MAA-DEL": 0.07,
        }],
    )
    published_by: str = "Ministry of Statistics & Programme Implementation (MoSPI)"
    computed_dynamically: bool = Field(default=False, description="Flag indicating if index was aggregated dynamically from daily records")
