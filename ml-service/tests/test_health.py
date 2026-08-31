"""
Unit tests for Health Check & Root Endpoints
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app


class TestHealthEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        """Verify root GET / returns status ONLINE and metadata."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ONLINE")
        self.assertIn("endpoints", data)
        self.assertEqual(data["endpoints"]["health"], "/health")
        self.assertEqual(data["endpoints"]["predict"], "/ml/predict")

    def test_health_endpoint(self):
        """Verify GET /health returns status HEALTHY, service name, and model load status."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "HEALTHY")
        self.assertEqual(data["service"], "ThermoGuard ML Service")
        self.assertIn("model_loaded", data)
        self.assertIn("model_path", data)
        self.assertIn("timestamp", data)


if __name__ == "__main__":
    unittest.main()
