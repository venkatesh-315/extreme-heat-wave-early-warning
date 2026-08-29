const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    level: {
      type: String,
      enum: ['RED', 'ORANGE', 'YELLOW', 'GREEN'],
      default: 'RED',
      required: true,
      index: true,
    },
    code: {
      type: String,
      default: 'RED_WARNING',
    },
    severity: {
      type: String,
      enum: ['Extreme', 'Severe', 'Moderate', 'Normal'],
      default: 'Extreme',
    },
    category: {
      type: String,
      default: 'Extreme Heatwave',
    },
    message: {
      type: String,
      required: true,
    },
    publicHealthAdvisory: {
      type: String,
      default: 'Stay indoors during 11:00 AM - 4:30 PM. Increase hydration and ORS intake.',
    },
    targetLocations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
      },
    ],
    targetLocationNames: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    issuedBy: {
      type: String,
      default: 'IMD / NDMA Heat Disaster Control Room',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AlertSchema.index({ isActive: 1, level: 1, issuedAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
