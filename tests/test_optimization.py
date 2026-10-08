"""
Unit tests for Inventory Optimization & Business Cost Formulas.
"""

import unittest
from src.optimization import compute_inventory_recommendation, calculate_business_financials
from src.config import format_inr

class TestInventoryOptimization(unittest.TestCase):

    def test_reorder_point_formula(self):
        # Predicted demand 14 units over 7 days -> 2 units/day
        # Lead time 5 days -> lead time demand = 10 units
        # Safety stock ~ 3 units
        # Recommended level = 13 units
        # Current inventory = 5 units -> Recommended purchase = 8 units
        recom = compute_inventory_recommendation(
            predicted_demand_7d=14.0,
            current_inventory=5.0,
            supplier_lead_time_days=5.0,
            demand_std_dev=1.0,
            forecast_horizon_days=7
        )
        self.assertEqual(recom["current_inventory"], 5)
        self.assertGreater(recom["recommended_purchase"], 0)
        self.assertEqual(recom["risk_level"], "HIGH")

    def test_inr_formatting(self):
        self.assertEqual(format_inr(799), "₹799")
        self.assertEqual(format_inr(25000), "₹25,000")
        self.assertIn("lakh", format_inr(250000))
        self.assertIn("crore", format_inr(12000000))

    def test_financial_calculations(self):
        recom = {
            "predicted_demand": 20,
            "current_inventory": 5,
            "recommended_purchase": 15,
            "recommended_level": 20
        }
        fin = calculate_business_financials(recom, selling_price=1000, product_cost=600)
        self.assertGreater(fin["net_business_impact_raw"], 0)
        self.assertIn("₹", fin["potential_savings_inr"])

if __name__ == "__main__":
    unittest.main()
