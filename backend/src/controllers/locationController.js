const mongoose = require('mongoose');
const Location = require('../models/Location');
const Ward = require('../models/Ward');
const EmergencyResource = require('../models/EmergencyResource');
const {
  CURATED_LOCATIONS_DATA,
  generateWardsForLocation,
  generateEmergencyResourcesForLocation,
} = require('../utils/seedData');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Get All Indian Locations / Cities
 * GET /api/locations
 */
const getAllLocations = async (req, res, next) => {
  try {
    const { region, search, state } = req.query;
    let locations = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (region) query.region = region;
        if (state) query.state = new RegExp(state, 'i');
        if (search) {
          query.$or = [
            { name: new RegExp(search, 'i') },
            { district: new RegExp(search, 'i') },
            { state: new RegExp(search, 'i') },
          ];
        }
        locations = await Location.find(query).sort({ isHotspot: -1, name: 1 });
      } catch {
        // Fallback
      }
    }

    if (locations.length === 0) {
      let filtered = CURATED_LOCATIONS_DATA;
      if (region) filtered = filtered.filter((l) => l.region.toLowerCase() === region.toLowerCase());
      if (state) filtered = filtered.filter((l) => l.state.toLowerCase().includes(state.toLowerCase()));
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((l) => l.name.toLowerCase().includes(s) || l.district.toLowerCase().includes(s) || l.state.toLowerCase().includes(s));
      }
      locations = filtered;
    }

    return successResponse(res, locations, 'Locations retrieved successfully', 200, { total: locations.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Extreme Heat Hotspot Cities
 * GET /api/locations/hotspots
 */
const getHotspots = async (req, res, next) => {
  try {
    let hotspots = [];
    if (mongoose.connection.readyState === 1) {
      try {
        hotspots = await Location.find({ isHotspot: true }).sort({ name: 1 });
      } catch {
        // Fallback
      }
    }

    if (hotspots.length === 0) {
      hotspots = CURATED_LOCATIONS_DATA.filter((l) => l.isHotspot);
    }

    return successResponse(res, hotspots, 'Severe heatwave hotspots retrieved', 200, { count: hotspots.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Location by ID or Code
 * GET /api/locations/:id
 */
const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let location = null;

    if (mongoose.connection.readyState === 1) {
      try {
        location = await Location.findOne({
          $or: [
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            { locationCode: id },
            { name: new RegExp(`^${id}$`, 'i') },
          ],
        });
      } catch {
        // Fallback
      }
    }

    if (!location) {
      const match = CURATED_LOCATIONS_DATA.find(
        (l) => l.id.toLowerCase() === id.toLowerCase() || l.name.toLowerCase() === id.toLowerCase()
      );
      if (match) {
        location = {
          _id: match.id,
          locationCode: match.id,
          name: match.name,
          district: match.district,
          state: match.state,
          region: match.region,
          coordinates: { lat: match.lat, lon: match.lon },
          population: match.population,
          isHotspot: match.isHotspot,
        };
      }
    }

    if (!location) {
      return errorResponse(res, 'Location not found', 404);
    }

    return successResponse(res, location, 'Location details retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * Get Microclimate Ward Zones for a Location
 * GET /api/locations/:id/wards
 */
const getWardsForLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let location = null;

    if (mongoose.connection.readyState === 1) {
      try {
        location = await Location.findOne({
          $or: [
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            { locationCode: id },
            { name: new RegExp(`^${id}$`, 'i') },
          ],
        });
      } catch {
        // Ignore
      }
    }

    const locData = location
      ? { lat: location.coordinates.lat, lon: location.coordinates.lon, name: location.name }
      : CURATED_LOCATIONS_DATA.find((l) => l.id === id || l.name.toLowerCase() === id.toLowerCase()) || CURATED_LOCATIONS_DATA[0];

    const wards = generateWardsForLocation(locData);

    return successResponse(res, wards, `Microclimate wards retrieved for ${locData.name}`, 200, {
      wardCount: wards.length,
      uhiHotspotsCount: wards.filter((w) => w.temperature >= 44).length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Emergency Facilities (Hospitals, Shelters, Water Kiosks) for Location
 * GET /api/locations/:id/emergency
 */
const getEmergencyResourcesForLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let location = null;

    if (mongoose.connection.readyState === 1) {
      try {
        location = await Location.findOne({
          $or: [
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            { locationCode: id },
            { name: new RegExp(`^${id}$`, 'i') },
          ],
        });
      } catch {
        // Ignore
      }
    }

    const locData = location
      ? { lat: location.coordinates.lat, lon: location.coordinates.lon, name: location.name }
      : CURATED_LOCATIONS_DATA.find((l) => l.id === id || l.name.toLowerCase() === id.toLowerCase()) || CURATED_LOCATIONS_DATA[0];

    const resources = generateEmergencyResourcesForLocation(locData);

    return successResponse(res, resources, `Emergency resources retrieved for ${locData.name}`, 200, {
      count: resources.length,
      hospitals: resources.filter((r) => r.type === 'hospital').length,
      shelters: resources.filter((r) => r.type === 'shelter').length,
      waterKiosks: resources.filter((r) => r.type === 'water').length,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllLocations,
  getHotspots,
  getLocationById,
  getWardsForLocation,
  getEmergencyResourcesForLocation,
};
