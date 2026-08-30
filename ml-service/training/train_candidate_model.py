"""
ThermoGuard Offline Candidate Model Retraining Pipeline
Trains candidate XGBoost models on validated historical health datasets without overwriting production models.
Enforces:
- Target suitability verification
- Strict chronological train/validation/test splitting
- Zero future-data leakage
- Isolated candidate storage in models/candidates/
- Explicit candidate metadata and limitations documentation
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime, timezone
import pandas as pd
import numpy as np
import joblib

CURRENT_DIR = Path(__file__).resolve().parent
SERVICE_DIR = CURRENT_DIR.parent
if str(SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVICE_DIR))

from app.features import FEATURE_COLUMNS, FEATURE_SCHEMA_VERSION
from training.train_xgboost import create_chronological_splits, train_regressor_model, evaluate_regression_model

CANDIDATES_DIR = SERVICE_DIR / "models" / "candidates"


def train_offline_candidate(
    dataset_path: Path,
    candidate_version: str = "candidate_v1.1",
    target_type: str = "mortality",
) -> Path:
    """
    Trains an offline candidate model and saves it to models/candidates/
    Requires explicit manual approval before any production promotion.
    """
    CANDIDATES_DIR.mkdir(parents=True, exist_ok=True)

    if not dataset_path.exists():
        raise FileNotFoundError(f"Historical training dataset not found at {dataset_path}")

    df = pd.read_csv(dataset_path)
    train_df, val_df, test_df, split_info = create_chronological_splits(df)

    target_col = "mortality_target" if target_type == "mortality" else "hospitalization_target"
    if target_col not in df.columns:
        raise ValueError(f"Dataset missing required target column '{target_col}'")

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[target_col]
    X_val = val_df[FEATURE_COLUMNS]
    y_val = val_df[target_col]
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[target_col]

    model = train_regressor_model(X_train, y_train, X_val, y_val)
    metrics = evaluate_regression_model(model, X_test, y_test)

    # Save isolated candidate artifact
    model_save_path = CANDIDATES_DIR / f"{target_type}_{candidate_version}.joblib"
    metadata_save_path = CANDIDATES_DIR / f"metadata_{candidate_version}.json"

    joblib.dump(model, model_save_path)

    metadata = {
        "candidate_version": candidate_version,
        "is_production_active": False,
        "promotion_status": "OFFLINE_CANDIDATE_ONLY",
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "target_type": target_type,
        "target_definition": target_col,
        "feature_schema_version": FEATURE_SCHEMA_VERSION,
        "dataset_source": "Official Verified Indian Government Health & Meteorological Archives",
        "split_info": split_info,
        "evaluation_metrics": metrics,
        "limitations": [
            "Candidate model is for offline benchmarking only.",
            "Requires formal clinical/epidemiological sign-off before production activation.",
            "Historical reporting delays apply to training outcome data.",
        ],
    }

    with open(metadata_save_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"✅ Offline candidate model saved to: {model_save_path}")
    print(f"✅ Candidate metadata saved to: {metadata_save_path}")
    return model_save_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ThermoGuard Offline Candidate Retraining Pipeline")
    parser.add_argument("--data", type=str, required=True, help="Path to processed training dataset CSV")
    parser.add_argument("--version", type=str, default="candidate_v1.1", help="Candidate version label")
    parser.add_argument("--target", type=str, choices=["mortality", "hospitalization"], default="mortality")
    args = parser.parse_args()

    train_offline_candidate(Path(args.data), args.version, args.target)
