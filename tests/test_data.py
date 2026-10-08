"""
Unit tests for Data Loading, Validation, and Cleaning.
"""

import unittest
import pandas as pd
from src.data import generate_robust_demo_dataset, clean_dataset
from src.column_mapper import suggest_mapping
from src.data_validation import run_health_check

class TestDataPipeline(unittest.TestCase):

    def test_demo_dataset_generation(self):
        df = generate_robust_demo_dataset(days=15)
        self.assertGreater(len(df), 50)
        self.assertIn("quantity_sold", df.columns)
        self.assertIn("product_id", df.columns)

    def test_column_mapping_fuzzy(self):
        sample_cols = ["Order_Date", "SKU", "Qty_Sold", "Customer_No", "Stock_On_Hand"]
        mapping = suggest_mapping(sample_cols)
        self.assertEqual(mapping["date"], "Order_Date")
        self.assertEqual(mapping["product_id"], "SKU")
        self.assertEqual(mapping["quantity_sold"], "Qty_Sold")
        self.assertEqual(mapping["customer_id"], "Customer_No")
        self.assertEqual(mapping["current_inventory"], "Stock_On_Hand")

    def test_health_check(self):
        df = generate_robust_demo_dataset(days=10)
        mapping = {c: c for c in df.columns}
        health = run_health_check(df, mapping)
        self.assertEqual(health["duplicates"], 0)
        self.assertGreater(health["total_rows"], 0)
        self.assertTrue(health["readiness"]["sales_forecast"]["ready"])

if __name__ == "__main__":
    unittest.main()
