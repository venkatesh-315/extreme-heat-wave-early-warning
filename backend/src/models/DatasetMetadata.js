const mongoose = require('mongoose');

const datasetMetadataSchema = new mongoose.Schema(
  {
    dataset_name: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    publisher: {
      type: String,
      required: true,
      trim: true,
    },
    license: {
      type: String,
      default: 'Government Open Data License - India (GODL)',
    },
    geographic_granularity: {
      type: String,
      enum: ['NATIONAL', 'STATE', 'DISTRICT', 'CITY', 'WARD'],
      default: 'STATE',
    },
    temporal_granularity: {
      type: String,
      default: 'DAILY',
    },
    target_definition: {
      type: String,
      required: true,
    },
    is_suitable_for_ml_target: {
      type: Boolean,
      default: false,
    },
    suitability_rationale: {
      type: String,
      default: '',
    },
    record_count: {
      type: Number,
      default: 0,
    },
    date_range: {
      start: String,
      end: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'dataset_metadata',
  }
);

datasetMetadataSchema.index({ dataset_name: 1, version: 1 }, { unique: true });

const DatasetMetadata = mongoose.model('DatasetMetadata', datasetMetadataSchema);

module.exports = DatasetMetadata;
