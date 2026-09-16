from typing import List, Dict, Any
from pydantic import BaseModel, Field


class RouteMetadataItem(BaseModel):
    pair: str = Field(..., examples=["DEL-BOM"])
    origin: str = Field(..., examples=["DEL"])
    origin_name: str = Field(..., examples=["Indira Gandhi International Airport, Delhi"])
    destination: str = Field(..., examples=["BOM"])
    destination_name: str = Field(..., examples=["Chhatrapati Shivaji Maharaj International Airport, Mumbai"])
    dgca_traffic_weight: float = Field(..., examples=[0.18])
    monthly_passenger_volume: str = Field(..., examples=["2.4M"])
    coverage_tier: str = Field(..., examples=["Metro-to-Metro"])


class RouteMetadataResponse(BaseModel):
    status: str = "success"
    basket_coverage_share: float = Field(
        default=0.68, description="Cumulative share of total DGCA domestic passenger traffic represented in basket"
    )
    routes: List[RouteMetadataItem]


class MethodologyResponse(BaseModel):
    status: str = "success"
    base_year: str = "2025"
    base_period: str = "2025-01-01=100"
    target_cpi_subgroup: str = "Transport and Communication (Sub-group 5 of General CPI)"
    primary_formula: str = "Chained Laspeyres with Fisher Ideal robustness check"
    weighting_schema: str = "DGCA Passenger Traffic Share Weighting (Sector-wise)"
    lead_time_elasticity_windows: List[str] = ["T+1", "T+7", "T+15", "T+30", "T+45"]
    outlier_mitigation: str = "Interquartile Range (IQR) 1.5x filter per sector-advance window"
    traceability: str = "Deterministic SHA-256 hash per scraped fare quote"
