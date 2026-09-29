"""
Analytics Service — provides dataset-derived analytics data.

When the Telco dataset CSV is present at data/WA_Fn-UseC_-Telco-Customer-Churn.csv,
analytics are computed from the actual data. Otherwise, documented reference values
from the Telco Customer Churn dataset are returned.
"""

import os
import pandas as pd

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data",
                         "WA_Fn-UseC_-Telco-Customer-Churn.csv")

_df = None


def _load_data():
    global _df
    if _df is None and os.path.exists(DATA_PATH):
        _df = pd.read_csv(DATA_PATH)
        # Normalise TotalCharges
        _df["TotalCharges"] = pd.to_numeric(_df["TotalCharges"], errors="coerce").fillna(0)
        _df["Churn_binary"] = (_df["Churn"] == "Yes").astype(int)
    return _df


# ── Reference values from Telco dataset (used when CSV is absent) ─────────────
_OVERVIEW_REF = {
    "totalCustomers":   7043,
    "churnedCustomers": 1869,
    "retainedCustomers": 5174,
    "churnRate":        26.54,
    "customerSegments": 2,
}

_CONTRACT_REF = [
    {"contract": "Month-to-Month", "churned": 1655, "retained": 2220},
    {"contract": "One Year",       "churned": 166,  "retained": 1307},
    {"contract": "Two Year",       "churned": 48,   "retained": 1647},
]

_TENURE_REF = [
    {"group": "0–12 mo",  "churnRate": 47.7},
    {"group": "13–24 mo", "churnRate": 32.4},
    {"group": "25–36 mo", "churnRate": 22.1},
    {"group": "37–48 mo", "churnRate": 19.3},
    {"group": "49–60 mo", "churnRate": 14.8},
    {"group": "61–72 mo", "churnRate": 9.6},
]

_INTERNET_REF = [
    {"service": "Fiber Optic", "churned": 1297, "retained": 1799},
    {"service": "DSL",         "churned": 459,  "retained": 1962},
    {"service": "No Service",  "churned": 113,  "retained": 1413},
]

_PAYMENT_REF = [
    {"method": "Electronic Check",     "churnRate": 45.3},
    {"method": "Mailed Check",         "churnRate": 19.1},
    {"method": "Bank Transfer (auto)", "churnRate": 16.7},
    {"method": "Credit Card (auto)",   "churnRate": 15.2},
]

_SENIOR_REF = [
    {"group": "Non-Senior", "churned": 1393, "retained": 4508},
    {"group": "Senior",     "churned": 476,  "retained": 666},
]

_PARTNER_REF = [
    {"group": "Has Partner",    "churnRate": 19.7},
    {"group": "No Partner",     "churnRate": 33.0},
    {"group": "Has Dependents", "churnRate": 15.5},
    {"group": "No Dependents",  "churnRate": 31.3},
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _tenure_group(t):
    if t <= 12:  return "0–12 mo"
    if t <= 24:  return "13–24 mo"
    if t <= 36:  return "25–36 mo"
    if t <= 48:  return "37–48 mo"
    if t <= 60:  return "49–60 mo"
    return "61–72 mo"


# ── Public API ────────────────────────────────────────────────────────────────

def get_overview():
    df = _load_data()
    if df is None:
        return _OVERVIEW_REF

    total    = len(df)
    churned  = int(df["Churn_binary"].sum())
    retained = total - churned
    rate     = round(churned / total * 100, 2)
    return {
        "totalCustomers":   total,
        "churnedCustomers": churned,
        "retainedCustomers": retained,
        "churnRate":        rate,
        "customerSegments": 2,
    }


def get_churn_by_contract():
    df = _load_data()
    if df is None:
        return _CONTRACT_REF

    result = []
    for contract, group in df.groupby("Contract"):
        result.append({
            "contract": contract,
            "churned":  int((group["Churn"] == "Yes").sum()),
            "retained": int((group["Churn"] == "No").sum()),
        })
    return result


def get_churn_by_tenure():
    df = _load_data()
    if df is None:
        return _TENURE_REF

    df = df.copy()
    df["tenure_group"] = df["tenure"].apply(_tenure_group)
    groups = ["0–12 mo", "13–24 mo", "25–36 mo", "37–48 mo", "49–60 mo", "61–72 mo"]
    result = []
    for g in groups:
        sub = df[df["tenure_group"] == g]
        if len(sub) == 0:
            continue
        rate = round(sub["Churn_binary"].mean() * 100, 1)
        result.append({"group": g, "churnRate": rate})
    return result


def get_churn_by_internet():
    df = _load_data()
    if df is None:
        return _INTERNET_REF

    result = []
    for service, group in df.groupby("InternetService"):
        label = "No Service" if service == "No" else service
        result.append({
            "service":  label,
            "churned":  int((group["Churn"] == "Yes").sum()),
            "retained": int((group["Churn"] == "No").sum()),
        })
    return result


def get_churn_by_payment():
    df = _load_data()
    if df is None:
        return _PAYMENT_REF

    result = []
    for method, group in df.groupby("PaymentMethod"):
        rate = round(group["Churn_binary"].mean() * 100, 1)
        result.append({"method": method, "churnRate": rate})
    return result


def get_churn_by_senior():
    df = _load_data()
    if df is None:
        return _SENIOR_REF

    result = []
    for senior, group in df.groupby("SeniorCitizen"):
        label = "Senior" if senior == 1 else "Non-Senior"
        result.append({
            "group":    label,
            "churned":  int((group["Churn"] == "Yes").sum()),
            "retained": int((group["Churn"] == "No").sum()),
        })
    return result


def get_churn_by_partner():
    df = _load_data()
    if df is None:
        return _PARTNER_REF

    result = [
        {"group": "Has Partner",    "churnRate": round(df[df["Partner"] == "Yes"]["Churn_binary"].mean() * 100, 1)},
        {"group": "No Partner",     "churnRate": round(df[df["Partner"] == "No"]["Churn_binary"].mean() * 100, 1)},
        {"group": "Has Dependents", "churnRate": round(df[df["Dependents"] == "Yes"]["Churn_binary"].mean() * 100, 1)},
        {"group": "No Dependents",  "churnRate": round(df[df["Dependents"] == "No"]["Churn_binary"].mean() * 100, 1)},
    ]
    return result
