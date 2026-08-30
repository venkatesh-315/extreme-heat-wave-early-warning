/**
 * Machine Learning Controller
 * Exposes prediction, 3-5 day forecasting, & MongoDB query endpoints for ML thermal risk assessments
 */

const { predictHeatwaveRisk } = require('../services/mlClientService');
const {
  savePredictionRecord,
  queryPredictions,
  getLatestPredictionByLocation,
  sanitizeLocationId,
} = require('../services/mlPersistenceService');
const { generateMultiDayMLForecast } = require('../services/mlForecastService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Handle POST /api/ml/predict
 * Predict heatwave risk and persist to MongoDB
 */
const predictML = async (req, res, next) => {
  try {
    const payload = req.body || {};

    if (payload.temperature === undefined && payload.temp === undefined) {
      return errorResponse(res, 'Missing required parameter: temperature is required', 400);
    }

    const prediction = await predictHeatwaveRisk(payload);

    // Persist to MongoDB (non-blocking, graceful fallback)
    const persisted = await savePredictionRecord({
      location_id: payload.location_id || payload.locationCode || 'delhi',
      prediction_date: payload.date || payload.prediction_date || prediction.prediction_timestamp,
      forecast_horizon: payload.forecast_horizon || '0d',
      thermal_stress: prediction.thermal_stress,
      mortality_risk: prediction.mortality_risk,
      hospitalization_risk: prediction.hospitalization_risk,
      risk_level: prediction.risk_level,
      combined_risk_score: prediction.combined_risk_score,
      recommended_actions: prediction.recommended_actions,
      model_version: prediction.model_version,
      feature_schema_version: prediction.feature_schema_version,
    });

    return successResponse(
      res,
      {
        ...prediction,
        persisted: Boolean(persisted),
      },
      'Machine learning thermal risk prediction computed and recorded successfully'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Handle GET /api/ml/predict
 * Support query parameters for ease of inspection and GET requests
 */
const predictMLGet = async (req, res, next) => {
  try {
    const query = req.query || {};

    if (query.temperature === undefined && query.temp === undefined) {
      return errorResponse(res, 'Missing required query parameter: temperature is required (e.g. ?temperature=42&humidity=35)', 400);
    }

    const payload = {
      temperature: query.temperature || query.temp,
      humidity: query.humidity || query.rh,
      wind_speed: query.wind_speed || query.windSpeed,
      solar_radiation: query.solar_radiation || query.solarRadiation,
      surface_pressure: query.surface_pressure || query.surfacePressure,
      dew_point: query.dew_point || query.dewPoint,
      uv_index: query.uv_index || query.uvIndex,
      latitude: query.lat || query.latitude,
      longitude: query.lon || query.longitude,
      consecutive_hot_days: query.consecutive_hot_days || query.consecutiveHotDays,
      is_urban: query.is_urban !== undefined ? query.is_urban === 'true' : true,
      population_density: query.population_density || query.populationDensity,
      location_id: query.location_id || query.location || 'delhi',
      date: query.date,
    };

    const prediction = await predictHeatwaveRisk(payload);

    // Persist to MongoDB
    const persisted = await savePredictionRecord({
      location_id: payload.location_id,
      prediction_date: payload.date || prediction.prediction_timestamp,
      forecast_horizon: query.forecast_horizon || '0d',
      thermal_stress: prediction.thermal_stress,
      mortality_risk: prediction.mortality_risk,
      hospitalization_risk: prediction.hospitalization_risk,
      risk_level: prediction.risk_level,
      combined_risk_score: prediction.combined_risk_score,
      recommended_actions: prediction.recommended_actions,
      model_version: prediction.model_version,
      feature_schema_version: prediction.feature_schema_version,
    });

    return successResponse(
      res,
      {
        ...prediction,
        persisted: Boolean(persisted),
      },
      'Machine learning thermal risk prediction computed and recorded successfully'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Handle POST /api/ml/forecast
 * Execute the 3-5 day ML forecasting workflow for a location
 */
const generateForecast = async (req, res, next) => {
  try {
    const { location_id, location, days, horizon, horizonDays, lat, lon, latitude, longitude, is_urban, population_density } = req.body || {};

    const loc = location_id || location || 'delhi';
    const numDays = days || horizon || horizonDays || 3;

    const forecastResult = await generateMultiDayMLForecast({
      location_id: loc,
      latitude: lat || latitude,
      longitude: lon || longitude,
      horizonDays: numDays,
      is_urban,
      population_density,
    });

    if (forecastResult.status === 'ALREADY_IN_PROGRESS') {
      return res.status(409).json({
        success: false,
        error: 'JobAlreadyRunning',
        message: forecastResult.message,
      });
    }

    return successResponse(
      res,
      forecastResult,
      `${forecastResult.horizon_days}-day Machine Learning forecast computed and stored successfully`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Handle GET /api/ml/forecast
 * Execute or query the 3-5 day ML forecasting workflow via query parameters
 */
const generateForecastGet = async (req, res, next) => {
  try {
    const { location_id, location, days, horizon, horizonDays, lat, lon, latitude, longitude, is_urban, population_density } = req.query || {};

    const loc = location_id || location || 'delhi';
    const numDays = days || horizon || horizonDays || 3;

    const forecastResult = await generateMultiDayMLForecast({
      location_id: loc,
      latitude: lat || latitude,
      longitude: lon || longitude,
      horizonDays: numDays,
      is_urban: is_urban !== undefined ? is_urban === 'true' : undefined,
      population_density: population_density ? Number(population_density) : undefined,
    });

    if (forecastResult.status === 'ALREADY_IN_PROGRESS') {
      return res.status(409).json({
        success: false,
        error: 'JobAlreadyRunning',
        message: forecastResult.message,
      });
    }

    return successResponse(
      res,
      forecastResult,
      `${forecastResult.horizon_days}-day Machine Learning forecast computed and stored successfully`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Handle GET /api/ml/predictions (or /api/ml/history)
 * Query stored predictions with filtering by location_id, prediction_date, risk_level
 */
const getMLPredictions = async (req, res, next) => {
  try {
    const { location_id, prediction_date, startDate, endDate, risk_level, limit, page } = req.query;

    const result = await queryPredictions({
      location_id,
      prediction_date,
      startDate,
      endDate,
      risk_level,
      limit,
      page,
    });

    return successResponse(
      res,
      result,
      'Historical ML predictions retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Handle GET /api/ml/latest/:location_id
 * Retrieve the latest prediction record for a location
 */
const getLatestPrediction = async (req, res, next) => {
  try {
    const locationId = req.params.location_id;
    if (!locationId) {
      return errorResponse(res, 'location_id path parameter is required', 400);
    }

    const latest = await getLatestPredictionByLocation(locationId);
    if (!latest) {
      return successResponse(
        res,
        null,
        `No stored prediction found for location '${locationId}'`
      );
    }

    return successResponse(
      res,
      latest,
      `Latest ML prediction for location '${locationId}' retrieved successfully`
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  predictML,
  predictMLGet,
  generateForecast,
  generateForecastGet,
  getMLPredictions,
  getLatestPrediction,
};
