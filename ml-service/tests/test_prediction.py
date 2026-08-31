"""
Unit & Integration Tests for POST /ml/predict Endpoint & XGBoost Integration
Tests:
- Required response schema keys (model_version, thermal_stress, mortality_risk, hospitalization_risk, risk_level, prediction_timestamp, feature_schema_version)
- Input parameter support (weather, client thermal, vulnerability, date/time, location_id)
- Server-side thermal feature recalculation (never blindly trusts client risk)
- Determinism and physiological bounds
- Rejection of invalid inputs with HTTP 400
- Request ID tracing headers
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app


class TestPredictionEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_predict_response_schema_exact_fields(self):
        """
        Verify that POST /ml/predict returns all exact required production fields:
        model_version, thermal_stress, mortality_risk, hospitalization_risk, risk_level, prediction_timestamp, feature_schema_version.
        """
        payload = {
            "location_id": "delhi",
            "date": "2026-05-18",
            "temperature": 45.0,
            "humidity": 35.0,
            "wind_speed": 3.2,
            "solar_radiation": 900.0,
            "surface_pressure": 998.0,
            "rainfall_mm": 0.0,
            "population_density": 14000.0,
            "elderly_percentage": 8.5,
            "outdoor_worker_percentage": 19.0,
            "children_percentage": 10.5,
            "consecutive_hot_days": 3,
            "is_urban": True,
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # 1. Required Top-Level Schema Keys
        required_keys = [
            "model_version",
            "thermal_stress",
            "mortality_risk",
            "hospitalization_risk",
            "risk_level",
            "prediction_timestamp",
            "feature_schema_version",
        ]
        for key in required_keys:
            self.assertIn(key, data, f"Missing required response key: '{key}'")

        # 2. Field Ranges and Data Types
        self.assertIsInstance(data["model_version"], str)
        self.assertGreaterEqual(data["thermal_stress"], 0.0)
        self.assertLessEqual(data["thermal_stress"], 100.0)

        self.assertGreaterEqual(data["mortality_risk"], 0.0)
        self.assertLessEqual(data["mortality_risk"], 100.0)

        self.assertGreaterEqual(data["hospitalization_risk"], 0.0)
        self.assertLessEqual(data["hospitalization_risk"], 100.0)

        self.assertIn(data["risk_level"], ["VERY_LOW", "LOW", "MODERATE", "HIGH", "EXTREME"])
        self.assertEqual(data["feature_schema_version"], "v1.0.0")

        # 3. Security header
        self.assertIn("X-Request-ID", response.headers)

    def test_predict_extreme_heatwave(self):
        """Verify prediction endpoint with severe heatwave conditions (Northwest India summer)."""
        payload = {
            "location_id": "ahmedabad",
            "date": "2026-05-22",
            "temperature": 46.5,
            "humidity": 32.0,
            "wind_speed": 3.0,
            "solar_radiation": 950.0,
            "surface_pressure": 998.0,
            "uv_index": 11.5,
            "latitude": 23.02,
            "longitude": 72.57,
            "consecutive_hot_days": 4,
            "is_urban": True,
            "population_density": 16000.0,
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Severe heatwave should yield HIGH or EXTREME risk
        self.assertIn(data["risk_level"], ["HIGH", "EXTREME"])
        self.assertGreaterEqual(data["thermal_stress"], 50.0)
        self.assertGreaterEqual(data["mortality_risk"], 40.0)
        self.assertGreaterEqual(data["hospitalization_risk"], 35.0)

    def test_predict_mild_weather(self):
        """Verify prediction endpoint with comfortable, safe conditions."""
        payload = {
            "location_id": "bengaluru",
            "date": "2026-03-10",
            "temperature": 26.0,
            "humidity": 45.0,
            "wind_speed": 3.5,
            "solar_radiation": 350.0,
            "consecutive_hot_days": 0,
            "is_urban": False,
            "population_density": 3000.0,
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn(data["risk_level"], ["VERY_LOW", "LOW"])
        self.assertLess(data["thermal_stress"], 20.0)
        self.assertLess(data["mortality_risk"], 15.0)
        self.assertLess(data["hospitalization_risk"], 20.0)

    def test_server_calculates_thermal_features_independently(self):
        """
        Verify server recalculates physical thermodynamic features itself and does not trust
        tampered or erroneous client-supplied risk/thermal values.
        """
        # Client sends absurdly low client-calculated thermal values during a 47C heatwave
        payload = {
            "temperature": 47.0,
            "humidity": 40.0,
            "wind_speed": 2.0,
            "solar_radiation": 980.0,
            "heat_index": 15.0,  # False client value
            "wbgt": 12.0,        # False client value
            "utci": 10.0,        # False client value
            "consecutive_hot_days": 4,
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # The server must have recalculated WBGT (>32C) and thermal_stress (>60), ignoring the false client values
        self.assertGreater(data["thermal_stress"], 50.0)
        self.assertIn(data["risk_level"], ["HIGH", "EXTREME"])

    def test_prediction_strict_determinism(self):
        """Verify that identical inputs produce 100% identical deterministic numerical outputs."""
        payload = {
            "location_id": "nagpur",
            "temperature": 43.8,
            "humidity": 38.0,
            "wind_speed": 2.8,
            "solar_radiation": 890.0,
            "consecutive_hot_days": 2,
            "is_urban": True,
            "population_density": 5000.0,
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

        # Exact equality across repeated executions
        self.assertEqual(d1["thermal_stress"], d2["thermal_stress"])
        self.assertEqual(d2["thermal_stress"], d3["thermal_stress"])

        self.assertEqual(d1["mortality_risk"], d2["mortality_risk"])
        self.assertEqual(d2["mortality_risk"], d3["mortality_risk"])

        self.assertEqual(d1["hospitalization_risk"], d2["hospitalization_risk"])
        self.assertEqual(d2["hospitalization_risk"], d3["hospitalization_risk"])

        self.assertEqual(d1["risk_level"], d2["risk_level"])

    def test_reject_invalid_inputs_with_http_400(self):
        """Verify invalid inputs return HTTP 400 Bad Request."""
        # Missing required temperature
        res1 = self.client.post("/ml/predict", json={"humidity": 40.0})
        self.assertEqual(res1.status_code, 400)
        self.assertEqual(res1.json()["error"], "InvalidInput")

        # Impossible temperature (> 65C)
        res2 = self.client.post("/ml/predict", json={"temperature": 80.0, "humidity": 30.0})
        self.assertEqual(res2.status_code, 400)

        # Invalid NaN
        res3 = self.client.post("/ml/predict", json={"temperature": "NaN", "humidity": 30.0})
        self.assertEqual(res3.status_code, 400)


if __name__ == "__main__":
    unittest.main()
