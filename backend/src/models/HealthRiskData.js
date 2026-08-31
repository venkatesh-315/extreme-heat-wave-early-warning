const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' },
  category: { type: String, required: true },
  title: { type: String, required: true },
  action: { type: String, required: true },
  authority: { type: String, required: true },
});

const HealthRiskDataSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    mortalityRisk: {
      type: Number,
      required: true,
    },
    estimatedExcessExposure: {
      type: Number,
      default: 0,
    },
    vulnerablePopulationBreakdown: {
      elderlyCount: { type: Number, default: 45000 },
      childrenCount: { type: Number, default: 60000 },
      outdoorLabourersCount: { type: Number, default: 85000 },
      slumResidentsCount: { type: Number, default: 120000 },
    },
    recommendations: [RecommendationSchema],
    assessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HealthRiskData', HealthRiskDataSchema);
