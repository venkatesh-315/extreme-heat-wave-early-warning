"""
FastAPI Microservice Entrypoint for ThermoGuard Machine Learning Pipeline
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .schemas import HeatwavePredictionRequest, HeatwavePredictionResponse
from .model_engine import ml_engine

app = FastAPI(
    title="ThermoGuard ML Microservice",
    description="Production-Ready Extreme Heatwave Early Warning & Biometeorological XGBoost Inference Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    """Service status and metadata."""
    return {
        "service": "ThermoGuard Python ML Microservice",
        "version": "1.0.0",
        "status": "ONLINE",
        "model_engine": "XGBoost 3.x (Multi-Output Ensemble)",
        "model_ready": ml_engine.is_ready,
        "endpoints": {
            "predict": "/ml/predict",
            "health": "/health",
            "docs": "/docs",
        },
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Kubernetes / Node.js heartbeat probe."""
    return {
        "status": "HEALTHY",
        "model_ready": ml_engine.is_ready,
        "framework": "FastAPI + XGBoost",
    }


@app.post(
    "/ml/predict",
    response_model=HeatwavePredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Inference"],
    summary="Predict Extreme Heatwave Risk & Thermal Metrics",
    description="Processes meteorological variables through thermodynamic feature engineering and XGBoost ensemble inference to predict mortality risk, calibrated WBGT/UTCI, and IMD alert levels.",
)
async def predict_heatwave(request: HeatwavePredictionRequest):
    try:
        prediction = ml_engine.predict(request)
        return prediction
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error in XGBoost pipeline: {str(err)}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
