/**
 * ML Prediction Persistence Service
 * Manages atomic insertion, deduplication, and indexed retrieval of ML prediction records in MongoDB
 * - Enforces UTC timestamps and strict location_id validation
 * - Idempotent upsert & unique index collision protection
 * - In-memory resilience fallback when MongoDB is disconnected during unit tests/offline mode
 * - Sanitized querying without exposing credentials or internal connection strings
 */

const mongoose = require('mongoose');
const MLPrediction = require('../models/MLPrediction');
const logger = require('../utils/logger');

// In-memory resilient cache when MongoDB daemon is not running (e.g. standalone test mode)
const inMemoryPredictionStore = new Map();

/**
 * Validates and sanitizes location_id format
 * @param {string} locationId - Raw location identifier
 * @returns {string} Sanitized lowercase identifier
 */
function sanitizeLocationId(locationId) {
  if (!locationId || typeof locationId !== 'string') {
    throw new Error('Invalid location_id: Must be a non-empty string');
  }
  const cleanId = locationId.trim().toLowerCase();
  if (!/^[a-z0-9_-]+$/.test(cleanId)) {
    throw new Error('Invalid location_id: Must only contain alphanumeric characters, underscores, or hyphens');
  }
  return cleanId;
}

/**
 * Normalizes input date to UTC Date object
 * @param {string|Date|null} dateInput - ISO string or Date
 * @returns {Date} Normalized UTC Date
 */
function normalizeUTCDate(dateInput) {
  if (!dateInput) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), parsed.getUTCHours(), parsed.getUTCMinutes()));
}

/**
 * Atomically saves or updates an ML Prediction record preventing duplicates
 * @param {Object} data - Prediction payload
 * @returns {Promise<Object|null>} Saved record
 */
async function savePredictionRecord(data = {}) {
  const locId = sanitizeLocationId(data.location_id || 'delhi');
  const predDate = normalizeUTCDate(data.prediction_date || data.date || data.prediction_timestamp);
  const horizon = data.forecast_horizon || '0d';
  const modelVer = data.model_version || 'v1.0.0';
  const schemaVer = data.feature_schema_version || 'v1.0.0';

  const thermalStress = Math.max(0, Math.min(100, Number(data.thermal_stress || 0)));
  const mortalityRisk = Math.max(0, Math.min(100, Number(data.mortality_risk || data.mortality_risk_score || 0)));
  const hospitalizationRisk = Math.max(0, Math.min(100, Number(data.hospitalization_risk || 0)));
  const riskLevel = data.risk_level || 'MODERATE';
  const combinedScore = data.combined_risk_score !== undefined ? Number(data.combined_risk_score) : undefined;
  const actions = Array.isArray(data.recommended_actions) ? data.recommended_actions : [];

  const recordPayload = {
    location_id: locId,
    prediction_date: predDate,
    forecast_horizon: horizon,
    thermal_stress: thermalStress,
    mortality_risk: mortalityRisk,
    hospitalization_risk: hospitalizationRisk,
    risk_level: riskLevel,
    combined_risk_score: combinedScore,
    recommended_actions: actions,
    model_version: modelVer,
    feature_schema_version: schemaVer,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // 1. If MongoDB is connected, execute atomic MongoDB upsert
  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {
        location_id: locId,
        prediction_date: predDate,
        forecast_horizon: horizon,
        model_version: modelVer,
      };

      const updateDoc = {
        $set: {
          thermal_stress: thermalStress,
          mortality_risk: mortalityRisk,
          hospitalization_risk: hospitalizationRisk,
          risk_level: riskLevel,
          feature_schema_version: schemaVer,
          combined_risk_score: combinedScore,
          recommended_actions: actions,
          updated_at: new Date(),
        },
        $setOnInsert: {
          location_id: locId,
          prediction_date: predDate,
          forecast_horizon: horizon,
          model_version: modelVer,
          created_at: new Date(),
        },
      };

      const doc = await MLPrediction.findOneAndUpdate(filter, updateDoc, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }).lean();

      logger.info(`Persisted ML prediction in MongoDB for location='${locId}', date='${predDate.toISOString()}'`);
      return doc;
    } catch (err) {
      if (err.code === 11000) {
        return await MLPrediction.findOne({
          location_id: locId,
          prediction_date: predDate,
        }).lean();
      }
      logger.warn(`MongoDB write failed: ${err.message}. Saving to resilient in-memory store.`);
    }
  }

  // 2. Resilient fallback in-memory store (bounded capacity with LRU eviction)
  const MAX_IN_MEMORY_PREDICTIONS = 1000;
  const key = `${locId}:${predDate.toISOString().split('T')[0]}:${horizon}:${modelVer}`;

  if (inMemoryPredictionStore.size >= MAX_IN_MEMORY_PREDICTIONS && !inMemoryPredictionStore.has(key)) {
    const firstKey = inMemoryPredictionStore.keys().next().value;
    if (firstKey) inMemoryPredictionStore.delete(firstKey);
  }

  inMemoryPredictionStore.set(key, recordPayload);
  logger.info(`Recorded ML prediction in resilient persistence store for location='${locId}', key='${key}'`);
  return recordPayload;
}

/**
 * Retrieves prediction records based on filters
 * @param {Object} options - Query filters
 * @returns {Promise<Object>} Formatted pagination result
 */
async function queryPredictions({
  location_id,
  prediction_date,
  startDate,
  endDate,
  risk_level,
  limit = 50,
  page = 1,
} = {}) {
  const cleanLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const cleanPage = Math.max(1, parseInt(page, 10) || 1);
  const skip = (cleanPage - 1) * cleanLimit;

  // 1. If MongoDB is connected, query database
  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};

      if (location_id) {
        filter.location_id = sanitizeLocationId(location_id);
      }
      if (risk_level) {
        filter.risk_level = risk_level.toUpperCase();
      }
      if (prediction_date) {
        const targetDate = normalizeUTCDate(prediction_date);
        const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));
        filter.prediction_date = { $gte: startOfDay, $lte: endOfDay };
      } else if (startDate || endDate) {
        filter.prediction_date = {};
        if (startDate) filter.prediction_date.$gte = normalizeUTCDate(startDate);
        if (endDate) filter.prediction_date.$lte = normalizeUTCDate(endDate);
      }

      const [records, total] = await Promise.all([
        MLPrediction.find(filter)
          .sort({ prediction_date: -1, created_at: -1 })
          .skip(skip)
          .limit(cleanLimit)
          .lean(),
        MLPrediction.countDocuments(filter),
      ]);

      return {
        total,
        page: cleanPage,
        limit: cleanLimit,
        totalPages: Math.ceil(total / cleanLimit),
        records,
      };
    } catch (err) {
      logger.warn(`MongoDB query failed: ${err.message}`);
    }
  }

  // 2. Resilient memory querying
  let list = Array.from(inMemoryPredictionStore.values());
  if (location_id) {
    const cleanLoc = sanitizeLocationId(location_id);
    list = list.filter(r => r.location_id === cleanLoc);
  }
  if (risk_level) {
    const rk = risk_level.toUpperCase();
    list = list.filter(r => r.risk_level === rk);
  }

  list.sort((a, b) => new Date(b.prediction_date) - new Date(a.prediction_date));
  const paginated = list.slice(skip, skip + cleanLimit);

  return {
    total: list.length,
    page: cleanPage,
    limit: cleanLimit,
    totalPages: Math.ceil(list.length / cleanLimit),
    records: paginated,
  };
}

/**
 * Retrieves the latest ML prediction record for a specific location
 * @param {string} locationId - Target location identifier
 * @returns {Promise<Object|null>} Latest prediction record
 */
async function getLatestPredictionByLocation(locationId) {
  const cleanLoc = sanitizeLocationId(locationId);

  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await MLPrediction.findOne({ location_id: cleanLoc })
        .sort({ prediction_date: -1, created_at: -1 })
        .lean();
      if (doc) return doc;
    } catch (err) {
      logger.warn(`MongoDB fetch latest failed: ${err.message}`);
    }
  }

  const list = Array.from(inMemoryPredictionStore.values())
    .filter(r => r.location_id === cleanLoc)
    .sort((a, b) => new Date(b.prediction_date) - new Date(a.prediction_date));

  return list[0] || null;
}

module.exports = {
  savePredictionRecord,
  queryPredictions,
  getLatestPredictionByLocation,
  sanitizeLocationId,
  normalizeUTCDate,
};
