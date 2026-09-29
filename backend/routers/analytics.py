"""
Analytics router — GET /api/analytics/*
"""

from fastapi import APIRouter, Depends
try:
    from services import analytics_service as svc
    from auth.supabase_auth import get_current_authorized_member
except ImportError:
    from backend.services import analytics_service as svc
    from backend.auth.supabase_auth import get_current_authorized_member

router = APIRouter(dependencies=[Depends(get_current_authorized_member)])


@router.get("/overview")
async def get_overview():
    """High-level KPI summary (total customers, churn rate, etc.)"""
    return svc.get_overview()


@router.get("/churn-by-contract")
async def get_churn_by_contract():
    """Churn counts grouped by contract type."""
    return svc.get_churn_by_contract()


@router.get("/churn-by-tenure")
async def get_churn_by_tenure():
    """Churn rate for each tenure group."""
    return svc.get_churn_by_tenure()


@router.get("/churn-by-internet")
async def get_churn_by_internet():
    """Churn counts grouped by internet service type."""
    return svc.get_churn_by_internet()


@router.get("/churn-by-payment")
async def get_churn_by_payment():
    """Churn rate grouped by payment method."""
    return svc.get_churn_by_payment()


@router.get("/churn-by-senior")
async def get_churn_by_senior():
    """Churn counts for senior vs non-senior citizens."""
    return svc.get_churn_by_senior()


@router.get("/churn-by-partner")
async def get_churn_by_partner():
    """Churn rate by partner/dependent status."""
    return svc.get_churn_by_partner()
