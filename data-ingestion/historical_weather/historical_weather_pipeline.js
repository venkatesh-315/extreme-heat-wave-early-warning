/**
 * Historical Meteorological Ingestion Pipeline (Offline Training & Evaluation)
 * Processes multi-year historical weather archives for Indian locations with gap detection and deduplication.
 */

const { INDIA_LOCATIONS_REGISTRY, getLocationById } = require('../locations/india_locations_registry');
const { validateHistoricalWeatherRecord, auditHistoricalTimeSeries } = require('./historical_weather_validator');
const logger = require('../../backend/src/utils/logger');

class HistoricalWeatherPipeline {
  constructor(config = {}) {
    this.datasetVersion = config.datasetVersion || 'IMD_HIST_v1.0';
    this.provider = config.provider || 'IMD_ERA5_GRID';
  }

  /**
   * Ingests, cleans, and normalizes a batch of raw historical weather observations
   * @param {Array<Object>} rawRecords - Raw meteorological records
   * @param {Object} options - Ingestion options
   * @returns {{ processed: Array<Object>, audit: Object, metadata: Object }}
   */
  processHistoricalBatch(rawRecords = [], options = {}) {
    if (!Array.isArray(rawRecords)) {
      throw new Error('rawRecords must be an array');
    }

    logger.info(`Processing historical weather batch of ${rawRecords.length} records...`);

    const validRecords = [];
    const invalidRecords = [];
    const deduplicatedMap = new Map();

    for (const raw of rawRecords) {
      const validation = validateHistoricalWeatherRecord(raw);
      if (!validation.valid) {
        invalidRecords.push({ record: raw, errors: validation.errors });
        continue;
      }

      const locId = (raw.location_id || 'unknown').toLowerCase();
      const dateStr = (raw.date || raw.timestamp).split('T')[0];
      const uniqueKey = `${locId}:${dateStr}`;

      const normalized = {
        location_id: locId,
        date: dateStr,
        timestamp: new Date(raw.timestamp || dateStr).toISOString(),
        temperature: Number(raw.temperature !== undefined ? raw.temperature : raw.temperature_c),
        humidity: Number(raw.humidity !== undefined ? raw.humidity : raw.relative_humidity_pct || 45.0),
        wind_speed: Number(raw.wind_speed !== undefined ? raw.wind_speed : raw.wind_speed_ms || 2.5),
        solar_radiation: Number(raw.solar_radiation !== undefined ? raw.solar_radiation : raw.solar_radiation_wm2 || 850.0),
        surface_pressure: Number(raw.surface_pressure || raw.surface_pressure_hpa || 1008.0),
        precipitation: Number(raw.precipitation || raw.precipitation_mm || 0.0),
        provider: this.provider,
        dataset_version: this.datasetVersion,
        ingested_at: new Date().toISOString(),
      };

      deduplicatedMap.set(uniqueKey, normalized);
    }

    const processedList = Array.from(deduplicatedMap.values());
    processedList.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Audit time-series continuity
    const auditReport = auditHistoricalTimeSeries(processedList);

    const metadata = {
      dataset_name: 'Historical Indian Meteorological Observations',
      provider: this.provider,
      version: this.datasetVersion,
      total_raw_records: rawRecords.length,
      valid_unique_records: processedList.length,
      invalid_records_count: invalidRecords.length,
      date_range: {
        start: processedList.length > 0 ? processedList[0].date : null,
        end: processedList.length > 0 ? processedList[processedList.length - 1].date : null,
      },
      audit: auditReport,
      created_at: new Date().toISOString(),
    };

    logger.info(`Completed historical weather batch: ${processedList.length} clean records (${auditReport.duplicates} duplicates removed)`);

    return {
      processed: processedList,
      invalid: invalidRecords,
      audit: auditReport,
      metadata,
    };
  }
}

module.exports = {
  HistoricalWeatherPipeline,
};
