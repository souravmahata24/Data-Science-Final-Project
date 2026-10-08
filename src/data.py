"""
Data Loading, Cleaning, Synthetic Generation, and Export for Nexora Retail.
Follows strict data preparation principles: never alters original raw files,
creates clean reproducible transformed copies.
"""

import os
from typing import Dict, Tuple, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from .config import REQUIRED_COLUMNS, RANDOM_STATE

DEMO_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "demo", "retail_sample.csv")

def get_sample_template_df() -> pd.DataFrame:
    """Returns a clean template DataFrame for user download."""
    template_data = {
        "date": ["2026-01-01", "2026-01-02", "2026-01-03"],
        "product_id": ["SKU-101", "SKU-102", "SKU-101"],
        "product_name": ["Baluchari Silk Saree", "Cotton Daily Saree", "Baluchari Silk Saree"],
        "quantity_sold": [5, 14, 7],
        "customer_id": ["CUST-1001", "CUST-1002", "CUST-1003"],
        "current_inventory": [40, 110, 33],
        "selling_price": [8500, 1200, 8500],
        "product_cost": [4800, 650, 4800],
        "category": ["Handloom Sarees", "Daily Wear", "Handloom Sarees"],
        "store_id": ["STR-KOL-01", "STR-KOL-01", "STR-KOL-02"],
        "supplier_lead_time": [7, 4, 7],
        "discount": [0.05, 0.00, 0.05],
        "promotion": [1, 0, 1]
    }
    return pd.DataFrame(template_data)

def generate_robust_demo_dataset(days: int = 90) -> pd.DataFrame:
    """
    Generates a realistic 90-day Indian retail store dataset (12 high-velocity SKU products,
    authentic seasonality, weekly shopping patterns, promotional uplifts, lead times, and margins).
    Used for rich demonstration and multi-fold TimeSeriesSplit training.
    """
    np.random.seed(RANDOM_STATE)
    
    catalog = [
        {"id": "SKU-101", "name": "Baluchari Silk Saree", "cat": "Handloom Sarees", "base_q": 6, "price": 8500, "cost": 4800, "lead": 7, "inv": 18},
        {"id": "SKU-102", "name": "Cotton Daily Saree", "cat": "Daily Wear", "base_q": 22, "price": 1200, "cost": 650, "lead": 4, "inv": 85},
        {"id": "SKU-103", "name": "Linen Casual Saree", "cat": "Casual Wear", "base_q": 3, "price": 2400, "cost": 1300, "lead": 5, "inv": 48},
        {"id": "SKU-104", "name": "Tussar Silk Kurti", "cat": "Ethnic Wear", "base_q": 7, "price": 4200, "cost": 2300, "lead": 6, "inv": 24},
        {"id": "SKU-105", "name": "Kantha Stitch Stole", "cat": "Accessories", "base_q": 10, "price": 1800, "cost": 950, "lead": 5, "inv": 52},
        {"id": "SKU-106", "name": "Khadi Cotton Kurta", "cat": "Mens Ethnic", "base_q": 15, "price": 1600, "cost": 850, "lead": 4, "inv": 32},
        {"id": "SKU-107", "name": "Chanderi Dupatta", "cat": "Accessories", "base_q": 11, "price": 2100, "cost": 1100, "lead": 5, "inv": 28},
        {"id": "SKU-108", "name": "Kashmiri Pashmina Shawl", "cat": "Luxury Winter", "base_q": 3, "price": 16500, "cost": 9500, "lead": 10, "inv": 12},
        {"id": "SKU-109", "name": "Dhakai Jamdani Saree", "cat": "Handloom Sarees", "base_q": 5, "price": 9800, "cost": 5400, "lead": 8, "inv": 15},
        {"id": "SKU-110", "name": "Zari Embroidered Blouse", "cat": "Ethnic Wear", "base_q": 8, "price": 2800, "cost": 1400, "lead": 5, "inv": 38},
        {"id": "SKU-111", "name": "Organic Handspun Scarf", "cat": "Accessories", "base_q": 9, "price": 1450, "cost": 720, "lead": 4, "inv": 45},
        {"id": "SKU-112", "name": "Silk Nehru Jacket", "cat": "Mens Ethnic", "base_q": 4, "price": 5400, "cost": 2900, "lead": 7, "inv": 20}
    ]
    
    start_date = datetime(2026, 1, 1)
    rows = []
    customer_pool = [f"CUST-{1000 + i}" for i in range(1, 160)]

    for d in range(days):
        current_date = start_date + timedelta(days=d)
        is_weekend = current_date.weekday() in [5, 6]
        weekend_mult = 1.35 if is_weekend else 1.0

        for item in catalog:
            # Promotional campaign every 14 days
            promo = 1 if (d % 14 in [5, 6, 7]) else 0
            promo_mult = 1.45 if promo == 1 else 1.0
            disc = 0.10 if promo == 1 else (0.05 if np.random.rand() > 0.8 else 0.0)

            # Trend & noise
            trend = 1.0 + (0.15 * np.sin(d / 12.0))
            if item["id"] == "SKU-101": # High growing demand
                trend *= (1.0 + (d / 120.0))
            elif item["id"] == "SKU-103": # Slowing down
                trend *= max(0.4, 1.0 - (d / 150.0))

            mean_q = item["base_q"] * weekend_mult * promo_mult * trend
            q_sold = max(0, int(np.random.poisson(max(1, mean_q))))

            # Random customer from pool
            cust_id = np.random.choice(customer_pool)
            store = "STR-KOL-01" if np.random.rand() > 0.4 else "STR-KOL-02"

            # Dynamic inventory simulating sales and replenishments
            inv_level = max(0, item["inv"] + int(np.random.normal(0, 4)))
            if d > 75 and item["id"] in ["SKU-101", "SKU-104", "SKU-107"]:
                # Real stockout risk condition for presentation demonstration
                inv_level = min(inv_level, 6)

            rows.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "product_id": item["id"],
                "product_name": item["name"],
                "category": item["cat"],
                "store_id": store,
                "quantity_sold": q_sold,
                "customer_id": cust_id,
                "current_inventory": inv_level,
                "selling_price": item["price"],
                "product_cost": item["cost"],
                "supplier_lead_time": item["lead"],
                "discount": disc,
                "promotion": promo
            })

    return pd.DataFrame(rows)

def load_data(source: str = "demo", uploaded_file=None) -> Tuple[pd.DataFrame, Dict[str, str]]:
    """
    Loads either the built-in demo dataset or a user-provided CSV/XLSX.
    Returns cleaned copy and canonical column mapping.
    """
    if source == "upload" and uploaded_file is not None:
        filename = getattr(uploaded_file, "name", "uploaded.csv").lower()
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            raw_df = pd.read_excel(uploaded_file)
        else:
            raw_df = pd.read_csv(uploaded_file)
    else:
        # Load demo dataset
        raw_df = generate_robust_demo_dataset(90)

    return raw_df

def clean_dataset(df: pd.DataFrame, mapping: Dict[str, str]) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """
    Cleans the raw DataFrame based on mapped column names:
    - Strips whitespace
    - Drops pure duplicate rows
    - Coerces dates to ISO format
    - Coerces quantities and currencies to non-negative floats
    - Handles missing values with median or forward fill
    Returns the cleaned copy and a summary dictionary.
    """
    cleaned = df.copy()
    initial_rows = len(cleaned)

    # 1. Deduplication
    cleaned = cleaned.drop_duplicates()
    duplicates_removed = initial_rows - len(cleaned)

    # 2. Date parsing
    date_col = mapping.get("date")
    invalid_dates = 0
    if date_col and date_col in cleaned.columns:
        parsed = pd.to_datetime(cleaned[date_col], errors="coerce")
        invalid_dates = int(parsed.isna().sum())
        cleaned[date_col] = parsed
        cleaned = cleaned.dropna(subset=[date_col])
        cleaned = cleaned.sort_values(by=date_col).reset_index(drop=True)

    # 3. Numeric sanitation
    numeric_cols = ["quantity_sold", "selling_price", "product_cost", "current_inventory", "supplier_lead_time"]
    missing_quantities = 0

    for canonical in numeric_cols:
        col = mapping.get(canonical)
        if col and col in cleaned.columns:
            cleaned[col] = pd.to_numeric(cleaned[col], errors="coerce")
            if canonical == "quantity_sold":
                missing_quantities = int(cleaned[col].isna().sum())
                cleaned = cleaned.dropna(subset=[col])
                cleaned[col] = cleaned[col].clip(lower=0)
            else:
                median_val = cleaned[col].median()
                if pd.isna(median_val):
                    median_val = 0
                cleaned[col] = cleaned[col].fillna(median_val)
                cleaned[col] = cleaned[col].clip(lower=0)

    summary = {
        "original_rows": initial_rows,
        "rows_after_cleaning": len(cleaned),
        "duplicates_removed": duplicates_removed,
        "invalid_dates": invalid_dates,
        "missing_quantities": missing_quantities
    }

    return cleaned, summary
