"""
Unit Tests for Training Dataset Preparation Pipeline (training/prepare_dataset.py)
Tests duplicate handling, anti-leakage guarantees, chronological sorting, demographic joins,
target separation, and validation report generation.
"""

import unittest
import tempfile
from pathlib import Path
import pandas as pd
import numpy as np

from training.prepare_dataset import DatasetPreparationPipeline, PipelineConfig
from app.features import FEATURE_COLUMNS, FEATURE_SCHEMA_VERSION


class TestDatasetPreparationPipeline(unittest.TestCase):
    """
    Validates data pipeline robustness, duplicate removal, chronological ordering, and leak-free lag generation.
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.dir_path = Path(self.temp_dir.name)

        # Create a sample weather dataset with out-of-order dates and intentional duplicate
        weather_data = {
            "location_id": ["loc_a", "loc_a", "loc_a", "loc_a", "loc_a", "loc_b", "loc_b"],
            # Out of order dates for loc_a: May 17, May 15, May 16, May 16 (dupe), May 18
            "date": ["2026-05-17", "2026-05-15", "2026-05-16", "2026-05-16", "2026-05-18", "2026-05-15", "2026-05-16"],
            "temperature": [46.0, 42.0, 44.0, 44.0, 47.0, 40.0, 41.5],
            "humidity": [30.0, 38.0, 34.0, 34.0, 26.0, 45.0, 40.0],
            "wind_speed": [3.0, 2.5, 2.8, 2.8, 3.2, 2.0, 2.2],
            "solar_radiation": [920.0, 850.0, 890.0, 890.0, 950.0, 800.0, 830.0],
            "surface_pressure": [998.0, 1000.0, 999.0, 999.0, 997.0, 1002.0, 1001.0],
            "rainfall_mm": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        }
        self.weather_file = self.dir_path / "weather.csv"
        pd.DataFrame(weather_data).to_csv(self.weather_file, index=False)

        # Demographic sample
        demo_data = {
            "location_id": ["loc_a", "loc_b"],
            "population_density": [12500.0, 6000.0],
            "elderly_percentage": [8.5, 9.2],
            "outdoor_worker_percentage": [20.0, 16.5],
            "children_percentage": [10.5, 11.0],
        }
        self.demo_file = self.dir_path / "demographics.csv"
        pd.DataFrame(demo_data).to_csv(self.demo_file, index=False)

        # Health outcome sample
        health_data = {
            "location_id": ["loc_a", "loc_a", "loc_a", "loc_a", "loc_b", "loc_b"],
            "date": ["2026-05-15", "2026-05-16", "2026-05-17", "2026-05-18", "2026-05-15", "2026-05-16"],
            "mortality_target": [35.0, 52.0, 78.0, 95.0, 20.0, 32.0],
            "hospitalization_target": [150.0, 210.0, 310.0, 420.0, 85.0, 130.0],
        }
        self.health_file = self.dir_path / "health.csv"
        pd.DataFrame(health_data).to_csv(self.health_file, index=False)

        self.output_file = self.dir_path / "processed.csv"
        self.report_file = self.dir_path / "report.json"

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_deduplication_and_sorting(self):
        """
        Verify that duplicates on (location_id, date) are removed and dates are sorted chronologically.
        """
        config = PipelineConfig(
            raw_weather_path=self.weather_file,
            demographics_path=self.demo_file,
            health_outcomes_path=self.health_file,
            output_processed_path=self.output_file,
            report_output_path=self.report_file,
        )
        pipeline = DatasetPreparationPipeline(config)
        df, report = pipeline.run()

        # Initial was 7 rows (with 1 duplicate for loc_a on 2026-05-16). Clean must have exactly 6 rows.
        self.assertEqual(len(df), 6)
        self.assertEqual(report["duplicates_removed_count"], 1)

        # Verify chronological ordering for loc_a
        loc_a_df = df[df["location_id"] == "loc_a"]
        dates = loc_a_df["date"].tolist()
        self.assertEqual(dates, sorted(dates))

    def test_strict_anti_leakage_on_lag_features(self):
        """
        Critical test: Verify that lag features strictly contain prior observations and zero future information.
        For loc_a on May 17 (temperature = 46.0):
        - temp_lag_1d MUST be May 16 temperature (44.0)
        - temp_lag_2d MUST be May 15 temperature (42.0)
        - temp_lag_1d must NOT equal May 18 temperature (47.0).
        """
        config = PipelineConfig(
            raw_weather_path=self.weather_file,
            demographics_path=self.demo_file,
            health_outcomes_path=self.health_file,
            output_processed_path=self.output_file,
            report_output_path=self.report_file,
        )
        pipeline = DatasetPreparationPipeline(config)
        df, _ = pipeline.run()

        loc_a_may17 = df[(df["location_id"] == "loc_a") & (df["date"] == pd.to_datetime("2026-05-17"))].iloc[0]
        loc_a_may18 = df[(df["location_id"] == "loc_a") & (df["date"] == pd.to_datetime("2026-05-18"))].iloc[0]

        # May 17 lags
        self.assertEqual(loc_a_may17["temp_lag_1d"], 44.0)  # Day prior (May 16)
        self.assertEqual(loc_a_may17["temp_lag_2d"], 42.0)  # 2 days prior (May 15)
        self.assertNotEqual(loc_a_may17["temp_lag_1d"], 47.0)  # Must NOT leak May 18

        # May 18 lags
        self.assertEqual(loc_a_may18["temp_lag_1d"], 46.0)  # Day prior (May 17)
        self.assertEqual(loc_a_may18["temp_lag_2d"], 44.0)  # 2 days prior (May 16)
        self.assertEqual(loc_a_may18["temp_lag_3d"], 42.0)  # 3 days prior (May 15)

    def test_separate_targets_present(self):
        """
        Verify both mortality_target and hospitalization_target are generated and correctly joined.
        """
        config = PipelineConfig(
            raw_weather_path=self.weather_file,
            demographics_path=self.demo_file,
            health_outcomes_path=self.health_file,
            output_processed_path=self.output_file,
            report_output_path=self.report_file,
        )
        pipeline = DatasetPreparationPipeline(config)
        df, report = pipeline.run()

        self.assertIn("mortality_target", df.columns)
        self.assertIn("hospitalization_target", df.columns)
        self.assertFalse(df["mortality_target"].isna().any())
        self.assertFalse(df["hospitalization_target"].isna().any())

        # Target statistics in report
        self.assertIn("mortality_target", report["target_statistics"])
        self.assertIn("hospitalization_target", report["target_statistics"])

    def test_demo_mode_synthetic_targets(self):
        """
        Verify that when health outcomes are missing:
        - demo_mode=False raises explicit ValueError
        - demo_mode=True produces marked synthetic demo targets
        """
        config_no_demo = PipelineConfig(
            raw_weather_path=self.weather_file,
            demographics_path=self.demo_file,
            health_outcomes_path=None,
            output_processed_path=self.output_file,
            report_output_path=self.report_file,
            demo_mode=False,
        )
        pipeline_no_demo = DatasetPreparationPipeline(config_no_demo)
        with self.assertRaises(ValueError):
            pipeline_no_demo.run()

        # With demo_mode=True
        config_demo = PipelineConfig(
            raw_weather_path=self.weather_file,
            demographics_path=self.demo_file,
            health_outcomes_path=None,
            output_processed_path=self.output_file,
            report_output_path=self.report_file,
            demo_mode=True,
        )
        pipeline_demo = DatasetPreparationPipeline(config_demo)
        df_demo, report_demo = pipeline_demo.run()

        self.assertTrue(df_demo["is_demo_synthetic_target"].all())
        self.assertIn("DEMO_SYNTHETIC_TARGETS", report_demo["target_data_source"])
        self.assertIn("demo_mode_warning", report_demo)

    def test_canonical_25_features_integrity(self):
        """
        Verify all 25 canonical feature columns exist in the processed dataset.
        """
        config = PipelineConfig(
            raw_weather_path=self.weather_file,
            demographics_path=self.demo_file,
            health_outcomes_path=self.health_file,
            output_processed_path=self.output_file,
            report_output_path=self.report_file,
        )
        pipeline = DatasetPreparationPipeline(config)
        df, _ = pipeline.run()

        for col in FEATURE_COLUMNS:
            self.assertIn(col, df.columns)
            self.assertFalse(df[col].isna().any())


if __name__ == "__main__":
    unittest.main()
