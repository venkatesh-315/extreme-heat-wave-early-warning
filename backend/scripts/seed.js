/**
 * Standalone Database Seeder Script for ThermoGuard
 * Usage: npm run seed
 */

const mongoose = require('mongoose');
const config = require('../src/config/env');
const logger = require('../src/utils/logger');
const User = require('../src/models/User');
const Location = require('../src/models/Location');
const Alert = require('../src/models/Alert');
const Ward = require('../src/models/Ward');
const EmergencyResource = require('../src/models/EmergencyResource');
const {
  DEFAULT_USERS_DATA,
  CURATED_LOCATIONS_DATA,
  generateWardsForLocation,
  generateEmergencyResourcesForLocation,
} = require('../src/utils/seedData');

const seedDatabase = async () => {
  try {
    logger.info(`Connecting to MongoDB at: ${config.mongodbUri}`);
    await mongoose.connect(config.mongodbUri);
    logger.info('Connected to MongoDB for seeding.');

    // 1. Clear existing collections
    logger.info('Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Location.deleteMany({}),
      Alert.deleteMany({}),
      Ward.deleteMany({}),
      EmergencyResource.deleteMany({}),
    ]);

    // 2. Seed Users
    logger.info('Seeding default users (Authority, Citizen, Admin)...');
    const createdUsers = [];
    for (const u of DEFAULT_USERS_DATA) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    logger.info(`Seeded ${createdUsers.length} users successfully.`);

    // 3. Seed Locations
    logger.info(`Seeding ${CURATED_LOCATIONS_DATA.length} Indian cities and hotspot districts...`);
    const createdLocations = [];
    for (const loc of CURATED_LOCATIONS_DATA) {
      const doc = await Location.create({
        locationCode: loc.id,
        name: loc.name,
        district: loc.district,
        state: loc.state,
        region: loc.region,
        coordinates: {
          lat: loc.lat,
          lon: loc.lon,
        },
        population: loc.population,
        isHotspot: loc.isHotspot,
      });
      createdLocations.push(doc);

      // Seed Wards for this location
      const wards = generateWardsForLocation(loc);
      for (const w of wards) {
        await Ward.create({
          locationId: doc._id,
          wardId: w.wardId,
          name: w.name,
          microclimateType: w.microclimateType,
          population: w.population,
          coordinates: w.coordinates,
          temperature: w.temperature,
          humidity: w.humidity,
          wbgt: w.wbgt,
          heatIndex: w.heatIndex,
          utci: w.utci,
          mortalityRisk: w.mortalityRisk,
          stressCategory: w.stressCategory,
          imdAlert: w.imdAlert,
          coolingCenters: w.coolingCenters,
          hospitals: w.hospitals,
          waterKiosks: w.waterKiosks,
        });
      }

      // Seed Emergency Resources for this location
      const resources = generateEmergencyResourcesForLocation(loc);
      for (const r of resources) {
        await EmergencyResource.create({
          locationId: doc._id,
          name: r.name,
          type: r.type,
          categoryLabel: r.categoryLabel,
          coordinates: r.coordinates,
          distanceKm: r.distanceKm,
          address: r.address,
          phone: r.phone,
          status: r.status,
          icuReady: r.icuReady,
          coolingAmenity: r.coolingAmenity,
          capacity: r.capacity,
          mapsUrl: r.mapsUrl,
        });
      }
    }
    logger.info(`Seeded ${createdLocations.length} locations with corresponding wards and emergency resources.`);

    // 4. Seed Active Heatwave Alerts
    logger.info('Seeding active NDMA / IMD Heatwave Alerts...');
    const alert1 = await Alert.create({
      title: 'RED ALERT — Severe Heatwave & Loo Winds in Northwest & Central India',
      level: 'RED',
      code: 'RED_WARNING',
      severity: 'Extreme',
      category: 'Extreme Heatwave',
      message: 'Ambient temperatures exceeding 45°C with severe thermal stress (WBGT > 33°C). Mandatory work pause from 11:00 AM to 4:30 PM.',
      publicHealthAdvisory: 'Avoid peak sunlight. Pre-position cold saline IVs in all PHCs and CHCs. Refill municipal water kiosks every 3 hours.',
      targetLocations: createdLocations.slice(0, 8).map((l) => l._id),
      targetLocationNames: ['New Delhi', 'Phalodi', 'Barmer', 'Bikaner', 'Jaipur', 'Ahmedabad', 'Nagpur', 'Lucknow'],
      isActive: true,
      issuedBy: 'IMD / NDMA Heat Disaster Control Room',
      expiresAt: new Date(Date.now() + 48 * 3600000),
    });

    const alert2 = await Alert.create({
      title: 'ORANGE ALERT — Compound Heat & High Humidity in Coastal Andhra & Eastern Belt',
      level: 'ORANGE',
      code: 'ORANGE_ALERT',
      severity: 'Severe',
      category: 'Compound Heat Stress',
      message: 'Apparent temperature feels like 48°C due to 75%+ relative humidity. High heat exhaustion risk.',
      publicHealthAdvisory: 'Open community cooling shelters (Rain Basera) with misting fans and electrolytes.',
      targetLocations: createdLocations.slice(8, 14).map((l) => l._id),
      targetLocationNames: ['Visakhapatnam', 'Vijayawada', 'Kolkata', 'Bhubaneswar', 'Patna'],
      isActive: true,
      issuedBy: 'State Disaster Management Authority (SDMA)',
      expiresAt: new Date(Date.now() + 24 * 3600000),
    });

    logger.info('Seeded active alerts.');
    logger.info('========================================================');
    logger.info('🎉 Database successfully seeded with full ThermoGuard dataset!');
    logger.info('Default credentials:');
    logger.info('  - Authority: officer4102@gov.in / officerPassword123');
    logger.info('  - Citizen:   user8204@thermoguard.in / citizenPassword123');
    logger.info('  - Admin:     admin@thermoguard.gov.in / adminPassword123');
    logger.info('========================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    logger.error('Database seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
