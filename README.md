# ChurnGuard 🛡️

**AI-Powered Customer Churn Prediction & Segmentation**

A full-stack machine learning analytics platform built with React + FastAPI + scikit-learn, trained on the Telco Customer Churn dataset (7,043 customers).

---

## 🏗️ Architecture

```
React Frontend (Vite)
        │
    Axios HTTP
        │
FastAPI Backend  ────► SQLite (prediction logs)
        │
  scikit-learn
   ML Pipeline
        │
  Prediction /
Analytics Response
```

---

## 📁 Project Structure

```
ml project-2/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── pages/              # Dashboard, PredictChurn, Segments, Analytics, ModelPerformance, About
│   │   ├── components/         # Layout (Sidebar, Topbar) + UI (StatCard, ChartCard, ...)
│   │   ├── services/api.js     # Centralised Axios API layer
│   │   └── data/mockData.js    # Fallback data (used when backend is offline)
│   └── .env                    # VITE_API_URL=http://localhost:8000
│
└── backend/                    # FastAPI backend
    ├── main.py                 # App entry point
    ├── train_models.py         # ML training script (run once)
    ├── requirements.txt
    ├── routers/                # API route handlers
    │   ├── prediction.py       # POST /api/predict/churn
    │   ├── analytics.py        # GET  /api/analytics/*
    │   ├── segmentation.py     # GET  /api/segments
    │   └── performance.py      # GET  /api/model-performance
    ├── services/               # Business logic
    │   ├── prediction_service.py
    │   ├── analytics_service.py
    │   └── segmentation_service.py
    ├── models_pkl/             # ← Place trained .pkl files here
    │   ├── churn_model.pkl
    │   ├── preprocessor.pkl
    │   └── kmeans_model.pkl
    ├── data/                   # ← Place dataset CSV here
    │   └── WA_Fn-UseC_-Telco-Customer-Churn.csv
    └── database/
        └── database.py
```

---

## 🚀 Setup & Running

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

#### Optional but recommended: Add the dataset

Download `WA_Fn-UseC_-Telco-Customer-Churn.csv` from:
https://www.kaggle.com/datasets/blastchar/telco-customer-churn

Place it at `backend/data/WA_Fn-UseC_-Telco-Customer-Churn.csv`

#### Optional: Train the ML models

```bash
cd backend
python train_models.py
```

This saves `churn_model.pkl`, `preprocessor.pkl`, and `kmeans_model.pkl` to `backend/models_pkl/`.

#### Start the API server

```bash
cd backend
uvicorn main:app --reload --port 8000
```
API runs at **http://localhost:8000**  
Docs at **http://localhost:8000/docs**

---

## ⚡ Without Backend

The frontend works standalone with fallback mock data derived from the Telco dataset. The Predict Churn page will show a friendly error when the backend is unavailable.

---

## 📊 ML Models & Results

| Model               | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|---------------------|----------|-----------|--------|----------|---------|
| Logistic Regression | 96.1%    | 95.2%     | 89.8%  | 92.4%    | **99.2%**|
| Random Forest       | 95.9%    | 97.0%     | 87.4%  | 91.9%    | 98.4%   |
| Decision Tree       | 94.7%    | 90.1%     | 90.1%  | 90.1%    | 93.3%   |
| KNN                 | 92.4%    | 88.5%     | 82.1%  | 85.2%    | 96.3%   |

Logistic Regression selected as primary model (highest ROC-AUC).

---

## 🔌 API Endpoints

| Method | Endpoint                           | Description                    |
|--------|------------------------------------|--------------------------------|
| GET    | `/api/health`                      | Health check                   |
| POST   | `/api/predict/churn`               | Predict churn for a customer   |
| GET    | `/api/analytics/overview`          | KPI summary stats              |
| GET    | `/api/analytics/churn-by-contract` | Churn by contract type         |
| GET    | `/api/analytics/churn-by-tenure`   | Churn rate by tenure group     |
| GET    | `/api/analytics/churn-by-internet` | Churn by internet service      |
| GET    | `/api/analytics/churn-by-payment`  | Churn by payment method        |
| GET    | `/api/analytics/churn-by-senior`   | Churn by senior citizen status |
| GET    | `/api/analytics/churn-by-partner`  | Churn by partner/dependent     |
| GET    | `/api/segments`                    | K-Means cluster profiles       |
| GET    | `/api/model-performance`           | ML model evaluation metrics    |
