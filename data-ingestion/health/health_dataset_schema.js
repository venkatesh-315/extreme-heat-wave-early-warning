/**
 * Official Indian Health Dataset Provenance & Target Schema
 * Enforces metadata, geographic hierarchy, and explicit target semantics.
 */

const HEALTH_GEOGRAPHIC_GRANULARITY = {
  NATIONAL: 'NATIONAL',
  STATE: 'STATE',
  DISTRICT: 'DISTRICT',
  CITY: 'CITY',
  WARD: 'WARD',
};

const HEALTH_TARGET_DEFINITIONS = {
  ALL_CAUSE_MORTALITY: 'ALL_CAUSE_MORTALITY',
  HEAT_ATTRIBUTABLE_MORTALITY: 'HEAT_ATTRIBUTABLE_MORTALITY',
  HEAT_STROKE_DEATHS_CONFIRMED: 'HEAT_STROKE_DEATHS_CONFIRMED',
  ALL_CAUSE_HOSPITALIZATION: 'ALL_CAUSE_HOSPITALIZATION',
  HEAT_RELATED_HOSPITALIZATION: 'HEAT_RELATED_HOSPITALIZATION',
  HEAT_EXHAUSTION_CASES: 'HEAT_EXHAUSTION_CASES',
  SYNDROMIC_SURVEILLANCE_CASES: 'SYNDROMIC_SURVEILLANCE_CASES',
  OTHER_GENERAL_HEALTH: 'OTHER_GENERAL_HEALTH',
};

class HealthDatasetMetadata {
  constructor({
    source,
    publisher,
    dataset_name,
    license = 'Government Open Data License - India (GODL)',
    geographic_granularity = HEALTH_GEOGRAPHIC_GRANULARITY.STATE,
    temporal_granularity = 'DAILY',
    date_range = { start: null, end: null },
    location_definition,
    target_definition,
    collection_method,
    is_suitable_for_ml_target = false,
    suitability_rationale = '',
    schema_version = 'HEALTH_SCHEMA_v1.0',
    import_timestamp = new Date().toISOString(),
  }) {
    this.source = String(source || 'Government of India (data.gov.in)');
    this.publisher = String(publisher || 'Ministry of Health and Family Welfare');
    this.dataset_name = String(dataset_name);
    this.license = String(license);
    this.geographic_granularity = geographic_granularity;
    this.temporal_granularity = temporal_granularity;
    this.date_range = date_range;
    this.location_definition = String(location_definition || 'Official Administrative Boundaries');
    this.target_definition = target_definition;
    this.collection_method = String(collection_method || 'Official Registry / Surveillance');
    this.is_suitable_for_ml_target = Boolean(is_suitable_for_ml_target);
    this.suitability_rationale = String(suitability_rationale);
    this.schema_version = schema_version;
    this.import_timestamp = import_timestamp;
  }

  toJSON() {
    return {
      source: this.source,
      publisher: this.publisher,
      dataset_name: this.dataset_name,
      license: this.license,
      geographic_granularity: this.geographic_granularity,
      temporal_granularity: this.temporal_granularity,
      date_range: this.date_range,
      location_definition: this.location_definition,
      target_definition: this.target_definition,
      collection_method: this.collection_method,
      is_suitable_for_ml_target: this.is_suitable_for_ml_target,
      suitability_rationale: this.suitability_rationale,
      schema_version: this.schema_version,
      import_timestamp: this.import_timestamp,
    };
  }
}

module.exports = {
  HEALTH_GEOGRAPHIC_GRANULARITY,
  HEALTH_TARGET_DEFINITIONS,
  HealthDatasetMetadata,
};
