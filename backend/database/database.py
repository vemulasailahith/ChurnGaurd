"""
Database setup — SQLite via SQLAlchemy
"""

from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone

import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./churnguard.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── ORM Model ────────────────────────────────────────────────────────────────
class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id                = Column(Integer, primary_key=True, index=True)
    created_at        = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    gender            = Column(String)
    senior_citizen    = Column(Integer)
    partner           = Column(String)
    dependents        = Column(String)
    tenure            = Column(Integer)
    phone_service     = Column(String)
    internet_service  = Column(String)
    contract          = Column(String)
    monthly_charges   = Column(Float)
    total_charges     = Column(Float)
    churn_probability = Column(Float)
    prediction        = Column(Boolean)
    risk_level        = Column(String)
    model_used        = Column(String)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
