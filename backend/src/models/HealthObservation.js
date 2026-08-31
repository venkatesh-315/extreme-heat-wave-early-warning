const mongoose = require('mongoose');

const healthObservationSchema = new mongoose.Schema(
  {
    location_id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9_-]+$/,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      default: null,
    },
    date: {
      type: Date,
      required: true,
    },
    target_definition: {
      type: String,
      required: true,
      enum: [
        'ALL_CAUSE_MORTALITY',
        'HEAT_ATTRIBUTABLE_MORTALITY',
        'HEAT_STROKE_DEATHS_CONFIRMED',
        'ALL_CAUSE_HOSPITALIZATION',
        'HEAT_RELATED_HOSPITALIZATION',
        'HEAT_EXHAUSTION_CASES',
        'SYNDROMIC_SURVEILLANCE_CASES',
        'OTHER_GENERAL_HEALTH',
      ],
    },
    observed_count: {
      type: Number,
      default: null,
      min: 0,
    },
    rate_per_100k: {
      type: Number,
      default: null,
      min: 0,
    },
    dataset_source: {
      type: String,
      required: true,
      trim: true,
    },
    dataset_name: {
      type: String,
      required: true,
      trim: true,
    },
    is_official_government_data: {
      type: Boolean,
      default: true,
    },
    suitability_status: {
      type: String,
      default: 'NOT_SUITABLE_FOR_TARGET',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'health_observations',
  }
);

// Indexes
healthObservationSchema.index(
  { location_id: 1, date: 1, target_definition: 1, dataset_name: 1 },
  { unique: true }
);
healthObservationSchema.index({ date: 1 });
healthObservationSchema.index({ target_definition: 1 });

const HealthObservation = mongoose.model('HealthObservation', healthObservationSchema);

module.exports = HealthObservation;
