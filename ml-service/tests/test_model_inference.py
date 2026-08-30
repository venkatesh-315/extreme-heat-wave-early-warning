"""
Unit Tests for XGBoost Model Inference, Loading & Metadata Verification (tests/test_model_inference.py)
Verifies:
- Model files load successfully
- Feature count matches the canonical 25-feature schema
- Prediction shapes are correct
- Predictions are strictly finite and within expected bounds
- model_metadata.json contains all required schema & evaluation fields
"""

import unittest
import json
from pathlib import Path
import numpy as np
import joblib

from app.features import FEATURE_COLUMNS, FEATURE_SCHEMA_VERSION
from app.model import ModelManager, model_manager
from app.schemas import PredictionRequest
from app.features import extract_feature_vector

SERVICE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = SERVICE_DIR / "models"


class TestModelInferenceAndIntegrity(unittest.TestCase):
    """
    Validates model persistence, inference shapes, numeric boundedness, and metadata completeness.
    """

    def setUp(self):
        self.mort_path = MODELS_DIR / "mortality_model.joblib"
        self.hosp_path = MODELS_DIR / "hospitalization_model.joblib"
        self.meta_path = MODELS_DIR / "model_metadata.json"

    def test_model_files_exist_and_load(self):
        """Verify model files load cleanly via joblib."""
        self.assertTrue(self.mort_path.exists(), f"Mortality model missing at {self.mort_path}")
        self.assertTrue(self.hosp_path.exists(), f"Hospitalization model missing at {self.hosp_path}")

        mort_model = joblib.load(self.mort_path)
        hosp_model = joblib.load(self.hosp_path)

        self.assertIsNotNone(mort_model)
        self.assertIsNotNone(hosp_model)

    def test_model_feature_count_and_parity(self):
        """Verify model expects exactly 25 features matching FEATURE_COLUMNS."""
        mort_model = joblib.load(self.mort_path)
        hosp_model = joblib.load(self.hosp_path)

        self.assertEqual(mort_model.n_features_in_, len(FEATURE_COLUMNS))
        self.assertEqual(hosp_model.n_features_in_, len(FEATURE_COLUMNS))
        self.assertEqual(mort_model.n_features_in_, 25)

    def test_prediction_shape_and_finiteness(self):
        """Verify model predictions produce single floats or (N,) arrays and are strictly finite."""
        req = PredictionRequest(
            temperature=45.5,
            humidity=32.0,
            wind_speed=3.0,
            solar_radiation=920.0,
            consecutive_hot_days=3,
            is_urban=True,
            population_density=14000.0,
        )

        vector, feature_dict, _ = extract_feature_vector(req)
        self.assertEqual(vector.shape, (25,))

        mort_model = joblib.load(self.mort_path)
        hosp_model = joblib.load(self.hosp_path)

        # Batch shape (1, 25)
        batch_input = vector.reshape(1, -1)
        pred_mort = mort_model.predict(batch_input)
        pred_hosp = hosp_model.predict(batch_input)

        self.assertEqual(pred_mort.shape, (1,))
        self.assertEqual(pred_hosp.shape, (1,))
        self.assertTrue(np.isfinite(pred_mort[0]))
        self.assertTrue(np.isfinite(pred_hosp[0]))

    def test_predictions_within_expected_bounds(self):
        """
        Verify predictions remain within realistic physiological boundaries:
        - Mortality risk in [0.0, 100.0] %
        - Hospitalization admissions >= 0.0
        """
        manager = ModelManager()

        # Extreme Heatwave Scenario
        hot_req = PredictionRequest(
            temperature=47.2,
            humidity=35.0,
            wind_speed=2.5,
            solar_radiation=980.0,
            consecutive_hot_days=5,
            is_urban=True,
            population_density=16000.0,
        )
        _, hot_dict, _ = extract_feature_vector(hot_req)
        mort_hot = manager.predict_mortality(hot_dict)
        hosp_hot = manager.predict_hospitalization(hot_dict)

        self.assertIsNotNone(mort_hot)
        self.assertIsNotNone(hosp_hot)
        self.assertGreaterEqual(mort_hot, 0.0)
        self.assertLessEqual(mort_hot, 100.0)
        self.assertGreaterEqual(hosp_hot, 0.0)
        self.assertGreater(mort_hot, 40.0)  # Extreme heat should produce significant risk

        # Mild Weather Scenario
        mild_req = PredictionRequest(
            temperature=26.0,
            humidity=40.0,
            wind_speed=3.5,
            solar_radiation=300.0,
            consecutive_hot_days=0,
            is_urban=False,
            population_density=3000.0,
        )
        _, mild_dict, _ = extract_feature_vector(mild_req)
        mort_mild = manager.predict_mortality(mild_dict)
        hosp_mild = manager.predict_hospitalization(mild_dict)

        self.assertIsNotNone(mort_mild)
        self.assertIsNotNone(hosp_mild)
        self.assertGreaterEqual(mort_mild, 0.0)
        self.assertLessEqual(mort_mild, 100.0)
        self.assertLess(mort_mild, mort_hot)

    def test_model_metadata_completeness_and_secrets(self):
        """
        Verify model_metadata.json contains all required schema keys and zero sensitive secrets.
        """
        self.assertTrue(self.meta_path.exists(), f"Metadata missing at {self.meta_path}")

        with open(self.meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

        required_keys = [
            "model_version",
            "training_date",
            "feature_schema_version",
            "feature_count",
            "feature_columns",
            "training_date_range",
            "dataset_size",
            "evaluation_metrics",
            "target_definition",
        ]
        for key in required_keys:
            self.assertIn(key, meta)

        self.assertEqual(meta["feature_schema_version"], FEATURE_SCHEMA_VERSION)
        self.assertEqual(meta["feature_count"], 25)
        self.assertEqual(len(meta["feature_columns"]), 25)

        # Evaluation metrics check
        self.assertIn("mortality_model", meta["evaluation_metrics"])
        self.assertIn("hospitalization_model", meta["evaluation_metrics"])

        # Secret scanning: ensure no tokens, keys, passwords
        meta_str = json.dumps(meta).lower()
        for forbidden in ["api_key", "secret", "password", "token", "credential"]:
            self.assertNotIn(forbidden, meta_str)


if __name__ == "__main__":
    unittest.main()
