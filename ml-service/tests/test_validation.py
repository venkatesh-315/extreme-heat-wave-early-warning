"""
Comprehensive Validation Tests for ML Prediction Input Guardrails
Tests rejection of NaN, Infinity, missing required fields, invalid negative values, and unreasonable weather inputs.
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app


class TestValidationGuardrails(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_reject_missing_required_fields(self):
        """Verify 422 error when required fields are missing."""
        # Missing humidity
        response = self.client.post("/ml/predict", json={"temperature": 42.0})
        self.assertEqual(response.status_code, 422)
        data = response.json()
        self.assertEqual(data["error"], "ValidationError")

        # Missing temperature
        response = self.client.post("/ml/predict", json={"humidity": 30.0})
        self.assertEqual(response.status_code, 422)

    def test_reject_negative_humidity(self):
        """Verify negative humidity is rejected."""
        payload = {"temperature": 40.0, "humidity": -5.0}
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 422)
        self.assertIn("humidity", str(response.json()["details"]))

    def test_reject_humidity_over_100(self):
        """Verify humidity > 100% is rejected."""
        payload = {"temperature": 40.0, "humidity": 105.0}
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_reject_negative_wind_and_solar(self):
        """Verify negative wind speed and solar radiation are rejected."""
        payload1 = {"temperature": 40.0, "humidity": 40.0, "wind_speed": -2.0}
        response1 = self.client.post("/ml/predict", json=payload1)
        self.assertEqual(response1.status_code, 422)

        payload2 = {"temperature": 40.0, "humidity": 40.0, "solar_radiation": -100.0}
        response2 = self.client.post("/ml/predict", json=payload2)
        self.assertEqual(response2.status_code, 422)

    def test_reject_unreasonable_temperature(self):
        """Verify temperatures outside realistic planetary range are rejected."""
        # Too hot (> 65°C)
        response_hot = self.client.post("/ml/predict", json={"temperature": 85.0, "humidity": 30.0})
        self.assertEqual(response_hot.status_code, 422)

        # Too cold (< -15°C for heatwave model)
        response_cold = self.client.post("/ml/predict", json={"temperature": -30.0, "humidity": 30.0})
        self.assertEqual(response_cold.status_code, 422)

    def test_reject_nan_and_infinity(self):
        """Verify NaN and Infinity strings/values are strictly rejected."""
        # NaN as string representation
        response_nan = self.client.post("/ml/predict", json={"temperature": "NaN", "humidity": 40.0})
        self.assertEqual(response_nan.status_code, 422)

        # Infinity as string representation
        response_inf = self.client.post("/ml/predict", json={"temperature": "Infinity", "humidity": 40.0})
        self.assertEqual(response_inf.status_code, 422)

        # Negative Infinity
        response_ninf = self.client.post("/ml/predict", json={"temperature": "-Infinity", "humidity": 40.0})
        self.assertEqual(response_ninf.status_code, 422)

    def test_reject_impossible_dew_point(self):
        """Verify psychrometric check: dew point cannot physically exceed dry bulb temperature."""
        payload = {
            "temperature": 30.0,
            "humidity": 50.0,
            "dew_point": 38.0,  # Physically impossible (dew point 38°C > dry bulb 30°C)
        }
        response = self.client.post("/ml/predict", json=payload)
        self.assertEqual(response.status_code, 422)
        self.assertIn("Dew point", str(response.json()["details"]))


if __name__ == "__main__":
    unittest.main()
