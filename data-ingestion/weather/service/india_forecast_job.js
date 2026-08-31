/**
 * India-Wide Single-Run Multi-Day ML Forecasting Job
 * Executes 3 to 5 day ML forecast generation across validated Indian locations in bounded sequential batches.
 * Pure single-run execution: Zero permanent background loops, zero recursive timers.
 */

const { INDIA_LOCATIONS_REGISTRY } = require('../../locations/india_locations_registry');
const { processLocationBatch } = require('../../locations/location_validator');
const { generateMultiDayMLForecast } = require('../../../backend/src/services/mlForecastService');
const logger = require('../../../backend/src/utils/logger');

/**
 * Runs a single-pass forecasting job for all or selected Indian locations
 * @param {Object} options - Job options
 * @param {number} options.horizonDays - Forecast horizon (3 to 5 days)
 * @param {Array<string>} options.locationIds - Optional filter for specific location IDs
 * @param {number} options.batchSize - Batch size for concurrency control (default 4)
 * @returns {Promise<Object>} Job summary report
 */
async function runIndiaWideForecastingJob({
  horizonDays = 5,
  locationIds = null,
  batchSize = 4,
} = {}) {
  const startTime = Date.now();
  const targetLocations = locationIds && Array.isArray(locationIds) && locationIds.length > 0
    ? INDIA_LOCATIONS_REGISTRY.filter(l => locationIds.includes(l.location_id))
    : INDIA_LOCATIONS_REGISTRY;

  logger.info(`Starting single-run India-Wide ML forecasting job for ${targetLocations.length} locations (horizon: ${horizonDays} days)`);

  const results = await processLocationBatch(
    targetLocations,
    async (loc) => {
      const forecastResult = await generateMultiDayMLForecast({
        location_id: loc.location_id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        horizonDays,
        is_urban: loc.is_urban,
        population_density: loc.population_density,
      });

      return {
        location_id: loc.location_id,
        name: loc.name,
        state: loc.state,
        success: Boolean(forecastResult && Array.isArray(forecastResult.forecasts)),
        days_generated: forecastResult?.forecasts?.length || 0,
        peak_risk: forecastResult?.summary?.peak_risk_level || 'UNKNOWN',
      };
    },
    batchSize
  );

  const durationMs = Date.now() - startTime;
  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  logger.info(`Completed India-Wide ML forecasting job in ${durationMs}ms: ${succeeded} succeeded, ${failed} failed`);

  return {
    job: 'INDIA_WIDE_ML_FORECAST',
    timestamp: new Date().toISOString(),
    duration_ms: durationMs,
    total_locations: targetLocations.length,
    succeeded,
    failed,
    results,
  };
}

module.exports = {
  runIndiaWideForecastingJob,
};
