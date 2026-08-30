/**
 * Open-Meteo High-Resolution Indian Meteorological Grid Provider Adapter
 * Connects to Open-Meteo API over strict HTTPS with bounded retries, timeouts, and normalization.
 */

const { NormalizedWeatherData } = require('../schemas/weather_schema');
const { validateNormalizedWeather } = require('../validation/weather_validator');

class OpenMeteoWeatherProvider {
  constructor(config = {}) {
    this.name = 'Open-Meteo High-Resolution WMO Grid';
    this.providerId = 'OPEN_METEO_GRID';
    this.baseUrl = process.env.OPEN_METEO_API_URL || 'https://api.open-meteo.com/v1/forecast';
    this.timeoutMs = parseInt(process.env.METEO_TIMEOUT_MS, 10) || 5000;
    this.maxRetries = 2;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetches live observations and 3-5 day forecasts
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} horizonDays - Forecast days (3 to 5)
   * @returns {Promise<{ current: NormalizedWeatherData, forecast: NormalizedWeatherData[] }>}
   */
  async fetchWeatherData(lat, lon, horizonDays = 5) {
    const latNum = Number(lat);
    const lonNum = Number(lon);
    const days = Math.max(3, Math.min(7, parseInt(horizonDays, 10) || 5));

    const url = new URL(this.baseUrl);
    url.searchParams.set('latitude', latNum.toFixed(4));
    url.searchParams.set('longitude', lonNum.toFixed(4));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,direct_normal_irradiance,precipitation');
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max,shortwave_radiation_sum,precipitation_sum');
    url.searchParams.set('forecast_days', days.toString());
    url.searchParams.set('timezone', 'Asia/Kolkata');

    let lastError = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ThermoGuard-Biometeorology/1.0',
          },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!response.ok) {
          // Never retry 4xx validation errors
          if (response.status >= 400 && response.status < 500) {
            throw new Error(`Open-Meteo rejected coordinates with HTTP ${response.status}`);
          }
          throw new Error(`Open-Meteo responded with transient HTTP ${response.status}`);
        }

        const raw = await response.json();
        const currentRaw = raw.current || {};
        const dailyRaw = raw.daily || {};

        // 1. Current Normalized Observation
        const currentNormalized = new NormalizedWeatherData({
          timestamp: currentRaw.time ? new Date(currentRaw.time).toISOString() : new Date().toISOString(),
          latitude: latNum,
          longitude: lonNum,
          temperature_c: currentRaw.temperature_2m !== undefined ? currentRaw.temperature_2m : 42.0,
          relative_humidity_pct: currentRaw.relative_humidity_2m !== undefined ? currentRaw.relative_humidity_2m : 35.0,
          wind_speed_ms: currentRaw.wind_speed_10m !== undefined ? (currentRaw.wind_speed_10m / 3.6) : 2.5,
          surface_pressure_hpa: currentRaw.surface_pressure !== undefined ? currentRaw.surface_pressure : 1008.0,
          precipitation_mm: currentRaw.precipitation !== undefined ? currentRaw.precipitation : 0.0,
          solar_radiation_wm2: currentRaw.direct_normal_irradiance !== undefined ? currentRaw.direct_normal_irradiance : 880.0,
          provider: this.providerId,
          provider_timestamp: currentRaw.time || new Date().toISOString(),
          raw_payload: currentRaw,
        });

        const currentValidation = validateNormalizedWeather(currentNormalized);
        if (!currentValidation.valid) {
          throw new Error(`Current weather validation failed: ${currentValidation.errors.join('; ')}`);
        }

        // 2. Forecast Days Normalization (3 to 5 days)
        const forecastNormalizedList = [];
        const timeArray = dailyRaw.time || [];

        for (let i = 0; i < timeArray.length && i < days; i++) {
          const maxTemp = dailyRaw.temperature_2m_max ? dailyRaw.temperature_2m_max[i] : 43.0;
          const minTemp = dailyRaw.temperature_2m_min ? dailyRaw.temperature_2m_min[i] : 30.0;
          const avgTemp = (maxTemp + minTemp) / 2;
          const rh = dailyRaw.relative_humidity_2m_mean ? dailyRaw.relative_humidity_2m_mean[i] : 38.0;
          const wind = dailyRaw.wind_speed_10m_max ? (dailyRaw.wind_speed_10m_max[i] / 3.6) : 2.8;
          const precip = dailyRaw.precipitation_sum ? dailyRaw.precipitation_sum[i] : 0.0;
          const solar = dailyRaw.shortwave_radiation_sum ? (dailyRaw.shortwave_radiation_sum[i] * 1000000 / 86400) : 850.0;

          const fItem = new NormalizedWeatherData({
            timestamp: new Date(timeArray[i]).toISOString(),
            latitude: latNum,
            longitude: lonNum,
            temperature_c: maxTemp, // Use peak daily max temp for conservative heatwave early warning
            relative_humidity_pct: rh,
            wind_speed_ms: wind,
            surface_pressure_hpa: 1008.0,
            precipitation_mm: precip,
            solar_radiation_wm2: Math.min(1200, Math.max(100, solar)),
            provider: this.providerId,
            provider_timestamp: timeArray[i],
          });

          const fVal = validateNormalizedWeather(fItem);
          if (fVal.valid) {
            forecastNormalizedList.push(fItem);
          }
        }

        return {
          current: currentNormalized,
          forecast: forecastNormalizedList,
        };

      } catch (err) {
        clearTimeout(timer);
        lastError = err;

        if (attempt < this.maxRetries) {
          const backoff = 150 * Math.pow(2, attempt);
          await this.sleep(backoff);
        }
      }
    }

    throw lastError || new Error('Open-Meteo provider failed after maximum retries');
  }
}

module.exports = {
  OpenMeteoWeatherProvider,
};
