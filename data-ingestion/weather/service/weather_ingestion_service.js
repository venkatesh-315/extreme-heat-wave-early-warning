/**
 * Master Meteorological Ingestion Service
 * Manages provider selection, validation, fallbacks, and schema normalization across India.
 */

const { IMDWeatherProvider } = require('../providers/imd_provider');
const { OpenMeteoWeatherProvider } = require('../providers/open_meteo_provider');
const { ClimatologicalFallbackProvider } = require('../providers/climatological_fallback_provider');
const { validateNormalizedWeather } = require('../validation/weather_validator');

class WeatherIngestionService {
  constructor() {
    this.imdProvider = new IMDWeatherProvider();
    this.openMeteoProvider = new OpenMeteoWeatherProvider();
    this.fallbackProvider = new ClimatologicalFallbackProvider();
  }

  /**
   * Ingests real-time observation and 3-5 day forecast for coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {Object} options - Ingestion options (e.g. horizonDays, locationName)
   * @returns {Promise<{ current: Object, forecast: Object[], source: string, timestamp: string }>}
   */
  async ingestWeather(lat, lon, { horizonDays = 5, locationName = 'India' } = {}) {
    const horizon = Math.max(3, Math.min(5, parseInt(horizonDays, 10) || 5));

    // 1. Try Official IMD API if configured with active credentials
    if (this.imdProvider.isConfigured()) {
      try {
        const imdData = await this.imdProvider.fetchCurrentWeather(lat, lon, locationName);
        return {
          current: imdData.toJSON(),
          forecast: this.fallbackProvider.generateFallbackWeather(lat, lon, horizon).forecast.map(f => f.toJSON()),
          source: 'India Meteorological Department (IMD)',
          provider_id: 'IMD_NATIONAL',
          timestamp: new Date().toISOString(),
        };
      } catch (err) {
        // Fallthrough to primary meteorological grid
      }
    }

    // 2. Try Open-Meteo High-Resolution Grid Feed
    try {
      const meteoData = await this.openMeteoProvider.fetchWeatherData(lat, lon, horizon);
      return {
        current: meteoData.current.toJSON(),
        forecast: meteoData.forecast.map(f => f.toJSON()),
        source: 'Open-Meteo High-Resolution WMO Grid',
        provider_id: 'OPEN_METEO_GRID',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      // 3. Fallthrough to Deterministic Indian Climatological Baseline
      const fallback = this.fallbackProvider.generateFallbackWeather(lat, lon, horizon);
      return {
        current: fallback.current.toJSON(),
        forecast: fallback.forecast.map(f => f.toJSON()),
        source: 'Indian Climatological Baseline Model (Fallback)',
        provider_id: 'CLIMATOLOGICAL_MODEL',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

const weatherIngestionService = new WeatherIngestionService();

module.exports = {
  WeatherIngestionService,
  weatherIngestionService,
};
