"""
Feature Engineering Pipeline for Nexora Retail.
Engineers chronological lag features, rolling statistics, calendar indicators,
and customer RFM profiles without target leakage.
"""

from typing import Dict, Tuple, List
import pandas as pd
import numpy as np

def build_demand_features(df: pd.DataFrame, mapping: Dict[str, str]) -> pd.DataFrame:
    """
    Constructs leak-free chronological features for daily product sales forecasting.
    Target: Future 7-day demand (or 1-day step).
    Features strictly use past observations (shift >= 1).
    """
    date_col = mapping["date"]
    prod_col = mapping["product_id"]
    qty_col = mapping["quantity_sold"]

    # Daily aggregation per product to ensure regular time series
    daily = df.groupby([prod_col, date_col]).agg({
        qty_col: "sum"
    }).reset_index()

    daily = daily.sort_values(by=[prod_col, date_col]).reset_index(drop=True)

    # Lags (strictly shift(1) or more to prevent leakage)
    daily["lag_1"] = daily.groupby(prod_col)[qty_col].shift(1)
    daily["lag_7"] = daily.groupby(prod_col)[qty_col].shift(7)
    daily["lag_14"] = daily.groupby(prod_col)[qty_col].shift(14)
    daily["lag_30"] = daily.groupby(prod_col)[qty_col].shift(30)

    # Rolling statistics over strictly shifted data
    daily["rolling_mean_7"] = daily.groupby(prod_col)[qty_col].transform(
        lambda s: s.shift(1).rolling(window=7, min_periods=2).mean()
    )
    daily["rolling_mean_14"] = daily.groupby(prod_col)[qty_col].transform(
        lambda s: s.shift(1).rolling(window=14, min_periods=3).mean()
    )
    daily["rolling_mean_30"] = daily.groupby(prod_col)[qty_col].transform(
        lambda s: s.shift(1).rolling(window=30, min_periods=5).mean()
    )
    daily["rolling_std_7"] = daily.groupby(prod_col)[qty_col].transform(
        lambda s: s.shift(1).rolling(window=7, min_periods=2).std()
    )

    # Trend and Velocity
    daily["sales_growth_7"] = (daily["lag_1"] - daily["lag_7"]) / (daily["lag_7"] + 1.0)
    daily["sales_velocity"] = daily["lag_1"] / (daily["rolling_mean_7"] + 0.1)

    # Calendar features
    dates = pd.to_datetime(daily[date_col])
    daily["day_of_week"] = dates.dt.dayofweek
    daily["is_weekend"] = dates.dt.dayofweek.isin([5, 6]).astype(int)
    daily["month"] = dates.dt.month
    daily["day_of_month"] = dates.dt.day

    # Merge product-level attributes (price, cost, lead time, category) if available
    attr_cols = []
    for canonical in ["selling_price", "product_cost", "supplier_lead_time", "category", "current_inventory"]:
        col = mapping.get(canonical)
        if col and col in df.columns:
            attr_cols.append(col)

    if attr_cols:
        prod_meta = df.groupby(prod_col)[attr_cols].last().reset_index()
        daily = daily.merge(prod_meta, on=prod_col, how="left")

    # Target: 7-day future sum for medium-term stock reordering, or next-day demand
    # Here we define target as next 7-day cumulative sales
    daily["target_demand_7d"] = daily.groupby(prod_col)[qty_col].transform(
        lambda s: s.rolling(window=7).sum().shift(-6)
    )

    # Stockout classification target: 1 if current inventory < target_demand_7d, else 0
    inv_col = mapping.get("current_inventory")
    if inv_col and inv_col in daily.columns:
        daily["target_stockout_7d"] = (daily[inv_col] < daily["target_demand_7d"]).astype(int)
        daily["inventory_coverage_days"] = daily[inv_col] / (daily["rolling_mean_7"] + 0.1)
    else:
        daily["target_stockout_7d"] = 0
        daily["inventory_coverage_days"] = 10.0

    # Drop rows without sufficient history (impute or clean)
    daily["rolling_std_7"] = daily["rolling_std_7"].fillna(0)
    daily["lag_1"] = daily["lag_1"].fillna(daily[qty_col].median())
    daily["lag_7"] = daily["lag_7"].fillna(daily["lag_1"])
    daily["lag_14"] = daily["lag_14"].fillna(daily["lag_7"])
    daily["lag_30"] = daily["lag_30"].fillna(daily["lag_14"])
    daily["rolling_mean_7"] = daily["rolling_mean_7"].fillna(daily["lag_1"])
    daily["rolling_mean_14"] = daily["rolling_mean_14"].fillna(daily["rolling_mean_7"])
    daily["rolling_mean_30"] = daily["rolling_mean_30"].fillna(daily["rolling_mean_14"])
    daily["sales_growth_7"] = daily["sales_growth_7"].fillna(0)
    daily["sales_velocity"] = daily["sales_velocity"].fillna(1.0)

    # Filter rows where target is valid
    daily_ready = daily.dropna(subset=["target_demand_7d"]).copy()
    return daily_ready

def build_rfm_features(df: pd.DataFrame, mapping: Dict[str, str]) -> pd.DataFrame:
    """
    Constructs customer RFM + behavior features:
    - Recency (days since last purchase)
    - Frequency (total orders)
    - Monetary (total revenue spent)
    - Average Order Value (AOV)
    - Discount Sensitivity (average discount taken)
    - Category Diversity (unique categories shopped)
    """
    cust_col = mapping["customer_id"]
    date_col = mapping["date"]
    qty_col = mapping["quantity_sold"]
    price_col = mapping.get("selling_price")
    disc_col = mapping.get("discount")
    cat_col = mapping.get("category")

    ref_date = pd.to_datetime(df[date_col]).max() + pd.Timedelta(days=1)

    temp = df.copy()
    temp["item_revenue"] = temp[qty_col] * (temp[price_col] if price_col and price_col in temp.columns else 1000)

    # Base RFM
    rfm = temp.groupby(cust_col).agg(
        recency=(date_col, lambda d: (ref_date - pd.to_datetime(d).max()).days),
        frequency=(date_col, "count"),
        monetary=("item_revenue", "sum")
    ).reset_index()

    rfm["avg_order_value"] = rfm["monetary"] / np.maximum(rfm["frequency"], 1)

    # Discount sensitivity
    if disc_col and disc_col in temp.columns:
        disc_sens = temp.groupby(cust_col)[disc_col].mean().reset_index().rename(columns={disc_col: "discount_sensitivity"})
        rfm = rfm.merge(disc_sens, on=cust_col, how="left")
    else:
        rfm["discount_sensitivity"] = 0.05

    # Category diversity
    if cat_col and cat_col in temp.columns:
        cat_div = temp.groupby(cust_col)[cat_col].nunique().reset_index().rename(columns={cat_col: "category_diversity"})
        rfm = rfm.merge(cat_div, on=cust_col, how="left")
    else:
        rfm["category_diversity"] = 1

    return rfm
