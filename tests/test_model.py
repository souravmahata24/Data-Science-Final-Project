"""
Unit tests for Machine Learning Model Pipelines and Inferences.
"""

import unittest
from src.data import generate_robust_demo_dataset
from src.model import NexoraModelSuite

class TestModelPipeline(unittest.TestCase):

    def test_model_suite_training_and_inference(self):
        df = generate_robust_demo_dataset(days=30)
        mapping = {c: c for c in df.columns}

        suite = NexoraModelSuite()
        fit_res = suite.fit(df, mapping, data_source_label="demo")

        self.assertEqual(fit_res["status"], "success")
        self.assertIn(fit_res["demand_best"], ["Ridge", "Random Forest", "XGBoost"])
        self.assertIn(fit_res["stockout_best"], ["Logistic Regression", "Random Forest", "XGBoost"])

        # Test single-point real-time prediction
        sample_prod = list(suite.catalog_meta.keys())[0]
        pred = suite.predict_product_decision(sample_prod)

        self.assertIn("predicted_demand_7d", pred)
        self.assertIn("inventory_recommendation", pred)
        self.assertIn("shap_explanation", pred)
        self.assertGreater(len(pred["shap_explanation"]["attributions"]), 0)

if __name__ == "__main__":
    unittest.main()
