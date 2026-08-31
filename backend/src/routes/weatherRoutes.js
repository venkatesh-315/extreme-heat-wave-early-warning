const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

router.get('/live', weatherController.getLiveWeather);
router.get('/hourly', weatherController.getHourlyWeather);
router.post('/sync', weatherController.syncWeather);

module.exports = router;
