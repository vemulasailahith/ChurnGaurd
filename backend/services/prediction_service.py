"""
ChurnGuard — Prediction Service
=================================
Loads the actual trained artifact (churnguard_churn_artifacts.pkl) and
runs inference using the stored LogisticRegression model and
ColumnTransformer preprocessor.

IMPORTANT:
  - Do NOT recreate the preprocessing pipeline manually.
  - Do NOT encode/scale features by hand.
  - Use artifacts["preprocessor"].transform() and artifacts["logistic_model"].predict*().
  - The artifact was trained with scikit-learn 1.6.1 — keep requirements pinned.

Artifact structure:
  artifacts["logistic_model"]       — LogisticRegression(max_iter=1000, random_state=42)
  artifacts["preprocessor"]         — ColumnTransformer (fitted)
  artifacts["kmeans_model"]         — KMeans for segmentation
  artifacts["scaler"]               — StandardScaler for segmentation features
  artifacts["categorical_features"] — list of 22 categorical column names
  artifacts["numerical_features"]   — list of 15 numerical column names
  artifacts["segmentation_features"]— list of 11 segmentation feature names
"""

import os
import joblib
import pandas as pd
import numpy as np

# ── Compat patch for older sklearn artifacts ──────────────────────────────────
# The artifact was pickled with a private sklearn type. Patch it before loading.
try:
    from sklearn.compose import _column_transformer
    if not hasattr(_column_transformer, "_RemainderColsList"):
        class _RemainderColsList(list):
            pass
        _column_transformer._RemainderColsList = _RemainderColsList
except Exception:
    pass

# ── Artifact path ─────────────────────────────────────────────────────────────
_ARTIFACT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "models_pkl",
    "churnguard_churn_artifacts.pkl"
)

# ── Risk thresholds — configured here, NOT in the frontend ───────────────────
RISK_HIGH_THRESHOLD   = 0.65
RISK_MEDIUM_THRESHOLD = 0.35


class ModelNotAvailableError(Exception):
    pass


# ── Load artifacts once at import time ────────────────────────────────────────
_artifacts = None

def _load():
    global _artifacts
    path = os.path.abspath(_ARTIFACT_PATH)
    if not os.path.exists(path):
        raise ModelNotAvailableError(
            f"Artifact not found at: {path}\n"
            "Copy churnguard_churn_artifacts.pkl into backend/models_pkl/."
        )
    _artifacts = joblib.load(path)

try:
    _load()
except ModelNotAvailableError:
    pass   # Starts in degraded mode; predict() raises 503


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_risk_level(prob: float) -> str:
    if prob >= RISK_HIGH_THRESHOLD:
        return "HIGH"
    if prob >= RISK_MEDIUM_THRESHOLD:
        return "MEDIUM"
    return "LOW"


def _get_segment_label(cluster: int) -> str:
    labels = {
        0: "Segment 0",
        1: "Segment 1",
    }
    return labels.get(cluster, f"Segment {cluster}")


def _get_key_factors() -> list | None:
    """
    Extract top feature importances from the logistic regression coefficients.
    Returns the top 8 features by absolute coefficient weight, normalised.
    """
    if _artifacts is None:
        return None

    model = _artifacts["logistic_model"]
    preprocessor = _artifacts["preprocessor"]

    try:
        coef = model.coef_[0]                      # shape: (n_features,)
        abs_coef = np.abs(coef)
        total = abs_coef.sum()
        if total == 0:
            return None
        norm = abs_coef / total

        # Recover feature names from the ColumnTransformer
        try:
            feature_names = preprocessor.get_feature_names_out()
        except Exception:
            feature_names = [f"Feature {i}" for i in range(len(norm))]

        # Strip sklearn prefixes (e.g. "cat__Gender" → "Gender")
        clean_names = []
        for name in feature_names:
            parts = str(name).split("__", 1)
            clean_names.append(parts[-1] if len(parts) > 1 else name)

        pairs = sorted(zip(clean_names, norm.tolist()), key=lambda x: x[1], reverse=True)
        return [
            {"feature": name, "importance": round(imp, 4)}
            for name, imp in pairs[:8]
        ]
    except Exception:
        return None


# ── Public API ────────────────────────────────────────────────────────────────

def predict(data: dict) -> dict:
    """
    Run churn prediction + customer segmentation for a single customer.

    Parameters
    ----------
    data : dict
        Frontend form payload (camelCase keys from React).

    Returns
    -------
    dict with:
        prediction          int   (0 = no churn, 1 = churn)
        churn_probability   float (0–1)
        risk_level          str   ('LOW' | 'MEDIUM' | 'HIGH')
        model_used          str
        cluster             int
        segment_label       str
        key_factors         list[dict] | None
    """
    if _artifacts is None:
        raise ModelNotAvailableError(
            "ML artifact not loaded. "
            "Copy churnguard_churn_artifacts.pkl into backend/models_pkl/."
        )

    model        = _artifacts["logistic_model"]
    preprocessor = _artifacts["preprocessor"]
    kmeans       = _artifacts["kmeans_model"]
    scaler       = _artifacts["scaler"]
    seg_features = _artifacts["segmentation_features"]

    # ── Map frontend camelCase → exact training column names ─────────────────
    age    = int(data.get("age", 30))
    under30 = "Yes" if age < 30 else "No"

    row = {
        # Categorical (22 features — exact names from artifacts["categorical_features"])
        "Gender":                data.get("gender", "Male"),
        "Under 30":              under30,
        "Senior Citizen":        data.get("seniorCitizen", "No"),
        "Married":               data.get("married", "No"),
        "Dependents":            data.get("dependents", "No"),
        "Referred a Friend":     data.get("referredAFriend", "No"),
        "Offer":                 data.get("offer", "No Offer"),
        "Phone Service":         data.get("phoneService", "Yes"),
        "Multiple Lines":        data.get("multipleLines", "No"),
        "Internet Service":      data.get("internetService", "Yes"),
        "Internet Type":         data.get("internetType", "No Internet"),
        "Online Security":       data.get("onlineSecurity", "No"),
        "Online Backup":         data.get("onlineBackup", "No"),
        "Device Protection Plan": data.get("deviceProtectionPlan", "No"),
        "Premium Tech Support":  data.get("premiumTechSupport", "No"),
        "Streaming TV":          data.get("streamingTV", "No"),
        "Streaming Movies":      data.get("streamingMovies", "No"),
        "Streaming Music":       data.get("streamingMusic", "No"),
        "Unlimited Data":        data.get("unlimitedData", "No"),
        "Contract":              data.get("contract", "Month-to-Month"),
        "Paperless Billing":     data.get("paperlessBilling", "Yes"),
        "Payment Method":        data.get("paymentMethod", "Bank Withdrawal"),

        # Numerical (15 features — exact names from artifacts["numerical_features"])
        "Age":                             age,
        "Number of Dependents":            int(data.get("numberOfDependents", 0)),
        "Population":                      int(data.get("population", 10000)),
        "Number of Referrals":             int(data.get("numberOfReferrals", 0)),
        "Tenure in Months":                int(data.get("tenureInMonths", 0)),
        "Avg Monthly Long Distance Charges": float(data.get("avgMonthlyLongDistanceCharges", 0.0)),
        "Avg Monthly GB Download":         float(data.get("avgMonthlyGBDownload", 0.0)),
        "Monthly Charge":                  float(data.get("monthlyCharge", 0.0)),
        "Total Charges":                   float(data.get("totalCharges", 0.0)),
        "Total Refunds":                   float(data.get("totalRefunds", 0.0)),
        "Total Extra Data Charges":        float(data.get("totalExtraDataCharges", 0.0)),
        "Total Long Distance Charges":     float(data.get("totalLongDistanceCharges", 0.0)),
        "Total Revenue":                   float(data.get("totalRevenue", 0.0)),
        "Satisfaction Score":              int(data.get("satisfactionScore", 3)),
        "CLTV":                            float(data.get("cltv", 0.0)),
    }

    df = pd.DataFrame([row])

    # ── Churn prediction ──────────────────────────────────────────────────────
    X         = preprocessor.transform(df)
    pred      = int(model.predict(X)[0])
    prob      = float(model.predict_proba(X)[0][1])
    risk      = _get_risk_level(prob)

    # ── Segmentation ──────────────────────────────────────────────────────────
    seg_df     = df[seg_features]
    seg_scaled = scaler.transform(seg_df)
    cluster    = int(kmeans.predict(seg_scaled)[0])
    segment    = _get_segment_label(cluster)

    return {
        "prediction":        pred,
        "churn_probability": round(prob, 4),
        "risk_level":        risk,
        "model_used":        "Logistic Regression",
        "cluster":           cluster,
        "segment_label":     segment,
        "key_factors":       _get_key_factors(),
    }
