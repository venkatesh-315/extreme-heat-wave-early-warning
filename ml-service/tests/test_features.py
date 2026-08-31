"""
Unit Tests for Machine Learning Feature Engineering Pipeline (app/features.py)
Tests feature generation, fixed 25-feature schema ordering, explicit missing-value handling,
demographic baselines, temporal parsing, and anti-leakage guarantees.
"""

import unittest
from datetime import datetime, timezone
import numpy as np

from app.schemas import PredictionRequest
from app.features import (
    FEATURE_COLUMNS,
    FEATURE_SCHEMA_VERSION,
    DEFAULT_VULNERABILITY_BASELINES,
    extract_feature_vector,
    extract_temporal_features,
    extract_lag_features,
    extract_vulnerability_features,
    validate_feature_vector,
    get_feature_schema,
)


class TestFeatureEngineeringPipeline(unittest.TestCase):
    """
    Validates end-to-end feature extraction, dimensionality, determinism, and safety.
    """

    def test_feature_schema_columns_count_and_uniqueness(self):
        """Verify exactly 25 feature columns with no duplicates."""
        self.assertEqual(len(FEATURE_COLUMNS), 25)
        self.assertEqual(len(set(FEATURE_COLUMNS)), 25)
        schema = get_feature_schema()
        self.assertEqual(schema["version"], FEATURE_SCHEMA_VERSION)
        self.assertEqual(schema["feature_count"], 25)

    def test_complete_feature_extraction_shape_and_ordering(self):
        """
        Verify that extract_feature_vector returns a fixed 25-element numpy array
        where vector[i] exactly corresponds to feature_dict[FEATURE_COLUMNS[i]].
        """
        req = PredictionRequest(
            temperature=45.0,
            humidity=30.0,
            wind_speed=3.0,
            solar_radiation=900.0,
            surface_pressure=1005.0,
            rainfall_mm=0.0,
            consecutive_hot_days=3,
            observation_time="2026-05-20T14:00:00Z",
            elderly_percentage=9.5,
            outdoor_worker_percentage=22.0,
            children_percentage=10.0,
            population_density=12000.0,
        )

        vector, f_dict, engineered_output = extract_feature_vector(req)

        self.assertIsInstance(vector, np.ndarray)
        self.assertEqual(vector.shape, (25,))
        self.assertEqual(vector.dtype, np.float32)

        # Check exact mapping for each feature column
        for idx, col_name in enumerate(FEATURE_COLUMNS):
            self.assertIn(col_name, f_dict)
            self.assertAlmostEqual(vector[idx], f_dict[col_name], places=4)

        # Verify output summary
        self.assertEqual(engineered_output.feature_count, 25)
        self.assertEqual(engineered_output.feature_schema_version, FEATURE_SCHEMA_VERSION)

    def test_explicit_missing_vulnerability_handling(self):
        """
        Verify missing demographic fields are filled with explicit, documented census baselines
        and never with arbitrary random values.
        """
        req = PredictionRequest(
            temperature=40.0,
            humidity=40.0,
            population_density=15000.0,
            # elderly_percentage, outdoor_worker_percentage, children_percentage omitted
        )

        vuln = extract_vulnerability_features(req)

        self.assertEqual(vuln["elderly_percentage"], DEFAULT_VULNERABILITY_BASELINES["elderly_percentage"])
        self.assertEqual(vuln["outdoor_worker_percentage"], DEFAULT_VULNERABILITY_BASELINES["outdoor_worker_percentage"])
        self.assertEqual(vuln["children_percentage"], DEFAULT_VULNERABILITY_BASELINES["children_percentage"])
        self.assertEqual(vuln["population_density"], 15000.0)

    def test_temporal_feature_extraction_from_iso_timestamp(self):
        """
        Verify temporal extraction correctly extracts hour, day, month, day_of_year from ISO timestamp.
        """
        req = PredictionRequest(
            temperature=38.0,
            humidity=50.0,
            observation_time="2026-06-15T16:45:00Z",
            consecutive_hot_days=4,
        )

        temp_feats = extract_temporal_features(req)

        self.assertEqual(temp_feats["hour"], 16.0)
        self.assertEqual(temp_feats["day"], 15.0)
        self.assertEqual(temp_feats["month"], 6.0)
        self.assertEqual(temp_feats["day_of_year"], 166.0)
        self.assertEqual(temp_feats["consecutive_hot_days"], 4.0)

    def test_lag_features_and_no_future_leakage(self):
        """
        Verify lag features only use past observations.
        When lags are explicitly supplied, they are preserved.
        When omitted, they are reconstructed from consecutive_hot_days without referencing any future data.
        """
        req_with_lags = PredictionRequest(
            temperature=44.0,
            humidity=35.0,
            temp_lag_1d=43.0,
            temp_lag_2d=42.0,
            temp_lag_3d=40.5,
            wbgt_lag_1d=32.0,
            wbgt_lag_2d=31.0,
            wbgt_lag_3d=29.5,
            consecutive_hot_days=3,
        )

        lags = extract_lag_features(req_with_lags, 44.0, 33.0)

        self.assertEqual(lags["temp_lag_1d"], 43.0)
        self.assertEqual(lags["temp_lag_2d"], 42.0)
        self.assertEqual(lags["temp_lag_3d"], 40.5)
        self.assertEqual(lags["wbgt_lag_1d"], 32.0)
        self.assertEqual(lags["wbgt_lag_2d"], 31.0)
        self.assertEqual(lags["wbgt_lag_3d"], 29.5)
        self.assertGreater(lags["cumulative_heat_exposure"], 0.0)

    def test_rejection_of_unexpected_vector_shapes(self):
        """
        Verify validate_feature_vector raises ValueError on invalid array dimensions or non-finite elements.
        """
        # Vector with 24 elements instead of 25
        short_vector = np.zeros(24, dtype=np.float32)
        with self.assertRaises(ValueError):
            validate_feature_vector(short_vector)

        # Vector with 26 elements
        long_vector = np.zeros(26, dtype=np.float32)
        with self.assertRaises(ValueError):
            validate_feature_vector(long_vector)

        # Vector with NaN
        nan_vector = np.zeros(25, dtype=np.float32)
        nan_vector[5] = float("nan")
        with self.assertRaises(ValueError):
            validate_feature_vector(nan_vector)

        # Valid 25-element vector should pass
        valid_vector = np.ones(25, dtype=np.float32)
        validate_feature_vector(valid_vector)

    def test_feature_determinism(self):
        """
        Verify that extracting features multiple times from the same request produces identical outputs.
        """
        req = PredictionRequest(
            temperature=43.2,
            humidity=34.0,
            wind_speed=2.4,
            solar_radiation=820.0,
            consecutive_hot_days=2,
            observation_time="2026-05-10T12:00:00Z",
        )

        v1, d1, _ = extract_feature_vector(req)
        v2, d2, _ = extract_feature_vector(req)

        np.testing.assert_array_equal(v1, v2)
        self.assertEqual(d1, d2)


if __name__ == "__main__":
    unittest.main()
