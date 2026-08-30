"""
Secure ML Model Loader & Lifecycle Manager
Enforces strict fixed-directory path isolation, preventing path traversal or execution of untrusted artifacts.
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any
from .config import settings

FEATURE_COLUMNS = [
    "temperature",
    "humidity",
    "wind_speed",
    "solar_radiation",
    "surface_pressure",
    "dew_point",
    "uv_index",
    "consecutive_hot_days",
    "is_urban",
    "population_density",
    "vapor_pressure",
    "vapor_pressure_deficit",
    "dew_point_depression",
    "enthalpy",
    "effective_solar",
    "compound_stress",
    "uhi_offset",
    "hotspell_severity",
    "heat_index",
    "wbgt",
    "utci",
]


class ModelManager:
    """
    Manages loading and inference for ML models from fixed, safe application storage.
    """

    def __init__(self):
        self.model = None
        self.is_loaded = False
        self.model_path: Optional[Path] = None
        self._load_model_from_secure_path()

    def _is_path_safe(self, target_path: Path) -> bool:
        """Verifies that target_path is strictly within the allowed model directory."""
        try:
            allowed_dir = Path(settings.model_dir).resolve()
            resolved_target = target_path.resolve()
            return os.path.commonpath([str(resolved_target), str(allowed_dir)]) == str(allowed_dir)
        except Exception:
            return False

    def _load_model_from_secure_path(self):
        """
        Attempts to load a trained model only if it exists in the fixed, application-controlled directory.
        Never loads or evaluates client-supplied file paths.
        """
        target_path = settings.secure_model_path

        if not self._is_path_safe(target_path):
            self.is_loaded = False
            return

        if target_path.exists() and target_path.is_file():
            try:
                import xgboost as xgb
                self.model = xgb.XGBRegressor()
                self.model.load_model(str(target_path))
                self.is_loaded = True
                self.model_path = target_path
            except Exception:
                self.model = None
                self.is_loaded = False
        else:
            # Model artifact not present yet (clean initial state)
            self.model = None
            self.is_loaded = False

    def predict(self, feature_dict: Dict[str, float]) -> Optional[float]:
        """
        Runs inference if model artifact is securely loaded; returns None otherwise.
        """
        if not self.is_loaded or self.model is None:
            return None

        try:
            import numpy as np
            vector = np.array([[feature_dict[col] for col in FEATURE_COLUMNS]], dtype=np.float32)
            raw_prediction = float(self.model.predict(vector)[0])
            return raw_prediction
        except Exception:
            return None


model_manager = ModelManager()
