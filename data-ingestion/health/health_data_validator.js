/**
 * Health Dataset Quality & Target Semantics Validator
 * Validates demographic consistency, target definitions, and enforces non-fabrication.
 */

const { HEALTH_TARGET_DEFINITIONS, HEALTH_GEOGRAPHIC_GRANULARITY } = require('./health_dataset_schema');

/**
 * Validates a single health outcome observation record
 * @param {Object} record - Health observation record
 * @param {Object} metadata - Dataset metadata
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateHealthRecord(record, metadata = {}) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Record must be a non-null object'] };
  }

  // 1. Date Validation
  if (!record.date && !record.timestamp) {
    errors.push('Missing date/timestamp field in health observation');
  } else {
    const d = new Date(record.date || record.timestamp);
    if (isNaN(d.getTime())) {
      errors.push(`Invalid date format: ${record.date || record.timestamp}`);
    }
  }

  // 2. Location & Hierarchy Validation
  if (!record.location_id || typeof record.location_id !== 'string') {
    errors.push('Missing or invalid location_id');
  }
  if (!record.state || typeof record.state !== 'string') {
    errors.push('State identifier is required for geographic provenance');
  }

  // 3. Target Definition and Value Validation
  if (!record.target_definition || !HEALTH_TARGET_DEFINITIONS[record.target_definition]) {
    errors.push(`Target definition "${record.target_definition}" is not recognized or ambiguous`);
  }

  // Count/Rate must be non-negative numeric
  if (record.observed_count !== undefined && record.observed_count !== null) {
    const count = Number(record.observed_count);
    if (isNaN(count) || !Number.isFinite(count) || count < 0) {
      errors.push(`Observed count must be a non-negative finite number (got ${record.observed_count})`);
    }
  } else if (record.rate_per_100k !== undefined && record.rate_per_100k !== null) {
    const rate = Number(record.rate_per_100k);
    if (isNaN(rate) || !Number.isFinite(rate) || rate < 0) {
      errors.push(`Rate per 100k must be a non-negative finite number (got ${record.rate_per_100k})`);
    }
  } else {
    errors.push('Health observation must provide either observed_count or rate_per_100k');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Assesses whether a dataset is suitable for direct ML training for mortality/hospitalization
 * @param {Object} metadata - Dataset metadata
 * @returns {{ status: string, isSuitable: boolean, rationale: string }}
 */
function evaluateHealthDatasetSuitability(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    return {
      status: 'NOT_SUITABLE_FOR_TARGET',
      isSuitable: false,
      rationale: 'Missing dataset metadata or undefined target structure',
    };
  }

  const target = metadata.target_definition;
  const granularity = metadata.geographic_granularity;
  const temporal = metadata.temporal_granularity;

  // Rule 1: General all-cause annual mortality is NOT directly suitable as a heatwave mortality target without baseline epidemiological excess modeling
  if (target === HEALTH_TARGET_DEFINITIONS.ALL_CAUSE_MORTALITY && temporal === 'ANNUAL') {
    return {
      status: 'NOT_SUITABLE_FOR_TARGET',
      isSuitable: false,
      rationale: 'Annual all-cause mortality cannot be used as a direct daily heatwave target without sub-daily excess risk modeling.',
    };
  }

  // Rule 2: Ambiguous syndromic surveillance cases require qualification
  if (target === HEALTH_TARGET_DEFINITIONS.SYNDROMIC_SURVEILLANCE_CASES) {
    return {
      status: 'NOT_SUITABLE_FOR_TARGET',
      isSuitable: false,
      rationale: 'General acute fever / dehydration syndromic reporting includes non-heat etiologies and cannot be claimed as heatstroke without clinical confirmation.',
    };
  }

  // Valid targets: Heat-attributable mortality or confirmed heat stroke records with daily/weekly granularity
  if (
    (target === HEALTH_TARGET_DEFINITIONS.HEAT_ATTRIBUTABLE_MORTALITY || target === HEALTH_TARGET_DEFINITIONS.HEAT_STROKE_DEATHS_CONFIRMED) &&
    (temporal === 'DAILY' || temporal === 'WEEKLY')
  ) {
    return {
      status: 'SUITABLE_FOR_CALIBRATION',
      isSuitable: true,
      rationale: 'Direct heat-attributable health outcome records with daily/weekly temporal resolution suitable for model risk calibration.',
    };
  }

  return {
    status: 'NOT_SUITABLE_FOR_TARGET',
    isSuitable: false,
    rationale: `Target definition "${target}" at "${temporal}" granularity does not meet epidemiological causality standards for direct regressor targets.`,
  };
}

module.exports = {
  validateHealthRecord,
  evaluateHealthDatasetSuitability,
};
