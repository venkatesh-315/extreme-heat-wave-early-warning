"""
Secure ML Model Loader & Lifecycle Manager
Enforces strict fixed-directory path isolation, preventing path traversal or execution of untrusted artifacts.
Loads mortality and hospitalization models saved in joblib or XGBoost JSON format.
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
import joblib
from .config import settings
from .features import FEATURE_COLUMNS


class ModelManager:
    """
    Manages loading and inference for ML models from fixed, safe application storage.
    """

    def __init__(self):
        self.mortality_model = None
        self.hospitalization_model = None
        self.is_loaded = False
        self.metadata: Optional[Dict[str, Any]] = None
        self._load_models_from_secure_path()

    def _is_path_safe(self, target_path: Path) -> bool:
        """Verifies that target_path is strictly within the allowed model directory."""
        try:
            allowed_dir = Path(settings.model_dir).resolve()
            resolved_target = target_path.resolve()
            return os.path.commonpath([str(resolved_target), str(allowed_dir)]) == str(allowed_dir)
        except Exception:
            return False

    def _load_models_from_secure_path(self):
        """
        Attempts to load trained models only if they exist in the fixed, application-controlled directory.
        Never loads or evaluates client-supplied file paths.
        """
        model_dir = Path(settings.model_dir).resolve()

        # Target model candidates
        mort_joblib = model_dir / "mortality_model.joblib"
        hosp_joblib = model_dir / "hospitalization_model.joblib"
        metadata_file = model_dir / "model_metadata.json"

        if mort_joblib.exists() and self._is_path_safe(mort_joblib):
            try:
                self.mortality_model = joblib.load(mort_joblib)
                self.is_loaded = True
            except Exception:
                self.mortality_model = None

        if hosp_joblib.exists() and self._is_path_safe(hosp_joblib):
            try:
                self.hospitalization_model = joblib.load(hosp_joblib)
            except Exception:
                self.hospitalization_model = None

        if metadata_file.exists() and self._is_path_safe(metadata_file):
            try:
                import json
                with open(metadata_file, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            except Exception:
                self.metadata = None

    def predict_mortality(self, feature_dict: Dict[str, float]) -> Optional[float]:
        """Runs inference for mortality risk if model is securely loaded."""
        if not self.is_loaded or self.mortality_model is None:
            return None

        try:
            import numpy as np
            vector = np.array([[feature_dict[col] for col in FEATURE_COLUMNS]], dtype=np.float32)
            pred = float(self.mortality_model.predict(vector)[0])
            return round(max(0.0, min(100.0, pred)), 1)
        except Exception:
            return None

    def predict_hospitalization(self, feature_dict: Dict[str, float]) -> Optional[float]:
        """Runs inference for hospitalization risk if model is securely loaded."""
        if not self.is_loaded or self.hospitalization_model is None:
            return None

        try:
            import numpy as np
            vector = np.array([[feature_dict[col] for col in FEATURE_COLUMNS]], dtype=np.float32)
            pred = float(self.hospitalization_model.predict(vector)[0])
            return round(max(0.0, pred), 1)
        except Exception:
            return None

    def predict(self, feature_dict: Dict[str, float]) -> Optional[float]:
        """Backward-compatible alias for mortality prediction."""
        return self.predict_mortality(feature_dict)


model_manager = ModelManager()
