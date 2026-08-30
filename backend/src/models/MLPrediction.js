/**
 * ML Prediction Mongoose Model
 * Stores validated Machine Learning predictions and thermal risk evaluations with:
 * - Deterministic compound unique index on location_id + prediction_date + forecast_horizon
 * - Optimized secondary indexes on prediction_date and risk_level
 * - Zero storage of personal identification, API secrets, or credentials
 * - Strict UTC date normalization and data boundary validation
 */

const mongoose = require('mongoose');

const MLPredictionSchema = new mongoose.Schema(
  {
    location_id: {
      type: String,
      required: [true, 'location_id is required'],
      trim: true,
      lowercase: true,
      minlength: [2, 'location_id must be at least 2 characters'],
      maxlength: [64, 'location_id cannot exceed 64 characters'],
      match: [/^[a-z0-9_-]+$/, 'location_id must only contain alphanumeric characters, underscores, or hyphens'],
      index: true,
    },
    prediction_date: {
      type: Date,
      required: [true, 'prediction_date is required'],
      index: true,
    },
    forecast_horizon: {
      type: String,
      default: '0d',
      trim: true,
      maxlength: 16,
    },
    thermal_stress: {
      type: Number,
      required: [true, 'thermal_stress is required'],
      min: [0, 'thermal_stress must be >= 0'],
      max: [100, 'thermal_stress must be <= 100'],
    },
    mortality_risk: {
      type: Number,
      required: [true, 'mortality_risk is required'],
      min: [0, 'mortality_risk must be >= 0'],
      max: [100, 'mortality_risk must be <= 100'],
    },
    hospitalization_risk: {
      type: Number,
      required: [true, 'hospitalization_risk is required'],
      min: [0, 'hospitalization_risk must be >= 0'],
      max: [100, 'hospitalization_risk must be <= 100'],
    },
    risk_level: {
      type: String,
      required: [true, 'risk_level is required'],
      enum: {
        values: ['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'],
        message: '{VALUE} is not a valid risk_level',
      },
      index: true,
    },
    combined_risk_score: {
      type: Number,
      min: 0,
      max: 100,
    },
    recommended_actions: {
      type: [String],
      default: [],
    },
    model_version: {
      type: String,
      required: [true, 'model_version is required'],
      default: 'v1.0.0',
      trim: true,
      maxlength: 32,
    },
    feature_schema_version: {
      type: String,
      required: [true, 'feature_schema_version is required'],
      default: 'v1.0.0',
      trim: true,
      maxlength: 32,
    },
    created_at: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'ml_predictions',
  }
);

// Compound Unique Index: Prevents duplicate predictions for same location, target date, horizon and model version
MLPredictionSchema.index(
  { location_id: 1, prediction_date: 1, forecast_horizon: 1, model_version: 1 },
  { unique: true, name: 'uniq_loc_date_horizon_version' }
);

// Compound Index: location_id + prediction_date for fast chronological timeseries lookups
MLPredictionSchema.index(
  { location_id: 1, prediction_date: -1 },
  { name: 'idx_loc_pred_date' }
);

// Secondary Index: risk_level + prediction_date for emergency query aggregations
MLPredictionSchema.index(
  { risk_level: 1, prediction_date: -1 },
  { name: 'idx_risk_level_date' }
);

const MLPrediction = mongoose.models.MLPrediction || mongoose.model('MLPrediction', MLPredictionSchema);

module.exports = MLPrediction;
