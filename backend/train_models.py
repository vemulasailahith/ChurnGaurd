"""
ChurnGuard — ML Training Script
================================
Run this script ONCE to train all models and save the artifacts
needed by the FastAPI backend.

Usage:
    python train_models.py

Prerequisites:
    - pip install -r requirements.txt
    - Place WA_Fn-UseC_-Telco-Customer-Churn.csv in backend/data/

Outputs (saved to backend/models_pkl/):
    - churn_model.pkl       Trained Logistic Regression (primary)
    - preprocessor.pkl      Fitted ColumnTransformer pipeline
    - kmeans_model.pkl      Trained K-Means (k=2)
"""

import os
import sys
import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DATA_PATH   = os.path.join(BASE_DIR, "data", "WA_Fn-UseC_-Telco-Customer-Churn.csv")
MODELS_DIR  = os.path.join(BASE_DIR, "models_pkl")
os.makedirs(MODELS_DIR, exist_ok=True)


def main():
    if not os.path.exists(DATA_PATH):
        print(f"\n❌  Dataset not found at: {DATA_PATH}")
        print("   Download from Kaggle: https://www.kaggle.com/datasets/blastchar/telco-customer-churn")
        print("   Place the CSV in backend/data/ and re-run this script.\n")
        sys.exit(1)

    print("\n📦  Loading dataset …")
    df = pd.read_csv(DATA_PATH)
    print(f"    {len(df)} rows, {len(df.columns)} columns")

    # ── Preprocessing ─────────────────────────────────────────────────────────
    # Fix TotalCharges (some rows are whitespace)
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df.dropna(subset=["TotalCharges"], inplace=True)

    # Target
    df["Churn_binary"] = (df["Churn"] == "Yes").astype(int)

    # Feature selection — these match FEATURE_COLUMNS in prediction_service.py
    categorical_binary = [
        "gender", "Partner", "Dependents", "PhoneService",
        "PaperlessBilling",
    ]
    categorical_multi = [
        "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup",
        "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
        "Contract", "PaymentMethod",
    ]
    numerical = ["SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges"]

    feature_cols = categorical_binary + categorical_multi + numerical
    X = df[feature_cols]
    y = df["Churn_binary"]

    # ColumnTransformer
    preprocessor = ColumnTransformer(transformers=[
        ("bin",  LabelEncoder_wrapper(categorical_binary),  categorical_binary),
        ("ohe",  OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_multi),
        ("num",  StandardScaler(),                          numerical),
    ])

    # Fit on full dataset for deployment; use train/test for evaluation
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("\n🔧  Fitting preprocessor …")
    preprocessor.fit(X_train)
    X_train_t = preprocessor.transform(X_train)
    X_test_t  = preprocessor.transform(X_test)

    # ── Train classifiers ─────────────────────────────────────────────────────
    classifiers = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest":       RandomForestClassifier(n_estimators=100, random_state=42),
        "Decision Tree":       DecisionTreeClassifier(random_state=42),
        "KNN":                 KNeighborsClassifier(n_neighbors=5),
    }

    best_model    = None
    best_model_nm = None
    best_roc_auc  = 0

    print("\n📊  Evaluating models …\n")
    print(f"  {'Model':<25}  {'Acc':>6}  {'Prec':>6}  {'Rec':>6}  {'F1':>6}  {'AUC':>6}")
    print("  " + "─" * 62)

    for name, clf in classifiers.items():
        clf.fit(X_train_t, y_train)
        y_pred  = clf.predict(X_test_t)
        y_proba = clf.predict_proba(X_test_t)[:, 1]

        acc  = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec  = recall_score(y_test, y_pred, zero_division=0)
        f1   = f1_score(y_test, y_pred, zero_division=0)
        auc  = roc_auc_score(y_test, y_proba)

        print(f"  {name:<25}  {acc:>6.4f}  {prec:>6.4f}  {rec:>6.4f}  {f1:>6.4f}  {auc:>6.4f}")

        if auc > best_roc_auc:
            best_roc_auc  = auc
            best_model    = clf
            best_model_nm = name

    print(f"\n  ✅  Best model by ROC-AUC: {best_model_nm} ({best_roc_auc:.4f})")

    # ── Save primary model & preprocessor ────────────────────────────────────
    print("\n💾  Saving artifacts …")
    model_path = os.path.join(MODELS_DIR, "churn_model.pkl")
    prep_path  = os.path.join(MODELS_DIR, "preprocessor.pkl")
    joblib.dump(best_model,    model_path)
    joblib.dump(preprocessor,  prep_path)
    print(f"    • {model_path}")
    print(f"    • {prep_path}")

    # ── K-Means clustering ────────────────────────────────────────────────────
    print("\n🔵  Training K-Means (k=2) …")
    cluster_features = ["tenure", "MonthlyCharges", "TotalCharges", "SeniorCitizen"]
    X_cluster = StandardScaler().fit_transform(df[cluster_features].fillna(0))
    kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
    kmeans.fit(X_cluster)

    labels        = kmeans.labels_
    sizes         = pd.Series(labels).value_counts().sort_index()
    print(f"    Cluster 0: {sizes.get(0, 0)} customers")
    print(f"    Cluster 1: {sizes.get(1, 0)} customers")

    kmeans_path = os.path.join(MODELS_DIR, "kmeans_model.pkl")
    joblib.dump(kmeans, kmeans_path)
    print(f"    • {kmeans_path}")

    print("\n✅  All artifacts saved. Start the backend with:\n")
    print("    uvicorn main:app --reload\n")


# ── Simple wrapper to make LabelEncoder work in ColumnTransformer ─────────────
from sklearn.base import BaseEstimator, TransformerMixin

class LabelEncoder_wrapper(BaseEstimator, TransformerMixin):
    def __init__(self, columns):
        self.columns = columns

    def fit(self, X, y=None):
        self.encoders_ = {}
        for col in self.columns:
            le = LabelEncoder()
            le.fit(X[col].astype(str))
            self.encoders_[col] = le
        return self

    def transform(self, X):
        X = X.copy()
        for col in self.columns:
            le = self.encoders_[col]
            X[col] = le.transform(X[col].astype(str))
        return X[self.columns].values

    def get_feature_names_out(self, input_features=None):
        return np.array(self.columns)


if __name__ == "__main__":
    main()
