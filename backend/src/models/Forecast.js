const mongoose = require('mongoose');

const ForecastDaySchema = new mongoose.Schema({
  day: { type: String, required: true },
  date: { type: String, required: true },
  rawDate: { type: String },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  windSpeed: { type: Number, default: 10 },
  solarRadiation: { type: Number, default: 850 },
  heatIndex: { type: Number, required: true },
  wbgt: { type: Number, required: true },
  utci: { type: Number, required: true },
  mortalityRisk: { type: Number, required: true },
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
});

const ForecastSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    days: [ForecastDaySchema],
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ForecastSchema.index({ locationId: 1, generatedAt: -1 });

module.exports = mongoose.model('Forecast', ForecastSchema);
