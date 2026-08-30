"""
FastAPI Microservice Entrypoint for ThermoGuard Machine Learning Service
"""

import asyncio
from datetime import datetime, timezone
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .config import settings
from .schemas import PredictionRequest, PredictionResponse, HealthResponse
from .prediction import predict_heatwave
from .model import model_manager

app = FastAPI(
    title=settings.app_name,
    description="Production-Ready Extreme Heatwave & Human Thermal Stress Prediction Microservice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    """Protects against long-running or hanging requests."""
    try:
        return await asyncio.wait_for(
            call_next(request),
            timeout=settings.request_timeout_seconds
        )
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={
                "error": "RequestTimeout",
                "message": f"Request exceeded maximum timeout of {settings.request_timeout_seconds} seconds.",
            },
        )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Structured error handler for Pydantic input validation failures."""
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", [])])
        msg = err.get("msg", "Invalid value")
        errors.append({"field": field, "message": msg})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "message": "Input validation failed. Please correct the provided parameters.",
            "details": errors,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTPError",
            "message": exc.detail,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred during prediction processing.",
        },
    )


@app.get("/", tags=["General"])
async def root():
    """Root metadata and service status."""
    return {
        "service": settings.app_name,
        "version": "1.0.0",
        "status": "ONLINE",
        "endpoints": {
            "health": "/health",
            "predict": "/ml/predict",
            "docs": "/docs",
        },
    }


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Health & Readiness Probe",
)
async def health():
    """Service health probe reporting uptime and model loading status."""
    return HealthResponse(
        status="HEALTHY",
        service=settings.app_name,
        version="1.0.0",
        model_loaded=model_manager.is_loaded,
        model_path=str(settings.secure_model_path),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.post(
    "/ml/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Inference"],
    summary="Deterministic Heatwave Risk Prediction",
)
async def predict(request_data: PredictionRequest):
    """
    Processes validated meteorological parameters through feature extraction and prediction modeling.
    Deterministic, self-contained, with zero external network requests.
    """
    prediction = predict_heatwave(request_data)
    return prediction
