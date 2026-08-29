const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/overview', dashboardController.getOverview);
router.get('/zone-risk', dashboardController.getZoneRiskMap);
router.get('/statistics', dashboardController.getStatistics);

module.exports = router;
