"""
Unit & Integration Tests for Prediction Endpoint & Determinism
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app


class TestPredictionEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_predict_extreme_heatwave(self):
        """Verify prediction endpoint with severe heatwave conditions (Northwest India summer)."""
        payload = {
            "temperature": 46.5,
            "humidity": 32.0,
            "wind_speed": 3.0,
            "solar_radiation": 950.0,
            "surface_pressure": 998.0,
            "uv_index": 11.5,
            "latitude": 28.6139,
            "longitude": 77.2090,
            "consecutive_hot_days": 4,
            "is_urban": True,
            "population_density": 16000.0,
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Core response assertions
        self.assertIn("mortality_risk_score", data)
        self.assertGreaterEqual(data["mortality_risk_score"], 45.0)  # Extreme risk
        self.assertIn(data["risk_category"], ["Extreme", "Catastrophic"])
        self.assertIn(data["alert_level"], ["RED", "ORANGE"])
        self.assertGreaterEqual(data["predicted_wbgt"], 30.0)
        self.assertGreaterEqual(data["predicted_utci"], 40.0)
        self.assertGreaterEqual(data["heat_index"], 45.0)

        # Explainability factors
        self.assertGreaterEqual(len(data["top_risk_factors"]), 2)
        for factor in data["top_risk_factors"]:
            self.assertIn("feature", factor)
            self.assertIn("weight", factor)
            self.assertIn("description", factor)

        # Engineered features structure
        eng = data["engineered_features"]
        self.assertGreater(eng["dew_point_c"], 0)
        self.assertGreater(eng["vapor_pressure_hpa"], 0)
        self.assertGreater(eng["vapor_pressure_deficit_hpa"], 0)
        self.assertGreater(eng["moist_air_enthalpy_kj_kg"], 0)
        self.assertGreater(eng["effective_solar_heat_load_w_m2"], 0)
        self.assertGreater(eng["compound_stress_multiplier"], 0)

    def test_predict_mild_weather(self):
        """Verify prediction endpoint with comfortable, safe conditions."""
        payload = {
            "temperature": 27.0,
            "humidity": 45.0,
            "wind_speed": 3.5,
            "solar_radiation": 350.0,
            "consecutive_hot_days": 0,
            "is_urban": False,
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["alert_level"], "GREEN")
        self.assertEqual(data["risk_category"], "Low")
        self.assertLess(data["mortality_risk_score"], 20.0)

    def test_prediction_strict_determinism(self):
        """Verify that identical inputs produce 100% identical deterministic numerical outputs."""
        payload = {
            "temperature": 43.8,
            "humidity": 38.0,
            "wind_speed": 2.8,
            "solar_radiation": 890.0,
            "consecutive_hot_days": 2,
            "is_urban": True,
        }

        response1 = self.client.post("/ml/predict", json=payload)
        response2 = self.client.post("/ml/predict", json=payload)
        response3 = self.client.post("/ml/predict", json=payload)

        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(response3.status_code, 200)

        d1 = response1.json()
        d2 = response2.json()
        d3 = response3.json()

        # Exact equality on all computed values
        self.assertEqual(d1["mortality_risk_score"], d2["mortality_risk_score"])
        self.assertEqual(d2["mortality_risk_score"], d3["mortality_risk_score"])

        self.assertEqual(d1["predicted_wbgt"], d2["predicted_wbgt"])
        self.assertEqual(d2["predicted_wbgt"], d3["predicted_wbgt"])

        self.assertEqual(d1["predicted_utci"], d2["predicted_utci"])
        self.assertEqual(d2["predicted_utci"], d3["predicted_utci"])

        self.assertEqual(d1["heat_index"], d2["heat_index"])
        self.assertEqual(d2["heat_index"], d3["heat_index"])

        self.assertEqual(d1["alert_level"], d2["alert_level"])
        self.assertEqual(d2["alert_level"], d3["alert_level"])

        self.assertEqual(d1["engineered_features"], d2["engineered_features"])
        self.assertEqual(d2["engineered_features"], d3["engineered_features"])


if __name__ == "__main__":
    unittest.main()
