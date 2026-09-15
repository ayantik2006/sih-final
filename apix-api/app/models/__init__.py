import hashlib
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Date,
    DateTime,
    Text,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pair = Column(String(10), unique=True, nullable=False, index=True)
    origin = Column(String(5), nullable=False)
    origin_name = Column(String(100), nullable=False)
    destination = Column(String(5), nullable=False)
    destination_name = Column(String(100), nullable=False)
    dgca_weight = Column(Float, nullable=False)
    monthly_volume = Column(String(20), nullable=False)
    tier = Column(String(50), default="Metro-to-Metro")


class Fare(Base):
    __tablename__ = "fares"

    id = Column(String(50), primary_key=True)
    pair = Column(String(10), nullable=False, index=True)
    origin = Column(String(5), nullable=False)
    destination = Column(String(5), nullable=False)
    carrier = Column(String(50), nullable=False, index=True)
    flight_no = Column(String(20), nullable=False)
    departure_date = Column(String(15), nullable=False)
    scrape_date = Column(String(15), nullable=False, index=True)
    advance_days = Column(Integer, nullable=False, index=True)
    fare_class = Column(String(20), default="Economy")
    base_fare = Column(Float, nullable=False)
    taxes_udf = Column(Float, nullable=False)
    convenience_fee = Column(Float, default=0.0)
    total_fare = Column(Float, nullable=False)
    seat_avail = Column(Boolean, default=True)
    source = Column(String(50), default="Direct Engine")
    audit_hash = Column(String(100), nullable=False)


class DailyIndex(Base):
    __tablename__ = "index_daily"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String(15), unique=True, nullable=False, index=True)
    laspeyres = Column(Float, nullable=False)
    fisher = Column(Float, nullable=False)
    ci_lower = Column(Float, nullable=False)
    ci_upper = Column(Float, nullable=False)
    t1 = Column(Float, nullable=False)
    t7 = Column(Float, nullable=False)
    t15 = Column(Float, nullable=False)
    t30 = Column(Float, nullable=False)
    t45 = Column(Float, nullable=False)


class WeeklyIndex(Base):
    __tablename__ = "index_weekly"

    id = Column(Integer, primary_key=True, autoincrement=True)
    week_ending = Column(String(15), unique=True, nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    rolling_laspeyres = Column(Float, nullable=False)
    rolling_fisher = Column(Float, nullable=False)
    t1 = Column(Float, nullable=False)
    t7 = Column(Float, nullable=False)
    t15 = Column(Float, nullable=False)
    t30 = Column(Float, nullable=False)
    t45 = Column(Float, nullable=False)


class MonthlyIndex(Base):
    __tablename__ = "index_monthly"

    id = Column(Integer, primary_key=True, autoincrement=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    formula = Column(String(50), default="chained_laspeyres")
    index_value = Column(Float, nullable=False)
    mom_change_pct = Column(Float, nullable=False)
    yoy_change_pct = Column(Float, nullable=False)
    cpi_transport_contrib = Column(Float, nullable=False)


class BacktestRecord(Base):
    __tablename__ = "backtest_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String(15), unique=True, nullable=False, index=True)
    apix_index = Column(Float, nullable=False)
    dgca_avg_fare = Column(Float, nullable=False)
    variance_pct = Column(Float, nullable=False)


def generate_audit_hash(record_dict: dict) -> str:
    raw = f"{record_dict.get('id')}|{record_dict.get('carrier')}|{record_dict.get('flight_no')}|{record_dict.get('departure_date')}|{record_dict.get('total_fare')}"
    return "sha256:" + hashlib.sha256(raw.encode("utf-8")).hexdigest()
