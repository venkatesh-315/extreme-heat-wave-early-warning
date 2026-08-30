const mongoose = require('mongoose');

const weatherObservationSchema = new mongoose.Schema(
  {
    location_id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9_-]+$/,
    },
    timestamp: {
      type: Date,
      required: true,
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
    surface_pressure_hpa: {
      type: Number,
      default: 1013.25,
    },
    precipitation_mm: {
      type: Number,
      default: 0.0,
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
    provider_timestamp: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'weather_observations',
  }
);

// Compound Unique Index: prevents duplicate observations per location and timestamp
weatherObservationSchema.index({ location_id: 1, timestamp: 1 }, { unique: true });
weatherObservationSchema.index({ timestamp: 1 });

const WeatherObservation = mongoose.model('WeatherObservation', weatherObservationSchema);

module.exports = WeatherObservation;
