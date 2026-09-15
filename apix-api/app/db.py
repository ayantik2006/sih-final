import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models import (
    Base,
    Route,
    Fare,
    DailyIndex,
    WeeklyIndex,
    MonthlyIndex,
    BacktestRecord,
    generate_audit_hash,
)

# Create engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create tables and seed initial baseline data if database is fresh."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if routes already exist
        existing_route = await session.execute(select(Route).limit(1))
        if existing_route.scalar_one_or_none() is not None:
            return  # Already seeded

        # Seed DGCA Basket Routes
        routes_data = [
            Route(pair="DEL-BOM", origin="DEL", origin_name="Delhi Indira Gandhi Int'l", destination="BOM", destination_name="Mumbai Chhatrapati Shivaji Maharaj", dgca_weight=0.18, monthly_volume="2.4M", tier="Metro-to-Metro"),
            Route(pair="DEL-BLR", origin="DEL", origin_name="Delhi Indira Gandhi Int'l", destination="BLR", destination_name="Bengaluru Kempegowda Int'l", dgca_weight=0.14, monthly_volume="1.9M", tier="Metro-to-Metro"),
            Route(pair="BOM-BLR", origin="BOM", origin_name="Mumbai Chhatrapati Shivaji Maharaj", destination="BLR", destination_name="Bengaluru Kempegowda Int'l", dgca_weight=0.12, monthly_volume="1.6M", tier="Metro-to-Metro"),
            Route(pair="DEL-CCU", origin="DEL", origin_name="Delhi Indira Gandhi Int'l", destination="CCU", destination_name="Kolkata Netaji Subhash Chandra Bose", dgca_weight=0.09, monthly_volume="1.2M", tier="Metro-to-Metro"),
            Route(pair="BLR-HYD", origin="BLR", origin_name="Bengaluru Kempegowda Int'l", destination="HYD", destination_name="Hyderabad Rajiv Gandhi Int'l", dgca_weight=0.08, monthly_volume="1.1M", tier="Metro-to-Tier2"),
            Route(pair="MAA-DEL", origin="MAA", origin_name="Chennai Int'l", destination="DEL", destination_name="Delhi Indira Gandhi Int'l", dgca_weight=0.07, monthly_volume="0.9M", tier="Metro-to-Metro"),
            Route(pair="DEL-PNQ", origin="DEL", origin_name="Delhi Indira Gandhi Int'l", destination="PNQ", destination_name="Pune Airport", dgca_weight=0.06, monthly_volume="0.8M", tier="Metro-to-Tier2"),
            Route(pair="BOM-GOI", origin="BOM", origin_name="Mumbai Chhatrapati Shivaji Maharaj", destination="GOI", destination_name="Goa Dabolim / Mopa", dgca_weight=0.05, monthly_volume="0.7M", tier="Tourist/Leisure"),
        ]
        session.add_all(routes_data)

        # Seed Daily Index History (Base 2025-01-01 = 100)
        daily_records = [
            DailyIndex(date="2026-09-01", laspeyres=101.40, fisher=101.05, ci_lower=100.2, ci_upper=102.6, t1=119.2, t7=114.3, t15=109.1, t30=107.5, t45=106.8),
            DailyIndex(date="2026-09-02", laspeyres=101.50, fisher=101.10, ci_lower=100.3, ci_upper=102.7, t1=119.4, t7=114.5, t15=109.2, t30=107.6, t45=106.9),
            DailyIndex(date="2026-09-03", laspeyres=101.65, fisher=101.20, ci_lower=100.4, ci_upper=102.9, t1=119.6, t7=114.7, t15=109.4, t30=107.8, t45=107.0),
            DailyIndex(date="2026-09-04", laspeyres=101.80, fisher=101.35, ci_lower=100.5, ci_upper=103.1, t1=119.9, t7=115.0, t15=109.7, t30=108.0, t45=107.2),
            DailyIndex(date="2026-09-05", laspeyres=101.90, fisher=101.40, ci_lower=100.6, ci_upper=103.2, t1=120.0, t7=115.1, t15=109.8, t30=108.1, t45=107.3),
            DailyIndex(date="2026-09-06", laspeyres=102.00, fisher=101.55, ci_lower=100.7, ci_upper=103.3, t1=120.1, t7=115.2, t15=109.9, t30=108.2, t45=107.4),
            DailyIndex(date="2026-09-07", laspeyres=102.10, fisher=101.65, ci_lower=100.8, ci_upper=103.4, t1=120.2, t7=115.3, t15=110.0, t30=108.3, t45=107.5),
            DailyIndex(date="2026-09-08", laspeyres=102.15, fisher=101.80, ci_lower=100.9, ci_upper=103.4, t1=120.2, t7=115.3, t15=110.0, t30=108.4, t45=107.6),
            DailyIndex(date="2026-09-09", laspeyres=102.20, fisher=101.85, ci_lower=100.9, ci_upper=103.5, t1=120.2, t7=115.4, t15=110.1, t30=108.5, t45=107.7),
            DailyIndex(date="2026-09-10", laspeyres=102.25, fisher=101.90, ci_lower=101.0, ci_upper=103.5, t1=120.3, t7=115.4, t15=110.1, t30=108.5, t45=107.7),
            DailyIndex(date="2026-09-11", laspeyres=102.30, fisher=102.00, ci_lower=101.0, ci_upper=103.6, t1=120.3, t7=115.5, t15=110.2, t30=108.6, t45=107.8),
            DailyIndex(date="2026-09-12", laspeyres=102.35, fisher=102.05, ci_lower=101.1, ci_upper=103.6, t1=120.4, t7=115.6, t15=110.3, t30=108.6, t45=107.8),
            DailyIndex(date="2026-09-13", laspeyres=102.40, fisher=102.10, ci_lower=101.1, ci_upper=103.7, t1=120.5, t7=115.7, t15=110.4, t30=108.7, t45=107.9),
            DailyIndex(date="2026-09-14", laspeyres=102.45, fisher=102.10, ci_lower=101.2, ci_upper=103.6, t1=120.3, t7=115.2, t15=110.1, t30=108.7, t45=107.9),
        ]
        session.add_all(daily_records)

        # Seed Weekly Rolling Index
        weekly_records = [
            WeeklyIndex(week_ending="2026-08-24", week_number=34, rolling_laspeyres=100.10, rolling_fisher=99.80, t1=118.2, t7=113.5, t15=108.7, t30=107.0, t45=106.2),
            WeeklyIndex(week_ending="2026-08-31", week_number=35, rolling_laspeyres=101.20, rolling_fisher=100.90, t1=119.0, t7=114.1, t15=109.1, t30=107.4, t45=106.6),
            WeeklyIndex(week_ending="2026-09-07", week_number=36, rolling_laspeyres=101.85, rolling_fisher=101.45, t1=119.8, t7=115.0, t15=109.8, t30=108.0, t45=107.2),
            WeeklyIndex(week_ending="2026-09-14", week_number=37, rolling_laspeyres=102.35, rolling_fisher=102.00, t1=120.3, t7=115.5, t15=110.2, t30=108.6, t45=107.8),
        ]
        session.add_all(weekly_records)

        # Seed Monthly Index
        monthly_records = [
            MonthlyIndex(year=2026, month=5, formula="chained_laspeyres", index_value=111.8, mom_change_pct=0.4, yoy_change_pct=3.6, cpi_transport_contrib=0.12),
            MonthlyIndex(year=2026, month=6, formula="chained_laspeyres", index_value=112.5, mom_change_pct=0.6, yoy_change_pct=3.9, cpi_transport_contrib=0.14),
            MonthlyIndex(year=2026, month=7, formula="chained_laspeyres", index_value=113.1, mom_change_pct=0.5, yoy_change_pct=4.0, cpi_transport_contrib=0.14),
            MonthlyIndex(year=2026, month=8, formula="chained_laspeyres", index_value=113.7, mom_change_pct=0.8, yoy_change_pct=4.2, cpi_transport_contrib=0.15),
        ]
        session.add_all(monthly_records)

        # Seed Backtest records (30 historical data points vs DGCA published average fares)
        backtest_seed = [
            ("2026-08-16", 98.2, 4380.0, 0.91),
            ("2026-08-17", 98.5, 4390.0, 0.88),
            ("2026-08-18", 98.9, 4420.0, 0.75),
            ("2026-08-19", 99.1, 4440.0, 0.80),
            ("2026-08-20", 99.3, 4460.0, 0.70),
            ("2026-08-21", 99.4, 4480.0, 0.65),
            ("2026-08-22", 99.7, 4500.0, 0.60),
            ("2026-08-23", 99.9, 4520.0, 0.55),
            ("2026-08-24", 100.1, 4550.0, 0.62),
            ("2026-08-25", 100.3, 4570.0, 0.58),
            ("2026-08-26", 100.6, 4590.0, 0.52),
            ("2026-08-27", 100.8, 4610.0, 0.48),
            ("2026-08-28", 101.0, 4630.0, 0.45),
            ("2026-08-29", 101.1, 4640.0, 0.40),
            ("2026-08-30", 101.2, 4660.0, 0.38),
            ("2026-08-31", 101.3, 4680.0, 0.35),
            ("2026-09-01", 101.4, 4700.0, 0.32),
            ("2026-09-02", 101.5, 4710.0, 0.30),
            ("2026-09-03", 101.6, 4730.0, 0.28),
            ("2026-09-04", 101.8, 4750.0, 0.25),
            ("2026-09-05", 101.9, 4760.0, 0.24),
            ("2026-09-06", 102.0, 4780.0, 0.22),
            ("2026-09-07", 102.1, 4790.0, 0.20),
            ("2026-09-08", 102.15, 4800.0, 0.18),
            ("2026-09-09", 102.20, 4810.0, 0.16),
            ("2026-09-10", 102.25, 4820.0, 0.15),
            ("2026-09-11", 102.30, 4830.0, 0.14),
            ("2026-09-12", 102.35, 4840.0, 0.13),
            ("2026-09-13", 102.40, 4850.0, 0.12),
            ("2026-09-14", 102.45, 4860.0, 0.10),
        ]
        backtest_objs = [
            BacktestRecord(date=d, apix_index=idx, dgca_avg_fare=dgca, variance_pct=var)
            for d, idx, dgca, var in backtest_seed
        ]
        session.add_all(backtest_objs)

        # Seed Fares across multiple routes and carriers
        raw_fares_seed = [
            # DEL-BOM
            {"id": "F101", "pair": "DEL-BOM", "origin": "DEL", "destination": "BOM", "carrier": "IndiGo", "flight_no": "6E-2041", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 3800.0, "taxes_udf": 650.0, "convenience_fee": 120.0, "total_fare": 4570.0, "seat_avail": True, "source": "IndiGo Direct"},
            {"id": "F102", "pair": "DEL-BOM", "origin": "DEL", "destination": "BOM", "carrier": "Air India", "flight_no": "AI-805", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 4400.0, "taxes_udf": 720.0, "convenience_fee": 0.0, "total_fare": 5120.0, "seat_avail": True, "source": "Air India Direct"},
            {"id": "F103", "pair": "DEL-BOM", "origin": "DEL", "destination": "BOM", "carrier": "SpiceJet", "flight_no": "SG-8169", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 3200.0, "taxes_udf": 580.0, "convenience_fee": 150.0, "total_fare": 3930.0, "seat_avail": True, "source": "MakeMyTrip"},
            {"id": "F104", "pair": "DEL-BOM", "origin": "DEL", "destination": "BOM", "carrier": "Akasa Air", "flight_no": "QP-1102", "departure_date": "2026-09-15", "scrape_date": "2026-09-14", "advance_days": 1, "fare_class": "Economy", "base_fare": 7200.0, "taxes_udf": 950.0, "convenience_fee": 100.0, "total_fare": 8250.0, "seat_avail": True, "source": "EaseMyTrip"},
            {"id": "F105", "pair": "DEL-BOM", "origin": "DEL", "destination": "BOM", "carrier": "Air India Express", "flight_no": "IX-1402", "departure_date": "2026-09-29", "scrape_date": "2026-09-14", "advance_days": 15, "fare_class": "Economy", "base_fare": 3300.0, "taxes_udf": 550.0, "convenience_fee": 100.0, "total_fare": 3950.0, "seat_avail": True, "source": "Cleartrip"},
            {"id": "F106", "pair": "DEL-BOM", "origin": "DEL", "destination": "BOM", "carrier": "IndiGo", "flight_no": "6E-5312", "departure_date": "2026-10-14", "scrape_date": "2026-09-14", "advance_days": 30, "fare_class": "Economy", "base_fare": 2900.0, "taxes_udf": 520.0, "convenience_fee": 120.0, "total_fare": 3540.0, "seat_avail": True, "source": "IndiGo Direct"},
            {"id": "F107", "pair": "DEL-BOM", "origin": "DEL", "destination": "BOM", "carrier": "IndiGo", "flight_no": "6E-5314", "departure_date": "2026-10-29", "scrape_date": "2026-09-14", "advance_days": 45, "fare_class": "Economy", "base_fare": 2750.0, "taxes_udf": 500.0, "convenience_fee": 120.0, "total_fare": 3370.0, "seat_avail": True, "source": "IndiGo Direct"},

            # DEL-BLR
            {"id": "F201", "pair": "DEL-BLR", "origin": "DEL", "destination": "BLR", "carrier": "IndiGo", "flight_no": "6E-2134", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 3900.0, "taxes_udf": 680.0, "convenience_fee": 120.0, "total_fare": 4700.0, "seat_avail": True, "source": "IndiGo Direct"},
            {"id": "F202", "pair": "DEL-BLR", "origin": "DEL", "destination": "BLR", "carrier": "Air India", "flight_no": "AI-506", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 4600.0, "taxes_udf": 750.0, "convenience_fee": 0.0, "total_fare": 5350.0, "seat_avail": True, "source": "Air India Direct"},
            {"id": "F203", "pair": "DEL-BLR", "origin": "DEL", "destination": "BLR", "carrier": "Akasa Air", "flight_no": "QP-1331", "departure_date": "2026-09-29", "scrape_date": "2026-09-14", "advance_days": 15, "fare_class": "Economy", "base_fare": 3250.0, "taxes_udf": 580.0, "convenience_fee": 100.0, "total_fare": 3930.0, "seat_avail": True, "source": "EaseMyTrip"},

            # BOM-BLR
            {"id": "F301", "pair": "BOM-BLR", "origin": "BOM", "destination": "BLR", "carrier": "IndiGo", "flight_no": "6E-455", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 2900.0, "taxes_udf": 510.0, "convenience_fee": 120.0, "total_fare": 3530.0, "seat_avail": True, "source": "IndiGo Direct"},
            {"id": "F302", "pair": "BOM-BLR", "origin": "BOM", "destination": "BLR", "carrier": "SpiceJet", "flight_no": "SG-302", "departure_date": "2026-09-29", "scrape_date": "2026-09-14", "advance_days": 15, "fare_class": "Economy", "base_fare": 2500.0, "taxes_udf": 480.0, "convenience_fee": 150.0, "total_fare": 3130.0, "seat_avail": True, "source": "Yatra"},

            # DEL-CCU
            {"id": "F401", "pair": "DEL-CCU", "origin": "DEL", "destination": "CCU", "carrier": "IndiGo", "flight_no": "6E-678", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 2600.0, "taxes_udf": 450.0, "convenience_fee": 120.0, "total_fare": 3170.0, "seat_avail": True, "source": "IndiGo Direct"},
            {"id": "F402", "pair": "DEL-CCU", "origin": "DEL", "destination": "CCU", "carrier": "SpiceJet", "flight_no": "SG-271", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 2300.0, "taxes_udf": 420.0, "convenience_fee": 150.0, "total_fare": 2870.0, "seat_avail": True, "source": "Ixigo"},

            # BLR-HYD
            {"id": "F501", "pair": "BLR-HYD", "origin": "BLR", "destination": "HYD", "carrier": "IndiGo", "flight_no": "6E-344", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 1800.0, "taxes_udf": 380.0, "convenience_fee": 120.0, "total_fare": 2300.0, "seat_avail": True, "source": "IndiGo Direct"},
            {"id": "F502", "pair": "BLR-HYD", "origin": "BLR", "destination": "HYD", "carrier": "Air India Express", "flight_no": "IX-992", "departure_date": "2026-10-29", "scrape_date": "2026-09-14", "advance_days": 45, "fare_class": "Economy", "base_fare": 1500.0, "taxes_udf": 320.0, "convenience_fee": 100.0, "total_fare": 1920.0, "seat_avail": True, "source": "Cleartrip"},

            # MAA-DEL
            {"id": "F601", "pair": "MAA-DEL", "origin": "MAA", "destination": "DEL", "carrier": "Air India", "flight_no": "AI-440", "departure_date": "2026-09-15", "scrape_date": "2026-09-14", "advance_days": 1, "fare_class": "Economy", "base_fare": 7400.0, "taxes_udf": 980.0, "convenience_fee": 0.0, "total_fare": 8380.0, "seat_avail": True, "source": "Air India Direct"},
            {"id": "F602", "pair": "MAA-DEL", "origin": "MAA", "destination": "DEL", "carrier": "IndiGo", "flight_no": "6E-501", "departure_date": "2026-09-21", "scrape_date": "2026-09-14", "advance_days": 7, "fare_class": "Economy", "base_fare": 3600.0, "taxes_udf": 620.0, "convenience_fee": 120.0, "total_fare": 4340.0, "seat_avail": True, "source": "IndiGo Direct"},
        ]

        fares_objs = [
            Fare(
                id=f["id"],
                pair=f["pair"],
                origin=f["origin"],
                destination=f["destination"],
                carrier=f["carrier"],
                flight_no=f["flight_no"],
                departure_date=f["departure_date"],
                scrape_date=f["scrape_date"],
                advance_days=f["advance_days"],
                fare_class=f["fare_class"],
                base_fare=f["base_fare"],
                taxes_udf=f["taxes_udf"],
                convenience_fee=f["convenience_fee"],
                total_fare=f["total_fare"],
                seat_avail=f["seat_avail"],
                source=f["source"],
                audit_hash=generate_audit_hash(f),
            )
            for f in raw_fares_seed
        ]
        session.add_all(fares_objs)

        await session.commit()
