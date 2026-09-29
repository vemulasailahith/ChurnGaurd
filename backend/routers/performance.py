"""
Model Performance router — GET /api/model-performance

Documented experimental results from the ChurnGuard ML project.
These metrics were produced during cross-validated model evaluation.
"""

from fastapi import APIRouter, Depends
try:
    from auth.supabase_auth import get_current_authorized_member
except ImportError:
    from backend.auth.supabase_auth import get_current_authorized_member

router = APIRouter(dependencies=[Depends(get_current_authorized_member)])

# Documented evaluation results — Telco Customer Churn dataset
_MODEL_METRICS = [
    {
        "model":     "Logistic Regression",
        "accuracy":  0.961,
        "precision": 0.9518,
        "recall":    0.8984,
        "f1Score":   0.9243,
        "rocAuc":    0.9921,
        "status":    "Selected",
    },
    {
        "model":     "Random Forest",
        "accuracy":  0.9595,
        "precision": 0.9703,
        "recall":    0.8743,
        "f1Score":   0.9198,
        "rocAuc":    0.9837,
        "status":    "Baseline",
    },
    {
        "model":     "Decision Tree",
        "accuracy":  0.9475,
        "precision": 0.9011,
        "recall":    0.9011,
        "f1Score":   0.9011,
        "rocAuc":    0.9327,
        "status":    "Baseline",
    },
    {
        "model":     "KNN",
        "accuracy":  0.9241,
        "precision": 0.8847,
        "recall":    0.8209,
        "f1Score":   0.8516,
        "rocAuc":    0.9626,
        "status":    "Baseline",
    },
]


@router.get("/model-performance")
async def get_model_performance():
    """
    Returns documented evaluation metrics for all trained classifiers.
    Metrics are from experimental evaluation on the Telco Customer Churn dataset.
    """
    return {"models": _MODEL_METRICS}
