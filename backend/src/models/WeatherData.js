const mongoose = require('mongoose');

const WeatherDataSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    locationCode: {
      type: String,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    feelsLike: {
      type: Number,
    },
    dewPoint: {
      type: Number,
    },
    windSpeed: {
      type: Number,
      default: 10.0,
    },
    windDirection: {
      type: Number,
      default: 280,
    },
    solarRadiation: {
      type: Number,
      default: 850,
    },
    pressure: {
      type: Number,
      default: 1000,
    },
    visibility: {
      type: Number,
      default: 8.0,
    },
    uvIndex: {
      type: Number,
      default: 10.0,
    },
    cloudCover: {
      type: Number,
      default: 5,
    },
    weatherCondition: {
      type: String,
      default: 'Severe Heatwave',
    },
    weatherCode: {
      type: Number,
      default: 0,
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      default: 'Open-Meteo High-Resolution Feed',
    },
  },
  {
    timestamps: true,
  }
);

// Index for latest observation query by location
WeatherDataSchema.index({ locationId: 1, timestamp: -1 });

module.exports = mongoose.model('WeatherData', WeatherDataSchema);
