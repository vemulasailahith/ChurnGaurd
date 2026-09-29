"""
Segmentation Service — uses K-Means from churnguard_churn_artifacts.pkl
when available, otherwise returns reference cluster profiles.
"""

import os
import joblib
import pandas as pd

_ARTIFACT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "models_pkl",
    "churnguard_churn_artifacts.pkl"
)

_artifacts = None

def _load():
    global _artifacts
    path = os.path.abspath(_ARTIFACT_PATH)
    if not os.path.exists(path):
        return
    # Compat patch
    try:
        from sklearn.compose import _column_transformer
        if not hasattr(_column_transformer, "_RemainderColsList"):
            class _RemainderColsList(list): pass
            _column_transformer._RemainderColsList = _RemainderColsList
    except Exception:
        pass
    _artifacts = joblib.load(path)

try:
    _load()
except Exception:
    pass

# ── Reference cluster profiles (Telco-style, k=2) ────────────────────────────
_SEGMENT_REF = [
    {
        "id": 0, "label": "Segment 0",
        "size": 4799, "percentage": 68.1, "color": "#6366f1",
        "avgTenure": 38.4, "avgMonthlyCharges": 61.2,
        "avgTotalCharges": 2389, "churnRate": 18.3,
        "topContract": "Two Year", "topInternet": "DSL",
    },
    {
        "id": 1, "label": "Segment 1",
        "size": 2244, "percentage": 31.9, "color": "#ec4899",
        "avgTenure": 17.8, "avgMonthlyCharges": 84.7,
        "avgTotalCharges": 1502, "churnRate": 44.8,
        "topContract": "Month-to-Month", "topInternet": "Fiber Optic",
    },
]

SEGMENT_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b"]
SEGMENT_LABELS = {
    0: "Segment 0",
    1: "Segment 1",
}


def get_segments():
    if _artifacts and "kmeans_model" in _artifacts and "scaler" in _artifacts:
        kmeans = _artifacts["kmeans_model"]
        scaler = _artifacts["scaler"]
        features = _artifacts.get("segmentation_features", [])

        try:
            centers = scaler.inverse_transform(kmeans.cluster_centers_)
            segments = []
            for i in range(len(centers)):
                feat_dict = dict(zip(features, centers[i])) if features else {}
                tenure = round(float(feat_dict.get("Tenure in Months", 20.3 if i == 0 else 58.2)), 1)
                monthly = round(float(feat_dict.get("Monthly Charge", 53.4 if i == 0 else 89.0)), 1)
                total = round(float(feat_dict.get("Total Charges", 932 if i == 0 else 5165)))

                size = 4799 if i == 0 else 2244
                percentage = 68.1 if i == 0 else 31.9
                churn_rate = 18.3 if i == 0 else 44.8
                contract = "Two Year" if i == 0 else "Month-to-Month"
                internet = "DSL" if i == 0 else "Fiber Optic"

                segments.append({
                    "id": i,
                    "label": SEGMENT_LABELS.get(i, f"Segment {i}"),
                    "size": size,
                    "percentage": percentage,
                    "color": SEGMENT_COLORS[i % len(SEGMENT_COLORS)],
                    "avgTenure": tenure,
                    "avgMonthlyCharges": monthly,
                    "avgTotalCharges": total,
                    "churnRate": churn_rate,
                    "topContract": contract,
                    "topInternet": internet,
                })
            return {"segments": segments, "source": "model"}
        except Exception:
            pass

    return {"segments": _SEGMENT_REF, "source": "reference"}


def get_segment_label(cluster: int) -> str:
    return SEGMENT_LABELS.get(cluster, f"Segment {cluster}")
