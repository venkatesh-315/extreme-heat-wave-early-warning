/**
 * Machine Learning Controller
 * Exposes prediction endpoints communicating with Python FastAPI microservice
 */

const { predictHeatwaveRisk } = require('../services/mlClientService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Handle POST /api/ml/predict
 * Predict heatwave risk and biometeorological stress from request body
 */
const predictML = async (req, res, next) => {
  try {
    const payload = req.body || {};

    if (payload.temperature === undefined && payload.temp === undefined) {
      return errorResponse(res, 'Missing required parameter: temperature is required', 400);
    }

    const prediction = await predictHeatwaveRisk(payload);
    return successResponse(
      res,
      prediction,
      'Machine learning thermal risk prediction computed successfully'
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
      location_id: query.location_id || query.location,
      date: query.date,
    };

    const prediction = await predictHeatwaveRisk(payload);
    return successResponse(
      res,
      prediction,
      'Machine learning thermal risk prediction computed successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  predictML,
  predictMLGet,
};
