"""
Master Model Orchestration Interface for Nexora Retail.
Binds preprocessing, feature pipelines, model training, cross-validation,
and live real-time inference.
"""

from typing import Dict, Any, List, Optional
import os
import joblib
import pandas as pd
import numpy as np

from .features import build_demand_features, build_rfm_features
from .forecasting import train_and_compare_demand_models
from .stockout import train_and_compare_stockout_models
from .clustering import evaluate_k_selection, fit_customer_clusters
from .optimization import compute_inventory_recommendation, calculate_business_financials
from .explainability import explain_prediction
from .evaluation import perform_demand_error_analysis, analyze_classification_tradeoffs

class NexoraModelSuite:
    """
    Complete end-to-end Machine Learning suite managing all three model tracks:
    1. Customer Intelligence (RFM + K-Means)
    2. Demand Prediction (Ridge, Random Forest, XGBoost)
    3. Stockout Risk (Logistic Regression, Random Forest, XGBoost)
    """

    def __init__(self):
        self.is_trained = False
        self.data_source = "demo"
        self.demand_results = {}
        self.stockout_results = {}
        self.clustering_results = {}
        self.k_selection_results = {}
        self.feature_cols = []
        self.feature_df = None
        self.rfm_df = None
        self.catalog_meta = {}

    def fit(self, cleaned_df: pd.DataFrame, mapping: Dict[str, str], data_source_label: str = "demo") -> Dict[str, Any]:
        """
        Trains and cross-validates all ML components on the provided dataset.
        Prevents data leakage by isolating chronological splits.
        """
        self.data_source = data_source_label
        
        # 1. Feature Engineering
        self.feature_df = build_demand_features(cleaned_df, mapping)
        
        # Define feature matrix columns
        candidate_cols = [
            "lag_1", "lag_7", "lag_14", "lag_30",
            "rolling_mean_7", "rolling_mean_14", "rolling_mean_30", "rolling_std_7",
            "sales_growth_7", "sales_velocity", "day_of_week", "is_weekend", "month"
        ]
        self.feature_cols = [c for c in candidate_cols if c in self.feature_df.columns]

        # 2. Train Demand Forecasting Models
        self.demand_results = train_and_compare_demand_models(
            self.feature_df,
            feature_cols=self.feature_cols,
            target_col="target_demand_7d",
            n_splits=3
        )

        # 3. Train Stockout Classification Models
        self.stockout_results = train_and_compare_stockout_models(
            self.feature_df,
            feature_cols=self.feature_cols,
            target_col="target_stockout_7d",
            n_splits=3
        )

        # 4. Customer Segmentation if customer_id available
        cust_col = mapping.get("customer_id")
        if cust_col and cust_col in cleaned_df.columns and cleaned_df[cust_col].nunique() >= 5:
            self.rfm_df = build_rfm_features(cleaned_df, mapping)
            self.k_selection_results = evaluate_k_selection(self.rfm_df)
            best_k = self.k_selection_results.get("optimal_k", 5)
            self.clustered_customers, self.clustering_results = fit_customer_clusters(self.rfm_df, n_clusters=best_k)
        else:
            self.rfm_df = None
            self.clustered_customers = None
            self.clustering_results = {"status": "Customer identifier not provided in dataset."}

        # Cache product metadata (latest inventory, prices, costs, names)
        prod_col = mapping["product_id"]
        meta_dict = {}
        for pid, grp in cleaned_df.groupby(prod_col):
            last_row = grp.iloc[-1]
            pname = str(last_row.get(mapping.get("product_name", prod_col), pid))
            category = str(last_row.get(mapping.get("category", "General"), "General"))
            inv = float(last_row.get(mapping.get("current_inventory", 20), 20))
            price = float(last_row.get(mapping.get("selling_price", 2500), 2500))
            cost = float(last_row.get(mapping.get("product_cost", 1400), 1400))
            lead = float(last_row.get(mapping.get("supplier_lead_time", 5), 5))

            meta_dict[pid] = {
                "product_id": pid,
                "product_name": pname,
                "category": category,
                "current_inventory": inv,
                "selling_price": price,
                "product_cost": cost,
                "supplier_lead_time": lead
            }
        self.catalog_meta = meta_dict
        self.is_trained = True

        return {
            "status": "success",
            "demand_best": self.demand_results["best_model_name"],
            "stockout_best": self.stockout_results["best_model_name"],
            "data_source": self.data_source,
            "products_indexed": len(self.catalog_meta)
        }

    def predict_product_decision(self, product_id: str, override_inventory: Optional[float] = None, override_lead_time: Optional[float] = None) -> Dict[str, Any]:
        """
        Full real-time inference pipeline for a single product:
        Demand forecast -> Stockout classification -> SHAP explanation -> Reorder recommendation -> Financial impact.
        """
        if not self.is_trained:
            raise RuntimeError("NexoraModelSuite must be fitted before running predictions.")

        meta = self.catalog_meta.get(product_id)
        if not meta:
            # Fallback to first available product
            product_id = list(self.catalog_meta.keys())[0]
            meta = self.catalog_meta[product_id]

        curr_inv = override_inventory if override_inventory is not None else meta["current_inventory"]
        lead_time = override_lead_time if override_lead_time is not None else meta["supplier_lead_time"]

        # Extract latest feature row for this product
        prod_features = self.feature_df[self.feature_df["product_id"] == product_id]
        if prod_features.empty:
            feature_row = self.feature_df[self.feature_cols].median().values
        else:
            feature_row = prod_features.iloc[-1][self.feature_cols].values

        # 1. Demand Prediction using Best Model (XGBoost/RF)
        best_demand_name = self.demand_results["best_model_name"]
        demand_model = self.demand_results["final_models"][best_demand_name]
        
        if best_demand_name == "Ridge":
            scaled_row = self.demand_results["scaler"].transform(feature_row.reshape(1, -1))
            raw_demand = float(demand_model.predict(scaled_row)[0])
        else:
            raw_demand = float(demand_model.predict(feature_row.reshape(1, -1))[0])
        
        predicted_demand_7d = max(0.0, raw_demand)

        # 2. Stockout Classification using Best Model
        best_stockout_name = self.stockout_results["best_model_name"]
        stockout_model = self.stockout_results["final_models"][best_stockout_name]
        
        if best_stockout_name == "Logistic Regression":
            scaled_row = self.stockout_results["scaler"].transform(feature_row.reshape(1, -1))
            stockout_prob = float(stockout_model.predict_proba(scaled_row)[0, 1])
        else:
            stockout_prob = float(stockout_model.predict_proba(feature_row.reshape(1, -1))[0, 1])
        
        is_stockout_predicted = stockout_prob >= 0.40  # Recall-tuned threshold

        # 3. SHAP Explainability
        shap_explanation = explain_prediction(
            demand_model,
            feature_row,
            self.feature_cols,
            model_type="linear" if best_demand_name == "Ridge" else "tree"
        )

        # 4. Inventory Decision Optimization
        demand_std = float(prod_features["rolling_std_7"].iloc[-1]) if not prod_features.empty else 2.5
        recom = compute_inventory_recommendation(
            predicted_demand_7d=predicted_demand_7d,
            current_inventory=curr_inv,
            supplier_lead_time_days=lead_time,
            demand_std_dev=demand_std
        )

        # 5. Financial Cost Model in INR (₹)
        financials = calculate_business_financials(
            recom,
            selling_price=meta["selling_price"],
            product_cost=meta["product_cost"]
        )

        return {
            "product_id": product_id,
            "product_name": meta["product_name"],
            "category": meta["category"],
            "predicted_demand_7d": round(predicted_demand_7d, 1),
            "stockout_probability": round(stockout_prob, 3),
            "is_stockout_predicted": is_stockout_predicted,
            "inventory_recommendation": recom,
            "financial_impact": financials,
            "shap_explanation": shap_explanation,
            "model_used": best_demand_name
        }

    def get_executive_overview(self) -> Dict[str, Any]:
        """Aggregates enterprise-level KPIs across all indexed catalog products."""
        if not self.is_trained:
            return {}

        total_sales_value = 0.0
        stockout_risk_count = 0
        total_revenue_protected = 0.0
        total_potential_savings = 0.0
        product_decisions = []

        for pid in self.catalog_meta:
            dec = self.predict_product_decision(pid)
            product_decisions.append(dec)

            meta = self.catalog_meta[pid]
            total_sales_value += dec["predicted_demand_7d"] * meta["selling_price"]
            if dec["inventory_recommendation"]["risk_level"] in ["HIGH", "MEDIUM"]:
                stockout_risk_count += 1
            total_revenue_protected += dec["financial_impact"]["revenue_protected_raw"]
            total_potential_savings += dec["financial_impact"]["net_business_impact_raw"]

        # Customer summary
        total_customers = len(self.clustered_customers) if self.clustered_customers is not None else 0
        at_risk_customers = 0
        vip_customers = 0
        if self.clustered_customers is not None:
            at_risk_customers = int((self.clustered_customers["segment"] == "At-Risk Customers").sum())
            vip_customers = int((self.clustered_customers["segment"] == "VIP Customers").sum())

        return {
            "total_expected_sales_inr": total_sales_value,
            "products_at_stock_risk": stockout_risk_count,
            "total_revenue_protected_inr": total_revenue_protected,
            "total_potential_savings_inr": total_potential_savings,
            "total_customers": total_customers,
            "at_risk_customers": at_risk_customers,
            "vip_customers": vip_customers,
            "catalog_count": len(self.catalog_meta),
            "product_decisions": product_decisions
        }
