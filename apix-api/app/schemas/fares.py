from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class FareItem(BaseModel):
    id: str = Field(..., examples=["F101"])
    origin: str = Field(..., examples=["DEL"])
    destination: str = Field(..., examples=["BOM"])
    carrier: str = Field(..., examples=["IndiGo"])
    flight_no: str = Field(..., examples=["6E-2041"])
    departure_date: str = Field(..., examples=["2026-09-21"])
    scrape_date: str = Field(..., examples=["2026-09-14"])
    advance_purchase_days: int = Field(..., examples=[7])
    fare_class: str = Field(default="Economy", examples=["Economy"])
    base_fare: float = Field(..., examples=[3800.0])
    taxes_udf: float = Field(..., examples=[650.0])
    convenience_fee: float = Field(default=0.0, examples=[120.0])
    total_fare: float = Field(..., examples=[4570.0])
    seat_availability_flag: bool = Field(default=True, examples=[True])
    source: str = Field(default="Direct Booking Engine", examples=["IndiGo Direct"])
    audit_hash: str = Field(
        ...,
        examples=["sha256:4a8b79f8e43cb397b91d9c02d7e5f3e9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6"],
        description="Cryptographic proof and audit trail verifying quotation integrity.",
    )


class RouteSummary(BaseModel):
    median_fare: float = Field(..., examples=[4450.0])
    iqr_spread: float = Field(..., examples=[850.0])
    min_fare: float = Field(..., examples=[3200.0])
    max_fare: float = Field(..., examples=[8900.0])
    carrier_share: Dict[str, float] = Field(
        ...,
        examples=[{"IndiGo": 0.55, "Air India": 0.25, "SpiceJet": 0.12, "Akasa Air": 0.08}],
    )


class RouteFaresResponse(BaseModel):
    status: str = "success"
    pair: str = Field(..., examples=["DEL-BOM"])
    summary: RouteSummary
    total_count: int
    limit: int
    offset: int
    fares: List[FareItem]
