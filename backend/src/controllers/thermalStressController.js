const { computeFullThermalProfile } = require('../services/thermalCalculationService');
const { fetchWeatherData } = require('../services/weatherSyncService');
const { predictHeatwaveRisk } = require('../services/mlClientService');
const { successResponse } = require('../utils/responseFormatter');

/**
 * Get Current Thermal Stress for Location
 * GET /api/thermal-stress/current
 */
const getCurrentThermalStress = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139;
    const lon = parseFloat(req.query.lon) || 77.2090;

    const weatherResult = await fetchWeatherData(lat, lon);

    return successResponse(
      res,
      {
        thermalMetrics: weatherResult.thermalMetrics,
        weatherConditions: {
          temperature: weatherResult.weather.temperature,
          humidity: weatherResult.weather.humidity,
          windSpeed: weatherResult.weather.windSpeed,
          solarRadiation: weatherResult.weather.solarRadiation,
        },
        calculatedAt: new Date().toISOString(),
      },
      'Current thermal stress metrics retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * On-the-fly Thermal Stress Calculation
 * POST /api/thermal-stress/calculate
 */
const calculateMetrics = async (req, res, next) => {
  try {
    const { temperature, humidity, windSpeed = 2.5, solarRadiation = 800, lat = 22.0 } = req.body;

    const profile = computeFullThermalProfile({
      temperature: Number(temperature),
      humidity: Number(humidity),
      windSpeed: Number(windSpeed),
      solarRadiation: Number(solarRadiation),
      lat: Number(lat),
    });

    return successResponse(
      res,
      {
        inputs: {
          temperature: Number(temperature),
          humidity: Number(humidity),
          windSpeed: Number(windSpeed),
          solarRadiation: Number(solarRadiation),
          lat: Number(lat),
        },
        results: profile,
      },
      'Thermal stress calculations computed successfully'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Machine Learning Heatwave Inference
 * POST /api/thermal-stress/ml-predict
 */
const predictMLStress = async (req, res, next) => {
  try {
    const predictionResult = await predictHeatwaveRisk(req.body);
    return successResponse(
      res,
      predictionResult,
      'Machine Learning heatwave risk prediction computed successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCurrentThermalStress,
  calculateMetrics,
  predictMLStress,
};
