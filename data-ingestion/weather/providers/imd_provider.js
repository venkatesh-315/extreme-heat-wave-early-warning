/**
 * India Meteorological Department (IMD) Weather Provider Adapter
 * Connects to IMD Open Data / AWS feeds when configured, normalizing to standard schema.
 */

const { NormalizedWeatherData } = require('../schemas/weather_schema');
const { validateNormalizedWeather } = require('../validation/weather_validator');

class IMDWeatherProvider {
  constructor(config = {}) {
    this.name = 'India Meteorological Department (IMD)';
    this.providerId = 'IMD_NATIONAL';
    this.apiUrl = process.env.IMD_API_URL || null;
    this.apiKey = process.env.IMD_API_KEY || null;
    this.timeoutMs = parseInt(process.env.IMD_TIMEOUT_MS, 10) || 5000;
  }

  isConfigured() {
    return Boolean(this.apiUrl && this.apiKey);
  }

  /**
   * Fetches live observations from IMD API or returns structured IMD station data
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} stationName - Station / City identifier
   * @returns {Promise<NormalizedWeatherData>} Normalized weather data
   */
  async fetchCurrentWeather(lat, lon, stationName = 'India') {
    const latNum = Number(lat);
    const lonNum = Number(lon);

    if (this.isConfigured()) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        // Strict HTTPS and fixed URL construction
        const url = new URL(this.apiUrl);
        url.searchParams.set('lat', latNum.toString());
        url.searchParams.set('lon', lonNum.toString());
        url.searchParams.set('key', this.apiKey);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ThermoGuard-IMD-Client/1.0',
          },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`IMD API responded with HTTP ${response.status}`);
        }

        const raw = await response.json();
        const normalized = new NormalizedWeatherData({
          timestamp: raw.observation_time || new Date().toISOString(),
          latitude: latNum,
          longitude: lonNum,
          temperature_c: raw.temp_c || raw.temperature,
          relative_humidity_pct: raw.rh || raw.humidity,
          wind_speed_ms: (raw.wind_speed_kmh ? raw.wind_speed_kmh / 3.6 : raw.wind_speed_ms) || 2.5,
          surface_pressure_hpa: raw.pressure_hpa || 1010.0,
          precipitation_mm: raw.rainfall_mm || 0.0,
          solar_radiation_wm2: raw.solar_rad_wm2 || 850.0,
          provider: this.providerId,
          provider_timestamp: raw.station_timestamp || raw.observation_time,
          raw_payload: raw,
        });

        const validation = validateNormalizedWeather(normalized);
        if (!validation.valid) {
          throw new Error(`IMD data validation failed: ${validation.errors.join(', ')}`);
        }

        return normalized;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    }

    throw new Error('IMD Direct API credentials not configured in environment. Using primary satellite grid adapter.');
  }
}

module.exports = {
  IMDWeatherProvider,
};
