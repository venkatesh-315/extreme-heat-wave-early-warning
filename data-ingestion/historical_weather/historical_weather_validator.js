/**
 * Historical Meteorological Dataset Validator
 * Verifies chronological integrity, detects gaps/missing dates, and validates physical units.
 */

const { isFiniteNumber } = require('../weather/validation/weather_validator');

/**
 * Validates a historical meteorological record
 * @param {Object} record - Historical observation or forecast record
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateHistoricalWeatherRecord(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Record must be a non-null object'] };
  }

  // Date validation
  if (!record.date && !record.timestamp) {
    errors.push('Missing date or timestamp in historical record');
  } else {
    const d = new Date(record.date || record.timestamp);
    if (isNaN(d.getTime())) {
      errors.push(`Invalid date format: ${record.date || record.timestamp}`);
    }
  }

  // Location validation
  if (!record.location_id || typeof record.location_id !== 'string') {
    errors.push('Missing or invalid location_id');
  }

  // Temperature validation
  if (!isFiniteNumber(record.temperature) && !isFiniteNumber(record.temperature_c)) {
    errors.push('Missing or non-numeric temperature value');
  } else {
    const t = Number(record.temperature !== undefined ? record.temperature : record.temperature_c);
    if (t < -30.0 || t > 65.0) {
      errors.push(`Temperature ${t}°C is outside realistic planetary bounds`);
    }
  }

  // Humidity validation
  if (record.humidity !== undefined || record.relative_humidity_pct !== undefined) {
    const rh = Number(record.humidity !== undefined ? record.humidity : record.relative_humidity_pct);
    if (!isFiniteNumber(rh) || rh < 0.0 || rh > 100.0) {
      errors.push(`Relative humidity ${rh}% is outside valid range [0, 100]`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks a series of records for chronological consistency and missing dates
 * @param {Array<Object>} records - Sorted records for a single location
 * @returns {{ hasGaps: boolean, missingDates: string[], duplicates: number }}
 */
function auditHistoricalTimeSeries(records = []) {
  if (records.length === 0) {
    return { hasGaps: false, missingDates: [], duplicates: 0 };
  }

  const seenDates = new Set();
  let duplicates = 0;
  const uniqueDates = [];

  for (const r of records) {
    const dStr = (r.date || r.timestamp || '').split('T')[0];
    if (seenDates.has(dStr)) {
      duplicates++;
    } else {
      seenDates.add(dStr);
      uniqueDates.push(dStr);
    }
  }

  uniqueDates.sort();
  const missingDates = [];

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const next = new Date(uniqueDates[i + 1]);
    const diffDays = Math.round((next - current) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      for (let g = 1; g < diffDays; g++) {
        const gapDate = new Date(current.getTime() + g * 86400000);
        missingDates.push(gapDate.toISOString().split('T')[0]);
      }
    }
  }

  return {
    hasGaps: missingDates.length > 0,
    missingDates,
    duplicates,
    totalRecords: records.length,
    uniqueDaysCount: uniqueDates.length,
  };
}

module.exports = {
  validateHistoricalWeatherRecord,
  auditHistoricalTimeSeries,
};
