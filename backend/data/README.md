# ChurnGuard — Data Directory

Place the Telco Customer Churn dataset CSV here:

```
backend/data/WA_Fn-UseC_-Telco-Customer-Churn.csv
```

## Download

1. Go to: https://www.kaggle.com/datasets/blastchar/telco-customer-churn
2. Download `WA_Fn-UseC_-Telco-Customer-Churn.csv`
3. Place it in this `data/` directory

Once the dataset is here:
- Analytics endpoints will compute real statistics from the data
- `train_models.py` can be run to train and save all ML models

## Without the dataset

If the CSV is absent:
- Analytics endpoints return documented reference values from the Telco dataset
- Segmentation returns reference cluster profiles
- The ML prediction endpoint requires `models_pkl/churn_model.pkl` (see below)
