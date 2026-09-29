# ChurnGuard — Model Artifacts Directory

This directory stores trained model artifacts loaded by the FastAPI backend.

## Required Files

| File                  | Description                                              |
|-----------------------|----------------------------------------------------------|
| `churn_model.pkl`     | Trained churn classifier (LogisticRegression / RF / etc) |
| `preprocessor.pkl`    | Fitted ColumnTransformer pipeline from training          |
| `kmeans_model.pkl`    | Trained K-Means model (k=2) for customer segmentation    |

## How to Generate

1. Download the dataset (see `backend/data/README.md`)
2. Run the training script from the `backend/` directory:

```bash
cd backend
python train_models.py
```

The script will:
- Load and preprocess the Telco dataset
- Train Logistic Regression, Random Forest, Decision Tree, and KNN
- Evaluate all models and print a comparison table
- Save the best model + preprocessor + K-Means to this directory

## Without Model Files

If the pkl files are absent:
- `POST /api/predict/churn` returns HTTP 503 with a clear error message
- All analytics and segmentation endpoints still work (use reference data)
- The frontend shows a user-friendly "model not available" error
