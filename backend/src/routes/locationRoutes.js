const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/', locationController.getAllLocations);
router.get('/hotspots', locationController.getHotspots);
router.get('/:id', locationController.getLocationById);
router.get('/:id/wards', locationController.getWardsForLocation);
router.get('/:id/emergency', locationController.getEmergencyResourcesForLocation);

module.exports = router;
