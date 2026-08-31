"""
Configuration Management for ThermoGuard ML Microservice
Loads settings exclusively from environment variables with secure, fixed paths.
"""

import os
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_MODEL_DIR = str(BASE_DIR / "models")


class Settings:
    """
    Application Settings loaded from environment variables with fallback defaults.
    """

    def __init__(self):
        self.app_name: str = os.getenv("APP_NAME", "ThermoGuard ML Service")
        self.app_env: str = os.getenv("APP_ENV", "development")
        self.host: str = os.getenv("HOST", "0.0.0.0")
        self.port: int = int(os.getenv("PORT", "8000"))
        self.debug: bool = os.getenv("DEBUG", "false").lower() == "true"

        # Security: Fixed application-controlled model directory (never client-supplied)
        self.model_dir: str = os.getenv("MODEL_DIR", DEFAULT_MODEL_DIR)
        self.model_filename: str = os.getenv("MODEL_FILENAME", "xgb_heatwave.json")

        # Request Protection & Timeouts
        self.request_timeout_seconds: float = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "5.0"))
        self.max_content_length: int = int(os.getenv("MAX_CONTENT_LENGTH", "1048576"))

        # CORS Allowed Origins
        self.cors_origins: str = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5000,http://localhost:5173,http://127.0.0.1:5000,http://127.0.0.1:5173",
        )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def secure_model_path(self) -> Path:
        """Returns the safe, absolute path to the model artifact."""
        safe_dir = Path(self.model_dir).resolve()
        return safe_dir / self.model_filename


settings = Settings()
