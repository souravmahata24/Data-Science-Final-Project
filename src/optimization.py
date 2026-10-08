"""
Inventory Decision Engine & Business Cost Model for Nexora Retail.
Translates Machine Learning demand forecasts into actionable purchase decisions.
All monetary calculations strictly use Indian Rupees (₹).
"""

from typing import Dict, Any
import numpy as np
from .config import (
    DEFAULT_HOLDING_COST_RATE,
    DEFAULT_STOCKOUT_PENALTY_MULT,
    DEFAULT_SERVICE_LEVEL_Z,
    DEFAULT_FORECAST_HORIZON_DAYS,
    format_inr
)

def compute_inventory_recommendation(
    predicted_demand_7d: float,
    current_inventory: float,
    supplier_lead_time_days: float = 5,
    demand_std_dev: float = 2.0,
    forecast_horizon_days: int = DEFAULT_FORECAST_HORIZON_DAYS,
    service_level_z: float = DEFAULT_SERVICE_LEVEL_Z
) -> Dict[str, Any]:
    """
    Transparent inventory decision layer:
    1. Expected Daily Demand = Predicted Demand / Forecast Period
    2. Lead-Time Demand = Daily Demand * Supplier Lead Time
    3. Safety Stock = z * std_dev * sqrt(Lead Time)
    4. Reorder Point = Lead-Time Demand + Safety Stock
    5. Recommended Purchase = max(0, Reorder Point - Current Inventory)
    """
    horizon = max(1, forecast_horizon_days)
    daily_demand = max(0.0, predicted_demand_7d / horizon)
    
    lead_time = max(1.0, float(supplier_lead_time_days))
    lead_time_demand = daily_demand * lead_time
    
    # Safety stock based on standard statistical buffer formula
    sigma = max(0.5, demand_std_dev)
    safety_stock = service_level_z * sigma * np.sqrt(lead_time)
    
    reorder_point = lead_time_demand + safety_stock
    recommended_level = int(np.ceil(reorder_point))
    
    current_inv = max(0.0, float(current_inventory))
    recommended_purchase = max(0, int(np.ceil(recommended_level - current_inv)))

    # Risk evaluation
    if current_inv < lead_time_demand:
        risk_level = "HIGH"
        risk_color = "red"
        explanation = (
            f"Current stock ({int(current_inv)} units) is below lead-time demand "
            f"({int(lead_time_demand)} units) across the {int(lead_time)}-day supplier cycle."
        )
    elif current_inv < reorder_point:
        risk_level = "MEDIUM"
        risk_color = "amber"
        explanation = (
            f"Current stock ({int(current_inv)} units) is below safety buffer ({recommended_level} units). "
            f"Replenishment is advised before buffer depletes."
        )
    else:
        risk_level = "LOW"
        risk_color = "emerald"
        explanation = (
            f"Current stock ({int(current_inv)} units) adequately satisfies expected demand "
            f"and safety reserves for the next cycle."
        )

    return {
        "predicted_demand": round(predicted_demand_7d, 1),
        "expected_daily_demand": round(daily_demand, 2),
        "supplier_lead_time_days": int(lead_time),
        "lead_time_demand": round(lead_time_demand, 1),
        "safety_stock": int(np.ceil(safety_stock)),
        "reorder_point": recommended_level,
        "recommended_level": recommended_level,
        "current_inventory": int(current_inv),
        "recommended_purchase": recommended_purchase,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "business_explanation": explanation
    }

def calculate_business_financials(
    recom: Dict[str, Any],
    selling_price: float,
    product_cost: float,
    annual_holding_cost_rate: float = DEFAULT_HOLDING_COST_RATE,
    stockout_penalty_mult: float = DEFAULT_STOCKOUT_PENALTY_MULT
) -> Dict[str, Any]:
    """
    Computes business ROI and financial impact in Indian Rupees (₹).
    Evaluates revenue protected, holding costs, and potential stockout losses.
    """
    price = max(1.0, float(selling_price))
    cost = max(0.5, float(product_cost))
    unit_margin = max(0.0, price - cost)

    pred_demand = recom["predicted_demand"]
    curr_stock = recom["current_inventory"]
    purchase = recom["recommended_purchase"]
    total_available = curr_stock + purchase

    # Expected units sold with and without optimization
    units_sold_without = min(curr_stock, pred_demand)
    units_sold_with = min(total_available, pred_demand)

    revenue_without = units_sold_without * price
    revenue_with = units_sold_with * price
    revenue_protected = max(0.0, revenue_with - revenue_without)

    gross_profit_with = (units_sold_with * price) - (units_sold_with * cost)

    # Holding cost for 7-day cycle: (annual_rate / 52) * average inventory cost
    cycle_holding_rate = annual_holding_cost_rate / 52.0
    holding_cost_with = total_available * cost * cycle_holding_rate
    holding_cost_without = curr_stock * cost * cycle_holding_rate

    # Potential stockout penalty (loss of customer lifetime goodwill beyond immediate margin)
    stockout_units_prevented = max(0.0, units_sold_with - units_sold_without)
    stockout_cost_avoided = stockout_units_prevented * unit_margin * stockout_penalty_mult

    # Excess inventory reduction: if current inventory is significantly above recommended level
    excess_units = max(0, curr_stock - recom["recommended_level"])
    excess_capital_tied_up = excess_units * cost
    excess_holding_savings = excess_units * cost * cycle_holding_rate

    # Net estimated business impact
    net_business_impact = stockout_cost_avoided + excess_holding_savings

    return {
        "selling_price_inr": format_inr(price),
        "product_cost_inr": format_inr(cost),
        "unit_margin_inr": format_inr(unit_margin),
        "revenue_without_inr": format_inr(revenue_without),
        "expected_revenue_inr": format_inr(revenue_with),
        "revenue_protected_inr": format_inr(revenue_protected),
        "gross_profit_inr": format_inr(gross_profit_with),
        "holding_cost_inr": format_inr(holding_cost_with),
        "stockout_cost_avoided_inr": format_inr(stockout_cost_avoided),
        "excess_capital_freed_inr": format_inr(excess_capital_tied_up),
        "potential_savings_inr": format_inr(net_business_impact),
        "net_business_impact_raw": net_business_impact,
        "revenue_protected_raw": revenue_protected,
        "excess_capital_raw": excess_capital_tied_up
    }
