const mongoose = require('mongoose');

const ThermalStressSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    weatherDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeatherData',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    heatIndex: {
      type: Number,
      required: true,
    },
    wbgt: {
      type: Number,
      required: true,
      index: true,
    },
    utci: {
      type: Number,
      required: true,
    },
    mortalityRisk: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    stressCategory: {
      label: { type: String, required: true },
      level: { type: Number, required: true },
      color: { type: String, default: '#dc2626' },
      bg: { type: String, default: '#fef2f2' },
      border: { type: String, default: '#fecaca' },
      text: { type: String, default: 'Dangerous Thermal Stress' },
    },
    imdAlert: {
      level: { type: String, enum: ['RED', 'ORANGE', 'YELLOW', 'GREEN'], default: 'RED' },
      code: { type: String, default: 'RED_WARNING' },
      title: { type: String, default: 'RED ALERT — Take Action' },
      description: { type: String, default: 'Severe heatwave conditions' },
      color: { type: String, default: '#dc2626' },
      bgColor: { type: String, default: '#fef2f2' },
      borderColor: { type: String, default: '#fecaca' },
    },
  },
  {
    timestamps: true,
  }
);

ThermalStressSchema.index({ locationId: 1, timestamp: -1 });

module.exports = mongoose.model('ThermalStress', ThermalStressSchema);
