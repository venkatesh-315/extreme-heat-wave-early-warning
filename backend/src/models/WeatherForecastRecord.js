const mongoose = require('mongoose');

const weatherForecastRecordSchema = new mongoose.Schema(
  {
    location_id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9_-]+$/,
    },
    forecast_timestamp: {
      type: Date,
      required: true,
    },
    target_date: {
      type: Date,
      required: true,
    },
    horizon_day: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    temperature_c: {
      type: Number,
      required: true,
      min: -30,
      max: 65,
    },
    relative_humidity_pct: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    wind_speed_ms: {
      type: Number,
      required: true,
      min: 0,
    },
    solar_radiation_wm2: {
      type: Number,
      default: null,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'weather_forecasts',
  }
);

// Compound Unique Index: prevents duplicate forecast slots per run
weatherForecastRecordSchema.index(
  { location_id: 1, forecast_timestamp: 1, target_date: 1, provider: 1 },
  { unique: true }
);
weatherForecastRecordSchema.index({ target_date: 1 });

const WeatherForecastRecord = mongoose.model('WeatherForecastRecord', weatherForecastRecordSchema);

module.exports = WeatherForecastRecord;
