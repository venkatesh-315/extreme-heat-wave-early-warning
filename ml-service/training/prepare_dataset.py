"""
ThermoGuard Training Data Preparation & Validation Pipeline
Loads raw historical weather, demographic, and health registries; enforces strict schemas;
deduplicates; prevents future-data leakage; computes thermodynamic & lag features; and generates
audit validation reports.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any, Tuple, List
import pandas as pd
import numpy as np

# Ensure app package is importable
CURRENT_DIR = Path(__file__).resolve().parent
SERVICE_DIR = CURRENT_DIR.parent
if str(SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVICE_DIR))

from app.features import (
    FEATURE_COLUMNS,
    FEATURE_SCHEMA_VERSION,
    DEFAULT_VULNERABILITY_BASELINES,
)
from app.thermal import (
    calculate_heat_index,
    calculate_wbgt,
    calculate_utci,
    calculate_cumulative_heat_exposure,
    validate_thermal_inputs,
)


@dataclass
class PipelineConfig:
    """Configuration for data preparation pipeline execution."""
    raw_weather_path: Path
    demographics_path: Optional[Path] = None
    health_outcomes_path: Optional[Path] = None
    output_processed_path: Path = SERVICE_DIR / "data" / "processed" / "training_dataset.parquet"
    report_output_path: Path = SERVICE_DIR / "data" / "processed" / "dataset_validation_report.json"
    demo_mode: bool = False
    hot_day_threshold_c: float = 40.0
    baseline_threshold_c: float = 35.0


class DatasetPreparationPipeline:
    """
    Robust, leak-free ETL pipeline for processing meteorological, exposure, and epidemiological data.
    """

    def __init__(self, config: PipelineConfig):
        self.config = config
        self.metrics: Dict[str, Any] = {
            "schema_version": FEATURE_SCHEMA_VERSION,
            "feature_count": len(FEATURE_COLUMNS),
            "demo_mode": config.demo_mode,
        }

    def load_weather_data(self) -> pd.DataFrame:
        """Loads and parses raw meteorological data from CSV, JSON, or Parquet."""
        path = self.config.raw_weather_path
        if not path.exists():
            raise FileNotFoundError(f"Raw weather dataset not found at: {path}")

        if path.suffix == ".csv":
            df = pd.read_csv(path)
        elif path.suffix == ".json":
            df = pd.read_json(path)
        elif path.suffix in [".parquet", ".pq"]:
            df = pd.read_parquet(path)
        else:
            raise ValueError(f"Unsupported file format '{path.suffix}'. Use CSV, JSON, or Parquet.")

        self.metrics["raw_row_count"] = int(len(df))
        return df

    def validate_and_standardize_weather_schema(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validates column presence, aliases, unit bounds, and date parsing."""
        df = df.copy()

        # Handle humidity column aliases
        if "relative_humidity" in df.columns and "humidity" not in df.columns:
            df["humidity"] = df["relative_humidity"]
        elif "humidity" in df.columns and "relative_humidity" not in df.columns:
            df["relative_humidity"] = df["humidity"]

        required_cols = ["location_id", "date", "temperature", "humidity", "wind_speed", "solar_radiation"]
        missing_required = [col for col in required_cols if col not in df.columns]
        if missing_required:
            raise ValueError(f"Raw weather data is missing required columns: {missing_required}")

        # Optional defaults
        if "surface_pressure" not in df.columns:
            df["surface_pressure"] = 1000.0
        if "rainfall_mm" not in df.columns:
            df["rainfall_mm"] = 0.0

        # Validate date column
        try:
            df["date"] = pd.to_datetime(df["date"])
        except Exception as e:
            raise ValueError(f"Failed to parse 'date' column into datetime: {str(e)}")

        # Validate physical meteorological ranges
        invalid_temp = df[~df["temperature"].between(-15.0, 65.0)]
        if not invalid_temp.empty:
            raise ValueError(f"Found {len(invalid_temp)} rows with temperature outside valid range [-15, 65] °C.")

        invalid_rh = df[~df["humidity"].between(0.0, 100.0)]
        if not invalid_rh.empty:
            raise ValueError(f"Found {len(invalid_rh)} rows with humidity outside valid range [0, 100] %.")

        invalid_wind = df[df["wind_speed"] < 0.0]
        if not invalid_wind.empty:
            raise ValueError(f"Found {len(invalid_wind)} rows with negative wind speed.")

        invalid_solar = df[df["solar_radiation"] < 0.0]
        if not invalid_solar.empty:
            raise ValueError(f"Found {len(invalid_solar)} rows with negative solar radiation.")

        return df

    def deduplicate_records(self, df: pd.DataFrame) -> pd.DataFrame:
        """Removes exact and key-level duplicates on (location_id, date)."""
        initial_len = len(df)
        df_clean = df.drop_duplicates(subset=["location_id", "date"], keep="last").copy()
        dupes_removed = initial_len - len(df_clean)
        self.metrics["duplicates_removed_count"] = int(dupes_removed)
        self.metrics["deduplicated_row_count"] = int(len(df_clean))
        return df_clean

    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Explicitly tracks and handles missing values within each location timeseries."""
        df = df.copy()

        missing_before = {col: float(round(df[col].isna().mean() * 100, 2)) for col in df.columns}
        self.metrics["missing_percentages_before"] = missing_before

        # Forward fill then backward fill within each location group for minor meteorological gaps
        weather_numeric = ["temperature", "humidity", "wind_speed", "solar_radiation", "surface_pressure", "rainfall_mm"]
        for col in weather_numeric:
            if col in df.columns:
                df[col] = df.groupby("location_id")[col].transform(lambda group: group.ffill().bfill())

        # Drop any remaining unfillable corrupted rows
        df = df.dropna(subset=["temperature", "humidity"]).copy()

        missing_after = {col: float(round(df[col].isna().mean() * 100, 2)) for col in df.columns}
        self.metrics["missing_percentages_after"] = missing_after
        return df

    def compute_thermal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Vectorized execution of validated thermodynamic algorithms from app.thermal."""
        df = df.copy()

        t = df["temperature"].to_numpy(dtype=float)
        rh = df["humidity"].to_numpy(dtype=float)
        v = df["wind_speed"].to_numpy(dtype=float)
        sr = df["solar_radiation"].to_numpy(dtype=float)

        hi_list = [calculate_heat_index(temp, hum) for temp, hum in zip(t, rh)]
        wbgt_list = [calculate_wbgt(temp, hum, wind, sol) for temp, hum, wind, sol in zip(t, rh, v, sr)]
        utci_list = [calculate_utci(temp, hum, wind, sol) for temp, hum, wind, sol in zip(t, rh, v, sr)]

        df["heat_index"] = hi_list
        df["wbgt"] = wbgt_list
        df["utci"] = utci_list
        return df

    def compute_temporal_and_lag_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Chronologically sorts by (location_id, date) and computes temporal, lag, and cumulative exposure.
        Strictly enforces anti-leakage (zero future information).
        """
        df = df.copy()
        # 1. Strict Chronological Sort
        df.sort_values(by=["location_id", "date"], ascending=[True, True], inplace=True)
        df.reset_index(drop=True, inplace=True)

        # 2. Temporal calendar variables
        df["hour"] = df["date"].dt.hour.astype(float)
        df["day"] = df["date"].dt.day.astype(float)
        df["month"] = df["date"].dt.month.astype(float)
        df["day_of_year"] = df["date"].dt.dayofyear.astype(float)

        # 3. Consecutive Hot Days Calculation within each location
        def calc_consecutive_hot_days(series: pd.Series) -> pd.Series:
            is_hot = series >= self.config.hot_day_threshold_c
            # Cumulative count resetting on non-hot days
            return is_hot.groupby((~is_hot).cumsum()).cumsum().astype(float)

        df["consecutive_hot_days"] = df.groupby("location_id")["temperature"].transform(calc_consecutive_hot_days)

        # 4. Strict Past-Only Lags (No future leakage)
        # Shift(1), Shift(2), Shift(3) reference strictly past dates
        df["temp_lag_1d"] = df.groupby("location_id")["temperature"].shift(1)
        df["temp_lag_2d"] = df.groupby("location_id")["temperature"].shift(2)
        df["temp_lag_3d"] = df.groupby("location_id")["temperature"].shift(3)

        df["wbgt_lag_1d"] = df.groupby("location_id")["wbgt"].shift(1)
        df["wbgt_lag_2d"] = df.groupby("location_id")["wbgt"].shift(2)
        df["wbgt_lag_3d"] = df.groupby("location_id")["wbgt"].shift(3)

        # Initial boundary imputation for first 1-3 days using past trajectory approximation
        df["temp_lag_1d"] = df["temp_lag_1d"].fillna(df["temperature"] - 1.2)
        df["temp_lag_2d"] = df["temp_lag_2d"].fillna(df["temperature"] - 2.0)
        df["temp_lag_3d"] = df["temp_lag_3d"].fillna(df["temperature"] - 3.0)

        df["wbgt_lag_1d"] = df["wbgt_lag_1d"].fillna(df["wbgt"] - 1.0)
        df["wbgt_lag_2d"] = df["wbgt_lag_2d"].fillna(df["wbgt"] - 1.8)
        df["wbgt_lag_3d"] = df["wbgt_lag_3d"].fillna(df["wbgt"] - 2.5)

        # 5. Cumulative Heat Exposure (°C·days above baseline threshold)
        excess_temp = np.maximum(0.0, df["temperature"] - self.config.baseline_threshold_c)
        df["cumulative_heat_exposure"] = (df["consecutive_hot_days"] * excess_temp).round(2)

        return df

    def join_demographics(self, df: pd.DataFrame) -> pd.DataFrame:
        """Joins demographic vulnerability factors using validated location_id keys."""
        df = df.copy()
        if self.config.demographics_path and self.config.demographics_path.exists():
            demo_df = pd.read_csv(self.config.demographics_path)
            if "location_id" not in demo_df.columns:
                raise ValueError("Demographics dataset must contain 'location_id' column.")
            demo_cols = ["location_id", "population_density", "elderly_percentage", "outdoor_worker_percentage", "children_percentage"]
            present_cols = [c for c in demo_cols if c in demo_df.columns]
            df = df.merge(demo_df[present_cols], on="location_id", how="left")

        # Explicitly fill missing demographic columns with census baselines
        if "population_density" not in df.columns or df["population_density"].isna().any():
            df["population_density"] = df["population_density"].fillna(10000.0)
        if "elderly_percentage" not in df.columns or df["elderly_percentage"].isna().any():
            df["elderly_percentage"] = df["elderly_percentage"].fillna(DEFAULT_VULNERABILITY_BASELINES["elderly_percentage"])
        if "outdoor_worker_percentage" not in df.columns or df["outdoor_worker_percentage"].isna().any():
            df["outdoor_worker_percentage"] = df["outdoor_worker_percentage"].fillna(DEFAULT_VULNERABILITY_BASELINES["outdoor_worker_percentage"])
        if "children_percentage" not in df.columns or df["children_percentage"].isna().any():
            df["children_percentage"] = df["children_percentage"].fillna(DEFAULT_VULNERABILITY_BASELINES["children_percentage"])

        return df

    def join_health_outcomes(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Joins health outcome records on (location_id, date).
        If real health data is absent and demo_mode is True, generates marked synthetic demo targets.
        Never fabricates health targets without explicit demo mode flag.
        """
        df = df.copy()

        if self.config.health_outcomes_path and self.config.health_outcomes_path.exists():
            health_df = pd.read_csv(self.config.health_outcomes_path)
            health_df["date"] = pd.to_datetime(health_df["date"])
            required_target_cols = ["location_id", "date", "mortality_target", "hospitalization_target"]
            missing = [c for c in required_target_cols if c not in health_df.columns]
            if missing:
                raise ValueError(f"Health outcome dataset is missing target columns: {missing}")

            df = df.merge(health_df[required_target_cols], on=["location_id", "date"], how="left")
            df["is_demo_synthetic_target"] = False
            self.metrics["target_data_source"] = "Observed Registry Data"
        else:
            if not self.config.demo_mode:
                raise ValueError(
                    "Health outcome dataset not found. Provide health registry data or enable --demo mode for UI/testing."
                )

            # DEMO MODE ONLY: clearly marked synthetic approximations
            # Strictly for pipeline structure verification, never for claiming model accuracy.
            t = df["temperature"].to_numpy()
            wbgt = df["wbgt"].to_numpy()
            hot_days = df["consecutive_hot_days"].to_numpy()
            pop_density = df["population_density"].to_numpy()

            # Exponential thermal stress formulation for testing targets
            synthetic_mortality = np.clip(
                (wbgt - 28.0) * 8.5 + (t - 40.0) * 4.0 + hot_days * 3.5 + (pop_density / 5000.0),
                0.0,
                100.0,
            ).round(1)

            synthetic_hosp = np.clip(
                synthetic_mortality * 4.2 + (t - 38.0) * 12.0,
                0.0,
                500.0,
            ).round(1)

            df["mortality_target"] = synthetic_mortality
            df["hospitalization_target"] = synthetic_hosp
            df["is_demo_synthetic_target"] = True
            self.metrics["target_data_source"] = "DEMO_SYNTHETIC_TARGETS (UI/Testing Only)"
            self.metrics["demo_mode_warning"] = (
                "WARNING: Health outcome targets are synthetic demonstrations ONLY for UI/testing. "
                "DO NOT use for epidemiological or clinical claims."
            )

        return df

    def generate_validation_report(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generates comprehensive audit metrics on dataset shape, date span, and feature ranges."""
        self.metrics["processed_row_count"] = int(len(df))
        self.metrics["unique_locations_count"] = int(df["location_id"].nunique())
        self.metrics["unique_locations"] = sorted(df["location_id"].unique().tolist())
        self.metrics["date_range"] = {
            "start_date": df["date"].min().strftime("%Y-%m-%d"),
            "end_date": df["date"].max().strftime("%Y-%m-%d"),
            "span_days": int((df["date"].max() - df["date"].min()).days + 1),
        }

        # Feature Summary Statistics for all 25 features
        feature_stats = {}
        for col in FEATURE_COLUMNS:
            if col in df.columns:
                feature_stats[col] = {
                    "min": float(round(df[col].min(), 2)),
                    "max": float(round(df[col].max(), 2)),
                    "mean": float(round(df[col].mean(), 2)),
                    "std": float(round(df[col].std(), 2)),
                }
        self.metrics["feature_statistics"] = feature_stats

        # Target Distributions
        target_stats = {}
        for target in ["mortality_target", "hospitalization_target"]:
            if target in df.columns:
                target_stats[target] = {
                    "min": float(round(df[target].min(), 2)),
                    "p25": float(round(df[target].quantile(0.25), 2)),
                    "median": float(round(df[target].median(), 2)),
                    "p75": float(round(df[target].quantile(0.75), 2)),
                    "max": float(round(df[target].max(), 2)),
                    "mean": float(round(df[target].mean(), 2)),
                    "std": float(round(df[target].std(), 2)),
                }
        self.metrics["target_statistics"] = target_stats

        return self.metrics

    def run(self) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Executes the full end-to-end dataset preparation pipeline."""
        print("========================================================")
        print(">> ThermoGuard Reusable Training Dataset Pipeline")
        print("========================================================")

        # 1. Load Raw
        df_raw = self.load_weather_data()
        print(f"Loaded {len(df_raw)} raw meteorological records from {self.config.raw_weather_path.name}")

        # 2. Schema Validation
        df_valid = self.validate_and_standardize_weather_schema(df_raw)

        # 3. Deduplication
        df_dedup = self.deduplicate_records(df_valid)
        print(f"Deduplication: removed {self.metrics['duplicates_removed_count']} duplicate records.")

        # 4. Missing Values
        df_clean = self.handle_missing_values(df_dedup)

        # 5. Thermal Feature Engineering
        print("Computing biometeorological thermal features (Heat Index, WBGT, UTCI)...")
        df_thermal = self.compute_thermal_features(df_clean)

        # 6. Temporal & Lag Features (Anti-leakage)
        print("Computing chronological lags and cumulative exposure (anti-leakage verified)...")
        df_temporal = self.compute_temporal_and_lag_features(df_thermal)

        # 7. Join Demographics
        print("Joining demographic vulnerability parameters...")
        df_demo = self.join_demographics(df_temporal)

        # 8. Join Health Outcomes (Mortality & Hospitalization Targets)
        print("Joining health outcome targets...")
        df_final = self.join_health_outcomes(df_demo)

        # 9. Verify 25 Feature Columns presence
        missing_features = [col for col in FEATURE_COLUMNS if col not in df_final.columns]
        if missing_features:
            raise ValueError(f"Final processed dataset is missing canonical features: {missing_features}")

        # 10. Generate Validation Report
        report = self.generate_validation_report(df_final)

        # 11. Save Processed Artifacts
        self.config.output_processed_path.parent.mkdir(parents=True, exist_ok=True)
        if self.config.output_processed_path.suffix == ".csv":
            df_final.to_csv(self.config.output_processed_path, index=False)
        else:
            df_final.to_parquet(self.config.output_processed_path, index=False)
        print(f">> Processed dataset saved to: {self.config.output_processed_path}")

        # Save JSON Report
        self.config.report_output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config.report_output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        print(f">> Validation audit report saved to: {self.config.report_output_path}")

        return df_final, report


def main():
    """CLI entry point for running the dataset preparation pipeline."""
    parser = argparse.ArgumentParser(description="ThermoGuard Training Dataset Preparation Pipeline")
    parser.add_argument("--weather", type=str, default=str(SERVICE_DIR / "data" / "raw" / "sample_weather.csv"))
    parser.add_argument("--demographics", type=str, default=str(SERVICE_DIR / "data" / "raw" / "sample_demographics.csv"))
    parser.add_argument("--health", type=str, default=None)
    parser.add_argument("--output", type=str, default=str(SERVICE_DIR / "data" / "processed" / "processed_training_dataset.parquet"))
    parser.add_argument("--report", type=str, default=str(SERVICE_DIR / "data" / "processed" / "dataset_validation_report.json"))
    parser.add_argument("--demo", action="store_true", help="Enable demo mode with marked synthetic targets for UI/testing")

    args = parser.parse_args()

    config = PipelineConfig(
        raw_weather_path=Path(args.weather),
        demographics_path=Path(args.demographics) if args.demographics else None,
        health_outcomes_path=Path(args.health) if (args.health and Path(args.health).exists()) else None,
        output_processed_path=Path(args.output),
        report_output_path=Path(args.report),
        demo_mode=args.demo,
    )

    pipeline = DatasetPreparationPipeline(config)
    _, report = pipeline.run()

    print("\n========================================================")
    print("Dataset Validation Summary:")
    print(f"  Processed Rows:    {report['processed_row_count']}")
    print(f"  Date Span:         {report['date_range']['start_date']} to {report['date_range']['end_date']} ({report['date_range']['span_days']} days)")
    print(f"  Target Source:     {report['target_data_source']}")
    print("========================================================")


if __name__ == "__main__":
    main()
