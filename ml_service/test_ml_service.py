"""
Automated Test Suite for Python FastAPI & XGBoost ML Service
"""

import sys
import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas import HeatwavePredictionRequest
from app.feature_engineering import extract_features, calculate_dew_point, calculate_heat_index


class TestThermoGuardMLService(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        """Test GET /health returns 200 and healthy status."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "HEALTHY")
        self.assertIn("model_ready", data)

    def test_root_endpoint(self):
        """Test GET / returns metadata and online status."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ONLINE")
        self.assertIn("endpoints", data)

    def test_feature_engineering_calculations(self):
        """Test mathematical accuracy of thermodynamic formulas."""
        # Dew point at 40°C and 40% RH
        dp = calculate_dew_point(40.0, 40.0)
        self.assertGreater(dp, 20.0)
        self.assertLess(dp, 26.0)

        # Heat Index at 42°C and 35% RH
        hi = calculate_heat_index(42.0, 35.0)
        self.assertGreater(hi, 45.0)

        # Feature vector extraction
        req = HeatwavePredictionRequest(temperature=45.0, humidity=30.0)
        feat_dict, eng_summary = extract_features(req)
        self.assertIn("vapor_pressure", feat_dict)
        self.assertIn("effective_solar", feat_dict)
        self.assertIn("compound_stress", feat_dict)
        self.assertGreater(eng_summary.vapor_pressure_hpa, 0)

    def test_predict_endpoint_extreme_heat(self):
        """Test POST /ml/predict with severe heatwave parameters (Delhi/Phalodi Summer)."""
        payload = {
            "temperature": 46.5,
            "humidity": 35.0,
            "wind_speed": 3.0,
            "solar_radiation": 950.0,
            "consecutive_hot_days": 4,
            "is_urban": True,
            "population_density": 18000.0,
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Validate response schema
        self.assertIn("mortality_risk_score", data)
        self.assertIn("predicted_wbgt", data)
        self.assertIn("predicted_utci", data)
        self.assertIn("alert_level", data)
        self.assertIn("top_risk_factors", data)
        self.assertIn("engineered_features", data)

        # Extreme conditions should trigger RED Alert and high mortality risk
        self.assertIn(data["alert_level"], ["RED", "ORANGE"])
        self.assertGreater(data["mortality_risk_score"], 40.0)
        self.assertGreater(data["predicted_wbgt"], 30.0)
        self.assertGreater(len(data["top_risk_factors"]), 0)

    def test_predict_endpoint_mild_weather(self):
        """Test POST /ml/predict with mild, non-hazardous weather."""
        payload = {
            "temperature": 28.0,
            "humidity": 45.0,
            "wind_speed": 4.0,
            "solar_radiation": 400.0,
            "consecutive_hot_days": 0,
            "is_urban": False,
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["alert_level"], "GREEN")
        self.assertLess(data["mortality_risk_score"], 20.0)

    def test_predict_endpoint_validation_error(self):
        """Test POST /ml/predict rejects invalid data (e.g. humidity > 100 or negative temp)."""
        payload = {
            "temperature": 45.0,
            "humidity": 150.0,  # Invalid
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 422)  # Pydantic validation error


if __name__ == "__main__":
    unittest.main()
