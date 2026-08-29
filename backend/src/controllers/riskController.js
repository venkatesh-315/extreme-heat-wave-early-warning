const { fetchWeatherData } = require('../services/weatherSyncService');
const { generateRecommendations } = require('../services/recommendationService');
const { HISTORICAL_MORTALITY_DATA } = require('../utils/seedData');
const { successResponse } = require('../utils/responseFormatter');

/**
 * Get Mortality Risk Assessment & Excess Vulnerability
 * GET /api/risk/mortality
 */
const getMortalityRisk = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139;
    const lon = parseFloat(req.query.lon) || 77.2090;
    const population = parseInt(req.query.population, 10) || 1500000;

    const weatherResult = await fetchWeatherData(lat, lon);
    const mortalityScore = weatherResult.thermalMetrics.mortalityRisk;

    const estimatedExcess = Math.round(population * mortalityScore * 0.000025);

    return successResponse(
      res,
      {
        mortalityRiskScore: mortalityScore,
        riskLevel: mortalityScore >= 60 ? 'Catastrophic' : mortalityScore >= 45 ? 'Extreme' : mortalityScore >= 25 ? 'High' : 'Moderate',
        populationAssessed: population,
        estimatedExcessExposure: estimatedExcess,
        vulnerabilityBreakdown: {
          elderlyAtRisk: Math.round(population * 0.08),
          childrenAtRisk: Math.round(population * 0.12),
          outdoorLabourersAtRisk: Math.round(population * 0.15),
          slumResidentsAtRisk: Math.round(population * 0.22),
        },
        metricsSnapshot: {
          temperature: weatherResult.weather.temperature,
          wbgt: weatherResult.thermalMetrics.wbgt,
          utci: weatherResult.thermalMetrics.utci,
          heatIndex: weatherResult.thermalMetrics.hi,
        },
      },
      'Mortality risk assessment generated'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get Historical Heatwave Mortality Trend (2019 - 2026)
 * GET /api/risk/historical
 */
const getHistoricalMortality = async (req, res, next) => {
  try {
    return successResponse(
      res,
      {
        historicalTrend: HISTORICAL_MORTALITY_DATA,
        analysis: 'Steep upward trajectory in heat-related excess mortality correlating with rising peak summer WBGT and consecutive heatwave spells.',
      },
      'Historical heatwave mortality trend dataset retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get Public Health Recommendations (NDMA Heat Action Plan)
 * GET /api/risk/recommendations
 */
const getRecommendations = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139;
    const lon = parseFloat(req.query.lon) || 77.2090;
    const population = parseInt(req.query.population, 10) || 1500000;

    const weatherResult = await fetchWeatherData(lat, lon);
    const recs = generateRecommendations(
      weatherResult.thermalMetrics.wbgt,
      weatherResult.thermalMetrics.mortalityRisk,
      population,
      weatherResult.weather.temperature
    );

    return successResponse(
      res,
      {
        recommendations: recs,
        totalActions: recs.length,
        criticalPriorityCount: recs.filter((r) => r.priority === 'CRITICAL').length,
        standard: 'National Disaster Management Authority (NDMA) National Guidelines for Heat Wave Management',
      },
      'Sector-wise heatwave mitigation directives retrieved'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMortalityRisk,
  getHistoricalMortality,
  getRecommendations,
};
