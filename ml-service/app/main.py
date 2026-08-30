"""
FastAPI Microservice Entrypoint for ThermoGuard Machine Learning Service
Production-grade security, request IDs, rate limiting, payload protection, and structured logging.
"""

import time
import uuid
import logging
import asyncio
from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .config import settings
from .schemas import PredictionRequest, PredictionResponse, HealthResponse
from .prediction import predict_heatwave
from .model import model_manager

# Structured Logging Setup (server-side only, no secrets, no stack traces exposed to client)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [request_id=%(name)s] %(message)s",
)
logger = logging.getLogger("ThermoGuardML")

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

# In-Memory Rate Limiter (Sliding window per IP: 120 requests per 60 seconds)
RATE_LIMIT_WINDOW_SEC = 60
RATE_LIMIT_MAX_REQUESTS = 120
_ip_request_history: Dict[str, List[float]] = defaultdict(list)

# Maximum Allowed Request Payload Body (1 MB)
MAX_REQUEST_BODY_SIZE_BYTES = 1024 * 1024


@app.middleware("http")
async def security_and_logging_middleware(request: Request, call_next):
    """
    Handles:
    1. Unique Request ID tracing (X-Request-ID)
    2. Request Body Size verification (prevent memory exhaustion)
    3. In-memory Rate Limiting per client IP
    4. Request Timeout protection
    5. Structured latency logging
    """
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = req_id
    client_ip = request.client.host if request.client else "unknown"

    # 1. Payload Size Guard
    content_length = request.headers.get("Content-Length")
    if content_length:
        try:
            length_val = int(content_length)
            if length_val > MAX_REQUEST_BODY_SIZE_BYTES:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "error": "PayloadTooLarge",
                        "message": f"Request body exceeds maximum allowed size of {MAX_REQUEST_BODY_SIZE_BYTES} bytes.",
                        "request_id": req_id,
                    },
                )
        except ValueError:
            pass

    # 2. Rate Limiting Guard
    now = time.time()
    req_times = _ip_request_history[client_ip]
    _ip_request_history[client_ip] = [t for t in req_times if now - t < RATE_LIMIT_WINDOW_SEC]
    if len(_ip_request_history[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "RateLimitExceeded",
                "message": f"Too many requests from {client_ip}. Limit is {RATE_LIMIT_MAX_REQUESTS} requests per minute.",
                "request_id": req_id,
            },
            headers={"Retry-After": "60", "X-Request-ID": req_id},
        )
    _ip_request_history[client_ip].append(now)

    # 3. Timeout & Latency Execution
    start_time = time.time()
    try:
        response = await asyncio.wait_for(
            call_next(request),
            timeout=settings.request_timeout_seconds,
        )
        latency_ms = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = req_id

        logger.info(
            f"method={request.method} path={request.url.path} status={response.status_code} "
            f"latency_ms={latency_ms} ip={client_ip} req_id={req_id}"
        )
        return response

    except asyncio.TimeoutError:
        logger.error(f"Request timeout: path={request.url.path} req_id={req_id}")
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={
                "error": "RequestTimeout",
                "message": f"Request exceeded maximum timeout of {settings.request_timeout_seconds} seconds.",
                "request_id": req_id,
            },
            headers={"X-Request-ID": req_id},
        )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handles input validation failures and returns HTTP 400 Bad Request.
    Does not expose stack traces or internal filesystem paths.
    """
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    errors = []
    for err in exc.errors():
        loc_parts = [str(loc) for loc in err.get("loc", []) if loc != "body"]
        field_name = " -> ".join(loc_parts) if loc_parts else "request_body"
        msg = err.get("msg", "Invalid parameter value")
        errors.append({"field": field_name, "message": msg})

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "InvalidInput",
            "message": "Input validation failed. Please check the supplied parameters.",
            "details": errors,
            "request_id": req_id,
        },
        headers={"X-Request-ID": req_id},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handles standard HTTP exceptions."""
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTPError",
            "message": exc.detail,
            "request_id": req_id,
        },
        headers={"X-Request-ID": req_id},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catches unexpected server errors, returns HTTP 500, and hides internal details/paths/stack traces.
    """
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception(f"Unhandled exception during request processing [req_id={req_id}]")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred during prediction processing.",
            "request_id": req_id,
        },
        headers={"X-Request-ID": req_id},
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
        model_path=str(settings.secure_model_path.name),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.post(
    "/ml/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Inference"],
    summary="Deterministic XGBoost Heatwave Risk Prediction",
)
async def predict(request_data: PredictionRequest):
    """
    Processes validated meteorological, temporal, and demographic parameters through
    canonical feature extraction and versioned XGBoost machine learning inference.
    Always calculates derived thermal features internally without trusting client risk values.
    Deterministic, self-contained, with zero external network requests.
    """
    prediction = predict_heatwave(request_data)
    return prediction
