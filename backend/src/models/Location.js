const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema(
  {
    locationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    region: {
      type: String,
      enum: ['North', 'Central', 'South', 'East', 'West', 'North-East'],
      default: 'Central',
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lon: {
        type: Number,
        required: true,
      },
    },
    population: {
      type: Number,
      default: 500000,
    },
    isHotspot: {
      type: Boolean,
      default: false,
      index: true,
    },
    heatActionThresholds: {
      plainsMaxTemp: { type: Number, default: 40.0 },
      coastalMaxTemp: { type: Number, default: 37.0 },
      hillsMaxTemp: { type: Number, default: 30.0 },
      wbgtDanger: { type: Number, default: 32.0 },
      wbgtLethal: { type: Number, default: 35.0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for geospatial and query performance
LocationSchema.index({ 'coordinates.lat': 1, 'coordinates.lon': 1 });

module.exports = mongoose.model('Location', LocationSchema);
