"""
Configuration, Constants, and Business Assumptions for Nexora Retail.
All monetary figures strictly use Indian Rupees (₹).
"""

from typing import Dict, List

# Core Business & Currency Constants
CURRENCY_SYMBOL = "₹"
RANDOM_STATE = 42

# Column Requirements
REQUIRED_COLUMNS: List[str] = ["date", "product_id", "quantity_sold"]
RECOMMENDED_COLUMNS: List[str] = [
    "customer_id",
    "current_inventory",
    "selling_price",
    "product_cost",
    "supplier_lead_time"
]
OPTIONAL_COLUMNS: List[str] = [
    "product_name",
    "category",
    "store_id",
    "discount",
    "promotion"
]

# Column Detection Heuristics
COLUMN_SYNONYMS: Dict[str, List[str]] = {
    "date": ["date", "sale_date", "order_date", "invoicedate", "trans_date", "transaction_date", "timestamp"],
    "product_id": ["product_id", "sku", "product_code", "item_id", "item_code", "product"],
    "product_name": ["product_name", "item_name", "title", "description", "product"],
    "quantity_sold": ["quantity_sold", "qty", "qty_sold", "units", "quantity", "volume", "sales_volume"],
    "customer_id": ["customer_id", "customer_no", "cust_id", "client_id", "user_id"],
    "current_inventory": ["current_inventory", "stock_on_hand", "stock", "inventory", "stock_level", "available_stock"],
    "selling_price": ["selling_price", "price", "unit_price", "mrp", "sale_price", "revenue_per_unit"],
    "product_cost": ["product_cost", "cost", "unit_cost", "cogs", "wholesale_price", "purchase_price"],
    "supplier_lead_time": ["supplier_lead_time", "lead_time", "lead_time_days", "delivery_days"],
    "category": ["category", "dept", "department", "product_group", "item_category"],
    "store_id": ["store_id", "store", "location", "outlet_id", "branch"],
    "discount": ["discount", "disc_pct", "discount_rate", "discount_amount"],
    "promotion": ["promotion", "promo", "is_promo", "promotional", "campaign"]
}

# Inventory Engine Default Parameters
DEFAULT_HOLDING_COST_RATE = 0.18    # 18% annual holding cost rate (~1.5% per month)
DEFAULT_STOCKOUT_PENALTY_MULT = 1.25 # 1.25x lost gross profit penalty for brand churn
DEFAULT_SERVICE_LEVEL_Z = 1.645     # 95% service level standard normal z-score
DEFAULT_FORECAST_HORIZON_DAYS = 7   # 7-day tactical inventory cycle

# Indian Currency Formatting Helper
def format_inr(amount: float) -> str:
    """Format floating point numbers into standard Indian numbering notation."""
    if amount is None or amount == 0:
        return "₹0"
    is_neg = amount < 0
    val = abs(amount)
    
    if val >= 10_000_000:
        crores = val / 10_000_000
        res = f"₹{crores:.2f} crore"
    elif val >= 100_000:
        lakhs = val / 100_000
        res = f"₹{lakhs:.2f} lakh"
    else:
        # Standard Indian comma grouping: last 3 digits, then groups of 2
        s = f"{int(round(val)):,}"
        # Adjust western comma format to Indian if > 99,999
        parts = s.split(",")
        if len(parts) > 2:
            last3 = parts[-1]
            rest = "".join(parts[:-1])
            res_str = ""
            while len(rest) > 2:
                res_str = "," + rest[-2:] + res_str
                rest = rest[:-2]
            res_str = rest + res_str + "," + last3
            res = f"₹{res_str}"
        else:
            res = f"₹{s}"
    return f"-{res}" if is_neg else res
