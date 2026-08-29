const mongoose = require('mongoose');

const WardSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    wardId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    microclimateType: {
      type: String,
      default: 'Urban Heat Island',
    },
    population: {
      type: String,
      default: '100,000',
    },
    coordinates: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    wbgt: {
      type: Number,
      required: true,
    },
    heatIndex: {
      type: Number,
      required: true,
    },
    utci: {
      type: Number,
      required: true,
    },
    mortalityRisk: {
      type: Number,
      required: true,
    },
    stressCategory: {
      label: String,
      level: Number,
      color: String,
      bg: String,
      border: String,
      text: String,
    },
    imdAlert: {
      level: String,
      code: String,
      title: String,
      description: String,
      color: String,
      bgColor: String,
      borderColor: String,
    },
    coolingCenters: {
      type: Number,
      default: 1,
    },
    hospitals: {
      type: Number,
      default: 1,
    },
    waterKiosks: {
      type: Number,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

WardSchema.index({ locationId: 1, wardId: 1 });

module.exports = mongoose.model('Ward', WardSchema);
