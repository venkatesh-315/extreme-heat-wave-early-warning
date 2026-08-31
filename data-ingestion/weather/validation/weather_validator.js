/**
 * Weather Observation & Forecast Ingestion Validator
 * Enforces strict physical reality bounds, rejects NaN/Infinity, and validates structure.
 */

function isFiniteNumber(val) {
  return typeof val === 'number' && !isNaN(val) && Number.isFinite(val);
}

/**
 * Validates a normalized weather observation record
 * @param {Object} data - Raw or Normalized weather data
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateNormalizedWeather(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Payload must be a non-null object'] };
  }

  // 1. Latitude validation
  if (!isFiniteNumber(data.latitude) || data.latitude < -90.0 || data.latitude > 90.0) {
    errors.push(`Invalid latitude: ${data.latitude} (must be between -90 and +90)`);
  }

  // 2. Longitude validation
  if (!isFiniteNumber(data.longitude) || data.longitude < -180.0 || data.longitude > 180.0) {
    errors.push(`Invalid longitude: ${data.longitude} (must be between -180 and +180)`);
  }

  // 3. Temperature validation (-30°C to +65°C planetary bounds)
  if (!isFiniteNumber(data.temperature_c) || data.temperature_c < -30.0 || data.temperature_c > 65.0) {
    errors.push(`Invalid temperature_c: ${data.temperature_c} (must be between -30°C and +65°C)`);
  }

  // 4. Relative humidity validation (0% to 100%)
  if (!isFiniteNumber(data.relative_humidity_pct) || data.relative_humidity_pct < 0.0 || data.relative_humidity_pct > 100.0) {
    errors.push(`Invalid relative_humidity_pct: ${data.relative_humidity_pct} (must be between 0% and 100%)`);
  }

  // 5. Wind speed validation (0 to 100 m/s)
  if (!isFiniteNumber(data.wind_speed_ms) || data.wind_speed_ms < 0.0 || data.wind_speed_ms > 100.0) {
    errors.push(`Invalid wind_speed_ms: ${data.wind_speed_ms} (must be >= 0 and <= 100 m/s)`);
  }

  // 6. Surface pressure validation (800 to 1100 hPa)
  if (data.surface_pressure_hpa !== undefined && data.surface_pressure_hpa !== null) {
    if (!isFiniteNumber(data.surface_pressure_hpa) || data.surface_pressure_hpa < 750.0 || data.surface_pressure_hpa > 1150.0) {
      errors.push(`Invalid surface_pressure_hpa: ${data.surface_pressure_hpa} (must be between 750 and 1150 hPa)`);
    }
  }

  // 7. Precipitation validation (>= 0 mm)
  if (data.precipitation_mm !== undefined && data.precipitation_mm !== null) {
    if (!isFiniteNumber(data.precipitation_mm) || data.precipitation_mm < 0.0 || data.precipitation_mm > 1000.0) {
      errors.push(`Invalid precipitation_mm: ${data.precipitation_mm} (must be non-negative)`);
    }
  }

  // 8. Solar radiation validation (0 to 1600 W/m²)
  if (data.solar_radiation_wm2 !== undefined && data.solar_radiation_wm2 !== null) {
    if (!isFiniteNumber(data.solar_radiation_wm2) || data.solar_radiation_wm2 < 0.0 || data.solar_radiation_wm2 > 1600.0) {
      errors.push(`Invalid solar_radiation_wm2: ${data.solar_radiation_wm2} (must be between 0 and 1600 W/m²)`);
    }
  }

  // 9. Provider validation
  if (!data.provider || typeof data.provider !== 'string') {
    errors.push('Missing or invalid provider identifier');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateNormalizedWeather,
  isFiniteNumber,
};
