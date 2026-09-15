from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import get_db
from app.deps import require_nso_or_rbi
from app.models import Route
from app.schemas.metadata import (
    RouteMetadataResponse,
    RouteMetadataItem,
    MethodologyResponse,
)

router = APIRouter(prefix="/api/metadata", tags=["Metadata & Methodology"])


@router.get(
    "/routes",
    response_model=RouteMetadataResponse,
    summary="Covered DGCA route basket and traffic weights",
    description="Lists the 15-20 domestic city-pairs accounting for >60% of DGCA domestic scheduled traffic. Requires NSO/RBI API key.",
)
async def get_route_metadata(
    user=require_nso_or_rbi,
    db: AsyncSession = Depends(get_db),
):
    query = select(Route).order_by(Route.dgca_weight.desc())
    result = await db.execute(query)
    routes = result.scalars().all()

    items = [
        RouteMetadataItem(
            pair=r.pair,
            origin=r.origin,
            origin_name=r.origin_name,
            destination=r.destination,
            destination_name=r.destination_name,
            dgca_traffic_weight=round(r.dgca_weight, 3),
            monthly_passenger_volume=r.monthly_volume,
            coverage_tier=r.tier,
        )
        for r in routes
    ]

    total_weight = sum(r.dgca_weight for r in routes)

    return RouteMetadataResponse(
        status="success",
        basket_coverage_share=round(total_weight, 3),
        routes=items,
    )


@router.get(
    "/methodology",
    response_model=MethodologyResponse,
    summary="Index formula, weighting logic, and outlier rules",
    description="Transparent specification of CPI Laspeyres/Fisher formulation, DGCA weighting diagrams, and data quality controls. Requires NSO/RBI API key.",
)
async def get_methodology(user=require_nso_or_rbi):
    return MethodologyResponse(
        status="success",
        base_year="2025",
        base_period="2025-01-01=100",
        target_cpi_subgroup="Transport and Communication (Sub-group 5 of General CPI)",
        primary_formula="Chained Laspeyres with Fisher Ideal robustness check",
        weighting_schema="DGCA Passenger Traffic Share Weighting (Sector-wise)",
        lead_time_elasticity_windows=["T+1", "T+7", "T+15", "T+30", "T+45"],
        outlier_mitigation="Interquartile Range (IQR) 1.5x filter per sector-advance window",
        traceability="Deterministic SHA-256 hash per scraped fare quote",
    )
