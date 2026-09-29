"""
Prediction router — POST /api/predict/churn

Accepts the complete 37-feature customer profile that matches
the churnguard_churn_artifacts.pkl training schema.
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Resilient imports supporting both 'backend' working dir and project root execution
try:
    from services.prediction_service import predict, ModelNotAvailableError
    from database.database import get_db, PredictionLog
    from auth.supabase_auth import get_current_authorized_member, AuthorizedMember
except ImportError:
    from backend.services.prediction_service import predict, ModelNotAvailableError
    from backend.database.database import get_db, PredictionLog
    from backend.auth.supabase_auth import get_current_authorized_member, AuthorizedMember

router = APIRouter()


# ── Request schema — all fields from the actual trained model ─────────────────
class CustomerInput(BaseModel):
    # ── Section 1: Customer Profile ──────────────────────────────────────────
    gender:              str           = Field(...,  examples=["Male"])
    age:                 int           = Field(...,  ge=18, le=100, examples=[35])
    under30:             Optional[str] = Field(None, examples=["No"])
    seniorCitizen:       str           = Field(...,  examples=["No"])
    married:             str           = Field(...,  examples=["Yes"])
    dependents:          str           = Field(...,  examples=["No"])
    numberOfDependents:  int           = Field(0,    ge=0, le=10, examples=[0])
    referredAFriend:     str           = Field(...,  examples=["No"])
    numberOfReferrals:   int           = Field(0,    ge=0, le=20, examples=[0])

    # ── Section 2: Services ───────────────────────────────────────────────────
    tenureInMonths:      int           = Field(...,  ge=0, le=100, examples=[12])
    offer:               str           = Field(...,  examples=["No Offer"])
    phoneService:        str           = Field(...,  examples=["Yes"])
    multipleLines:       str           = Field(...,  examples=["No"])
    internetService:     str           = Field(...,  examples=["Yes"])
    internetType:        str           = Field(...,  examples=["Fiber Optic"])
    onlineSecurity:      str           = Field(...,  examples=["No"])
    onlineBackup:        str           = Field(...,  examples=["No"])
    deviceProtectionPlan: str          = Field(...,  examples=["No"])
    premiumTechSupport:  str           = Field(...,  examples=["No"])
    streamingTV:         str           = Field(...,  examples=["No"])
    streamingMovies:     str           = Field(...,  examples=["No"])
    streamingMusic:      str           = Field(...,  examples=["No"])
    unlimitedData:       str           = Field(...,  examples=["Yes"])

    # ── Section 3: Plan & Payment ─────────────────────────────────────────────
    contract:            str           = Field(...,  examples=["Month-to-Month"])
    paperlessBilling:    str           = Field(...,  examples=["Yes"])
    paymentMethod:       str           = Field(...,  examples=["Bank Withdrawal"])

    # ── Section 4: Financial ──────────────────────────────────────────────────
    avgMonthlyLongDistanceCharges: float = Field(0.0, ge=0, examples=[20.0])
    avgMonthlyGBDownload:          float = Field(0.0, ge=0, examples=[25.0])
    monthlyCharge:                 float = Field(..., ge=0, examples=[85.0])
    totalCharges:                  float = Field(..., ge=0, examples=[1020.0])
    totalRefunds:                  float = Field(0.0, ge=0, examples=[0.0])
    totalExtraDataCharges:         float = Field(0.0, ge=0, examples=[0.0])
    totalLongDistanceCharges:      float = Field(0.0, ge=0, examples=[240.0])
    totalRevenue:                  float = Field(0.0, ge=0, examples=[1020.0])

    # ── Section 5: Customer Value ─────────────────────────────────────────────
    satisfactionScore:   int           = Field(..., ge=1, le=5, examples=[3])
    cltv:                float         = Field(0.0, ge=0, examples=[4000.0])
    population:          int           = Field(10000, ge=0, examples=[15000])


# ── Response schemas ──────────────────────────────────────────────────────────
class KeyFactor(BaseModel):
    feature:    str
    importance: float


class PredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    prediction:        int
    churn_probability: float
    risk_level:        str
    model_used:        str
    cluster:           int
    segment_label:     str
    key_factors:       Optional[List[KeyFactor]] = None


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("/churn", response_model=PredictionResponse)
def predict_churn(
    customer: CustomerInput,
    db: Session = Depends(get_db),
    current_member: AuthorizedMember = Depends(get_current_authorized_member),
):
    """
    Predict customer churn using the trained LogisticRegression model.
    Also returns K-Means cluster and segment label.

    Note: Defined as standard `def` (sync) so FastAPI automatically runs
    CPU-bound inference and blocking SQLAlchemy operations in an external threadpool,
    preventing the event loop from being blocked.
    """
    # Extract payload (compatible with both Pydantic v1 and v2)
    payload = customer.model_dump() if hasattr(customer, "model_dump") else customer.dict()

    try:
        result = predict(payload)
    except ModelNotAvailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid input data: {str(exc)}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(exc)}")

    # Persist log (best-effort)
    try:
        log = PredictionLog(
            gender            = customer.gender,
            senior_citizen    = 1 if customer.seniorCitizen == "Yes" else 0,
            partner           = customer.married,
            dependents        = customer.dependents,
            tenure            = customer.tenureInMonths,
            phone_service     = customer.phoneService,
            internet_service  = customer.internetService,
            contract          = customer.contract,
            monthly_charges   = customer.monthlyCharge,
            total_charges     = customer.totalCharges,
            churn_probability = result["churn_probability"],
            prediction        = bool(result["prediction"]),
            risk_level        = result["risk_level"],
            model_used        = result["model_used"],
        )
        db.add(log)
        db.commit()
    except Exception as exc:
        db.rollback()
        logger.warning(f"Could not persist prediction log to database: {exc}")

    return result

