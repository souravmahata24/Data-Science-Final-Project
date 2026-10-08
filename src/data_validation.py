"""
Data Health, Readiness, and Validation Module for Nexora Retail.
Ensures zero runtime crashes, provides transparency into data quality,
and determines which downstream ML modules are enabled.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np

def run_health_check(df: pd.DataFrame, mapping: Dict[str, str]) -> Dict[str, Any]:
    """
    Comprehensive dataset health diagnostics:
    - Row count, column count
    - Date range
    - Product and customer counts
    - Missing value percentages
    - Duplicate rows
    - Invalid negative numbers
    - Small dataset warning evaluation
    """
    total_rows = len(df)
    total_cols = len(df.columns)
    duplicates = int(df.duplicated().sum())

    # Date validation
    date_col = mapping.get("date")
    date_min = None
    date_max = None
    invalid_dates = 0
    if date_col and date_col in df.columns:
        parsed_dates = pd.to_datetime(df[date_col], errors="coerce")
        invalid_dates = int(parsed_dates.isna().sum())
        valid_dates = parsed_dates.dropna()
        if not valid_dates.empty:
            date_min = valid_dates.min().strftime("%d %b %Y")
            date_max = valid_dates.max().strftime("%d %b %Y")

    # Product count
    prod_col = mapping.get("product_id")
    unique_products = int(df[prod_col].nunique()) if prod_col and prod_col in df.columns else 0

    # Customer count
    cust_col = mapping.get("customer_id")
    unique_customers = int(df[cust_col].nunique()) if cust_col and cust_col in df.columns else 0

    # Missing counts
    missing_counts = {col: int(df[col].isna().sum()) for col in df.columns}
    total_missing = sum(missing_counts.values())

    # Quantity checks
    qty_col = mapping.get("quantity_sold")
    invalid_quantities = 0
    if qty_col and qty_col in df.columns:
        numeric_qty = pd.to_numeric(df[qty_col], errors="coerce")
        invalid_quantities = int((numeric_qty.isna() | (numeric_qty < 0)).sum())

    # Small dataset warning
    is_small_dataset = total_rows < 100
    small_dataset_warning = None
    if is_small_dataset:
        small_dataset_warning = (
            f"Your dataset contains only {total_rows} records. This may be insufficient for "
            "reliable Machine Learning demand forecasting. Descriptive analysis is available, "
            "but predictive confidence intervals will be wider."
        )

    # Readiness checklist
    can_forecast = bool(date_col and prod_col and qty_col and total_rows >= 15)
    can_stock_risk = bool(can_forecast and mapping.get("current_inventory"))
    can_inventory_recom = bool(can_forecast and mapping.get("current_inventory") and mapping.get("supplier_lead_time"))
    can_customer_segment = bool(cust_col and qty_col and date_col and unique_customers >= 10)
    can_financial_roi = bool(mapping.get("selling_price") and mapping.get("product_cost"))

    readiness = {
        "sales_forecast": {"ready": can_forecast, "reason": "Requires date, product_id, and quantity_sold with >= 15 rows"},
        "stock_risk": {"ready": can_stock_risk, "reason": "Requires demand forecast + current_inventory column"},
        "inventory_recom": {"ready": can_inventory_recom, "reason": "Requires stock risk + supplier_lead_time"},
        "customer_intelligence": {"ready": can_customer_segment, "reason": "Requires customer_id with at least 10 unique customer records"},
        "business_impact": {"ready": can_financial_roi, "reason": "Requires selling_price and product_cost"}
    }

    return {
        "total_rows": total_rows,
        "total_cols": total_cols,
        "duplicates": duplicates,
        "date_min": date_min,
        "date_max": date_max,
        "invalid_dates": invalid_dates,
        "unique_products": unique_products,
        "unique_customers": unique_customers,
        "total_missing": total_missing,
        "missing_by_col": missing_counts,
        "invalid_quantities": invalid_quantities,
        "is_small_dataset": is_small_dataset,
        "small_dataset_warning": small_dataset_warning,
        "readiness": readiness
    }
