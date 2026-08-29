const mongoose = require('mongoose');

const EmergencyResourceSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['hospital', 'shelter', 'water'],
      required: true,
      index: true,
    },
    categoryLabel: {
      type: String,
      default: 'Emergency Facility',
    },
    coordinates: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    distanceKm: {
      type: Number,
      default: 1.0,
    },
    address: {
      type: String,
      default: 'Within municipal radius',
    },
    phone: {
      type: String,
      default: '108 / 1077',
    },
    status: {
      type: String,
      default: 'OPEN 24/7',
    },
    icuReady: {
      type: Boolean,
      default: false,
    },
    coolingAmenity: {
      type: String,
      default: 'Chilled RO Drinking Water & Shaded Area',
    },
    capacity: {
      type: String,
      default: '100 Persons',
    },
    mapsUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

EmergencyResourceSchema.index({ locationId: 1, type: 1 });

module.exports = mongoose.model('EmergencyResource', EmergencyResourceSchema);
