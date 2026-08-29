const Location = require('../models/Location');
const { fetchWeatherData } = require('../services/weatherSyncService');
const { successResponse } = require('../utils/responseFormatter');

/**
 * Get 3 to 7-Day Forecast
 * GET /api/forecasts
 */
const getForecast = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139;
    const lon = parseFloat(req.query.lon) || 77.2090;
    const days = Math.min(7, Math.max(3, parseInt(req.query.days, 10) || 7));

    const weatherResult = await fetchWeatherData(lat, lon);
    const slicedForecast = weatherResult.forecast.slice(0, days);

    return successResponse(
      res,
      {
        forecast: slicedForecast,
        daysCount: slicedForecast.length,
        forecastSource: weatherResult.source,
      },
      `${days}-Day heatwave & thermal stress forecast retrieved`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get Forecast by Location ID
 * GET /api/forecasts/location/:id
 */
const getForecastByLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let lat = 28.6139;
    let lon = 77.2090;

    try {
      const location = await Location.findById(id);
      if (location) {
        lat = location.coordinates.lat;
        lon = location.coordinates.lon;
      }
    } catch {
      // Ignore
    }

    const weatherResult = await fetchWeatherData(lat, lon);

    return successResponse(
      res,
      {
        locationId: id,
        forecast: weatherResult.forecast,
      },
      'Location forecast retrieved'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getForecast,
  getForecastByLocation,
};
