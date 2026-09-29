"""
Segmentation router — GET /api/segments
"""

from fastapi import APIRouter, Depends
try:
    from services import segmentation_service as svc
    from auth.supabase_auth import get_current_authorized_member
except ImportError:
    from backend.services import segmentation_service as svc
    from backend.auth.supabase_auth import get_current_authorized_member

router = APIRouter(dependencies=[Depends(get_current_authorized_member)])


@router.get("/segments")
async def get_segments():
    """
    Returns K-Means cluster profiles.
    Uses actual model output when available, reference values otherwise.
    """
    return svc.get_segments()
