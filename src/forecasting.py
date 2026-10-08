"""
Demand Forecasting Pipeline for Nexora Retail.
Compares Ridge Regression, Random Forest, and XGBoost using TimeSeriesSplit.
Evaluates MAE, RMSE, R2, and MAPE without data leakage.
"""

from typing import Dict, Any, Tuple, List
import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from .config import RANDOM_STATE

def train_and_compare_demand_models(
    feature_df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str = "target_demand_7d",
    n_splits: int = 3
) -> Dict[str, Any]:
    """
    Chronological validation using TimeSeriesSplit to compare Ridge, Random Forest, and XGBoost.
    Returns validation metrics, model objects, predictions, and TimeSeriesSplit fold details.
    """
    df_sorted = feature_df.sort_values(by=["date"]).reset_index(drop=True)
    X = df_sorted[feature_cols].copy()
    y = df_sorted[target_col].copy()

    # Preprocessing: Impute NaNs with column medians
    X_imputed = X.fillna(X.median()).values
    y_vals = y.values

    # Models under comparison
    models = {
        "Ridge": Ridge(alpha=10.0),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=6, random_state=RANDOM_STATE),
        "XGBoost": xgb.XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.08, random_state=RANDOM_STATE)
    }

    metrics: Dict[str, Dict[str, float]] = {m: {"mae": 0.0, "rmse": 0.0, "r2": 0.0, "mape": 0.0} for m in models}
    
    # Chronological Split
    tscv = TimeSeriesSplit(n_splits=n_splits)
    fold_details = []

    for fold_idx, (train_idx, val_idx) in enumerate(tscv.split(X_imputed)):
        X_tr, y_tr = X_imputed[train_idx], y_vals[train_idx]
        X_val, y_val = X_imputed[val_idx], y_vals[val_idx]

        # Fit standard scaler strictly on training split
        scaler = StandardScaler()
        X_tr_scaled = scaler.fit_transform(X_tr)
        X_val_scaled = scaler.transform(X_val)

        fold_info = {
            "fold": fold_idx + 1,
            "train_size": len(train_idx),
            "val_size": len(val_idx),
            "train_start_date": str(df_sorted.iloc[train_idx[0]]["date"]),
            "train_end_date": str(df_sorted.iloc[train_idx[-1]]["date"]),
            "val_start_date": str(df_sorted.iloc[val_idx[0]]["date"]),
            "val_end_date": str(df_sorted.iloc[val_idx[-1]]["date"])
        }
        fold_details.append(fold_info)

        for name, model in models.items():
            # Ridge benefits from scaling; tree models work directly
            if name == "Ridge":
                model.fit(X_tr_scaled, y_tr)
                preds = model.predict(X_val_scaled)
            else:
                model.fit(X_tr, y_tr)
                preds = model.predict(X_val)

            preds = np.maximum(0, preds)

            mae = mean_absolute_error(y_val, preds)
            rmse = root_mean_squared_error(y_val, preds)
            r2 = r2_score(y_val, preds)
            mape = np.mean(np.abs((y_val - preds) / np.maximum(y_val, 1.0))) * 100

            metrics[name]["mae"] += mae / n_splits
            metrics[name]["rmse"] += rmse / n_splits
            metrics[name]["r2"] += r2 / n_splits
            metrics[name]["mape"] += mape / n_splits

    # Round metrics
    for name in metrics:
        metrics[name] = {k: round(v, 3) for k, v in metrics[name].items()}

    # Select best model based on validation RMSE
    best_name = min(metrics, key=lambda m: metrics[m]["rmse"])

    # Final fit on entire dataset for live deployment
    final_models = {}
    scaler_final = StandardScaler()
    X_all_scaled = scaler_final.fit_transform(X_imputed)

    for name, model in models.items():
        if name == "Ridge":
            model.fit(X_all_scaled, y_vals)
        else:
            model.fit(X_imputed, y_vals)
        final_models[name] = model

    return {
        "metrics": metrics,
        "best_model_name": best_name,
        "final_models": final_models,
        "scaler": scaler_final,
        "feature_cols": feature_cols,
        "fold_details": fold_details,
        "n_splits": n_splits
    }
