/**
 * Official Indian Health Data Ingestion Pipeline
 * Ingests, validates, and archives official epidemiological heatwave datasets with metadata.
 */

const { HealthDatasetMetadata, HEALTH_TARGET_DEFINITIONS, HEALTH_GEOGRAPHIC_GRANULARITY } = require('./health_dataset_schema');
const { validateHealthRecord, evaluateHealthDatasetSuitability } = require('./health_data_validator');
const logger = require('../../backend/src/utils/logger');

class HealthDataIngestionPipeline {
  constructor(datasetConfig = {}) {
    this.metadata = new HealthDatasetMetadata(datasetConfig);
  }

  /**
   * Processes and validates raw health records from official sources
   * @param {Array<Object>} rawRecords - Raw health observation records
   * @returns {{ processed: Array<Object>, rejected: Array<Object>, metadata: Object, suitability: Object }}
   */
  processHealthDataset(rawRecords = []) {
    if (!Array.isArray(rawRecords)) {
      throw new Error('rawRecords must be an array');
    }

    logger.info(`Processing health dataset "${this.metadata.dataset_name}" (${rawRecords.length} records)...`);

    const suitability = evaluateHealthDatasetSuitability(this.metadata);
    this.metadata.is_suitable_for_ml_target = suitability.isSuitable;
    this.metadata.suitability_rationale = suitability.rationale;

    const cleanRecords = [];
    const rejectedRecords = [];
    const deduplicatedMap = new Map();

    for (const raw of rawRecords) {
      const val = validateHealthRecord(raw, this.metadata);
      if (!val.valid) {
        rejectedRecords.push({ record: raw, errors: val.errors });
        continue;
      }

      const locId = (raw.location_id || 'unknown').toLowerCase();
      const dateStr = (raw.date || raw.timestamp).split('T')[0];
      const target = raw.target_definition || this.metadata.target_definition;
      const dedupeKey = `${locId}:${dateStr}:${target}`;

      const normalized = {
        location_id: locId,
        state: raw.state,
        district: raw.district || null,
        city: raw.city || null,
        date: dateStr,
        timestamp: new Date(raw.timestamp || dateStr).toISOString(),
        target_definition: target,
        observed_count: raw.observed_count !== undefined ? Number(raw.observed_count) : null,
        rate_per_100k: raw.rate_per_100k !== undefined ? Number(raw.rate_per_100k) : null,
        dataset_source: this.metadata.source,
        dataset_name: this.metadata.dataset_name,
        is_official_government_data: true,
        suitability_status: suitability.status,
        import_timestamp: new Date().toISOString(),
      };

      deduplicatedMap.set(dedupeKey, normalized);
    }

    const processedList = Array.from(deduplicatedMap.values());
    processedList.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (processedList.length > 0) {
      this.metadata.date_range = {
        start: processedList[0].date,
        end: processedList[processedList.length - 1].date,
      };
    }

    logger.info(`Completed health dataset processing: ${processedList.length} valid records, ${rejectedRecords.length} rejected, suitability: ${suitability.status}`);

    return {
      processed: processedList,
      rejected: rejectedRecords,
      metadata: this.metadata.toJSON(),
      suitability,
    };
  }
}

module.exports = {
  HealthDataIngestionPipeline,
};
