/**
 * Standardized Normalized Weather Schema
 * Contract for all meteorological observation and forecast provider adapters.
 */

class NormalizedWeatherData {
  constructor({
    timestamp,
    latitude,
    longitude,
    temperature_c,
    relative_humidity_pct,
    wind_speed_ms,
    surface_pressure_hpa = 1013.25,
    precipitation_mm = 0.0,
    solar_radiation_wm2 = null,
    provider,
    provider_timestamp,
    raw_payload = null,
  }) {
    this.timestamp = timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp || Date.now()).toISOString();
    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
    this.temperature_c = Number(temperature_c);
    this.relative_humidity_pct = Number(relative_humidity_pct);
    this.wind_speed_ms = Number(wind_speed_ms);
    this.surface_pressure_hpa = Number(surface_pressure_hpa);
    this.precipitation_mm = Number(precipitation_mm || 0.0);
    this.solar_radiation_wm2 = solar_radiation_wm2 !== null && solar_radiation_wm2 !== undefined ? Number(solar_radiation_wm2) : null;
    this.provider = String(provider);
    this.provider_timestamp = provider_timestamp ? new Date(provider_timestamp).toISOString() : this.timestamp;
  }

  toJSON() {
    return {
      timestamp: this.timestamp,
      latitude: this.latitude,
      longitude: this.longitude,
      temperature_c: this.temperature_c,
      relative_humidity_pct: this.relative_humidity_pct,
      wind_speed_ms: this.wind_speed_ms,
      surface_pressure_hpa: this.surface_pressure_hpa,
      precipitation_mm: this.precipitation_mm,
      solar_radiation_wm2: this.solar_radiation_wm2,
      provider: this.provider,
      provider_timestamp: this.provider_timestamp,
    };
  }
}

module.exports = {
  NormalizedWeatherData,
};
