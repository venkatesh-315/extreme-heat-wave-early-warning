/**
 * Location Validation & Bounded Batch Iterator
 * Enforces geographic bounds within India and prevents unbounded processing fan-out.
 */

// Bounding box for Indian territory including islands
const INDIA_GEO_BOUNDS = {
  minLat: 6.0,
  maxLat: 38.0,
  minLon: 68.0,
  maxLon: 98.0,
};

/**
 * Validates location schema and geographical bounds
 * @param {Object} loc - Location record
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateLocation(loc) {
  const errors = [];

  if (!loc || typeof loc !== 'object') {
    return { valid: false, errors: ['Location must be a non-null object'] };
  }

  if (!loc.location_id || typeof loc.location_id !== 'string' || !/^[a-z0-9_-]+$/i.test(loc.location_id)) {
    errors.push(`Invalid location_id: "${loc.location_id}" (must be alphanumeric with dashes/underscores)`);
  }

  if (!loc.country || loc.country.toLowerCase() !== 'india') {
    errors.push(`Invalid country: "${loc.country}" (must be India)`);
  }

  if (!loc.state || typeof loc.state !== 'string') {
    errors.push('State name is required');
  }

  const lat = Number(loc.latitude);
  const lon = Number(loc.longitude);

  if (isNaN(lat) || !Number.isFinite(lat) || lat < INDIA_GEO_BOUNDS.minLat || lat > INDIA_GEO_BOUNDS.maxLat) {
    errors.push(`Latitude ${lat} is outside Indian subcontinental boundaries [${INDIA_GEO_BOUNDS.minLat}, ${INDIA_GEO_BOUNDS.maxLat}]`);
  }

  if (isNaN(lon) || !Number.isFinite(lon) || lon < INDIA_GEO_BOUNDS.minLon || lon > INDIA_GEO_BOUNDS.maxLon) {
    errors.push(`Longitude ${lon} is outside Indian subcontinental boundaries [${INDIA_GEO_BOUNDS.minLon}, ${INDIA_GEO_BOUNDS.maxLon}]`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Processes an array of locations in strictly bounded sequential chunks
 * @param {Array<Object>} locations - Array of locations
 * @param {Function} handler - Asynchronous processor function per location
 * @param {number} batchSize - Maximum concurrent chunk size (default 5)
 * @returns {Promise<Array<Object>>} Accumulated batch results
 */
async function processLocationBatch(locations = [], handler, batchSize = 5) {
  if (!Array.isArray(locations) || typeof handler !== 'function') {
    throw new Error('Invalid arguments to processLocationBatch');
  }

  const safeChunkSize = Math.max(1, Math.min(10, parseInt(batchSize, 10) || 5));
  const results = [];

  for (let i = 0; i < locations.length; i += safeChunkSize) {
    const chunk = locations.slice(i, i + safeChunkSize);
    const chunkPromises = chunk.map(async (loc) => {
      const validation = validateLocation(loc);
      if (!validation.valid) {
        return {
          location_id: loc?.location_id || 'unknown',
          error: `Location validation failed: ${validation.errors.join('; ')}`,
          success: false,
        };
      }
      try {
        return await handler(loc);
      } catch (err) {
        return {
          location_id: loc.location_id,
          error: err.message,
          success: false,
        };
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  return results;
}

module.exports = {
  INDIA_GEO_BOUNDS,
  validateLocation,
  processLocationBatch,
};
