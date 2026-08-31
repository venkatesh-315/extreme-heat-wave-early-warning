/**
 * Deterministic Indian Climatological Baseline Weather Provider
 * Zero network dependencies; ensures 100% platform continuity during total upstream outages.
 */

const { NormalizedWeatherData } = require('../schemas/weather_schema');

class ClimatologicalFallbackProvider {
  constructor() {
    this.name = 'Indian Climatological Baseline Model';
    this.providerId = 'CLIMATOLOGICAL_MODEL';
  }

  /**
   * Generates physical baseline observations tailored for Indian geography
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} horizonDays - Days requested (3 to 5)
   * @returns {{ current: NormalizedWeatherData, forecast: NormalizedWeatherData[] }}
   */
  generateFallbackWeather(lat, lon, horizonDays = 5) {
    const latNum = Number(lat) || 28.6139;
    const lonNum = Number(lon) || 77.2090;
    const days = Math.max(3, Math.min(5, parseInt(horizonDays, 10) || 5));

    // North/Central/Western India summer heat profile
    const isNorthWest = latNum > 20.0 && lonNum < 82.0;
    const isCoastal = (latNum < 15.0) || (lonNum > 85.0 && latNum < 22.0);

    let baseTemp = isNorthWest ? 43.5 : isCoastal ? 38.0 : 40.5;
    let baseHum = isCoastal ? 68.0 : isNorthWest ? 32.0 : 45.0;

    const current = new NormalizedWeatherData({
      timestamp: new Date().toISOString(),
      latitude: latNum,
      longitude: lonNum,
      temperature_c: baseTemp,
      relative_humidity_pct: baseHum,
      wind_speed_ms: 2.8,
      surface_pressure_hpa: 1008.0,
      precipitation_mm: 0.0,
      solar_radiation_wm2: 890.0,
      provider: this.providerId,
      provider_timestamp: new Date().toISOString(),
    });

    const forecast = [];
    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(Date.now() + i * 86400000);
      forecast.push(
        new NormalizedWeatherData({
          timestamp: forecastDate.toISOString(),
          latitude: latNum,
          longitude: lonNum,
          temperature_c: baseTemp + (i * 0.4) - (i === 3 ? 1.0 : 0.0),
          relative_humidity_pct: Math.max(20, Math.min(95, baseHum + (i * 1.5))),
          wind_speed_ms: 2.6 + (i * 0.2),
          surface_pressure_hpa: 1008.0,
          precipitation_mm: 0.0,
          solar_radiation_wm2: Math.max(600, 890.0 - (i * 20)),
          provider: this.providerId,
          provider_timestamp: forecastDate.toISOString(),
        })
      );
    }

    return { current, forecast };
  }
}

module.exports = {
  ClimatologicalFallbackProvider,
};
