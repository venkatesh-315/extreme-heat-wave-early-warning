const Location = require('../models/Location');
const WeatherData = require('../models/WeatherData');
const ThermalStress = require('../models/ThermalStress');
const { fetchWeatherData } = require('../services/weatherSyncService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { CURATED_LOCATIONS_DATA } = require('../utils/seedData');

/**
 * Get Live Weather and Biometeorological Indices
 * GET /api/weather/live
 */
const getLiveWeather = async (req, res, next) => {
  try {
    let { lat, lon, locationId, code, city } = req.query;

    let targetLat = 28.6139; // Default New Delhi
    let targetLon = 77.2090;
    let locationName = 'New Delhi';
    let matchedLocation = null;

    if (locationId) {
      try {
        matchedLocation = await Location.findById(locationId);
      } catch {
        // Invalid objectId
      }
    }

    if (!matchedLocation && (code || city)) {
      const searchKey = (code || city).toLowerCase();
      try {
        matchedLocation = await Location.findOne({
          $or: [
            { locationCode: searchKey },
            { name: new RegExp(searchKey, 'i') },
            { district: new RegExp(searchKey, 'i') },
          ],
        });
      } catch {
        // DB not connected
      }

      if (!matchedLocation) {
        const seedMatch = CURATED_LOCATIONS_DATA.find(
          (l) => l.id.toLowerCase() === searchKey || l.name.toLowerCase().includes(searchKey)
        );
        if (seedMatch) {
          targetLat = seedMatch.lat;
          targetLon = seedMatch.lon;
          locationName = seedMatch.name;
        }
      }
    }

    if (matchedLocation) {
      targetLat = matchedLocation.coordinates.lat;
      targetLon = matchedLocation.coordinates.lon;
      locationName = matchedLocation.name;
    } else if (lat && lon) {
      targetLat = parseFloat(lat);
      targetLon = parseFloat(lon);
      locationName = `Coordinates (${targetLat.toFixed(2)}, ${targetLon.toFixed(2)})`;
    }

    const weatherResult = await fetchWeatherData(targetLat, targetLon, locationName);

    return successResponse(
      res,
      {
        location: {
          id: matchedLocation ? matchedLocation._id : (code || 'custom'),
          name: locationName,
          lat: targetLat,
          lon: targetLon,
        },
        source: weatherResult.source,
        isLive: weatherResult.isLive,
        lastUpdated: weatherResult.lastUpdated,
        weather: weatherResult.weather,
        thermalMetrics: weatherResult.thermalMetrics,
      },
      'Live weather and thermal metrics retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get 24-Hour Hourly Weather & Heat Stress Curve
 * GET /api/weather/hourly
 */
const getHourlyWeather = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139;
    const lon = parseFloat(req.query.lon) || 77.2090;

    const weatherResult = await fetchWeatherData(lat, lon);

    return successResponse(
      res,
      {
        hourly: weatherResult.hourlyData,
        peakHours: '11:00 AM – 04:30 PM (Lethal UV & Thermal Peak)',
      },
      '24-Hour hourly forecast retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Force Refresh Weather Sync
 * POST /api/weather/sync
 */
const syncWeather = async (req, res, next) => {
  try {
    const { locationId, lat, lon } = req.body;
    const targetLat = parseFloat(lat) || 28.6139;
    const targetLon = parseFloat(lon) || 77.2090;

    const weatherResult = await fetchWeatherData(targetLat, targetLon);

    return successResponse(
      res,
      {
        weather: weatherResult.weather,
        thermalMetrics: weatherResult.thermalMetrics,
        syncedAt: new Date().toISOString(),
      },
      'Weather successfully synced'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLiveWeather,
  getHourlyWeather,
  syncWeather,
};
