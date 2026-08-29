const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

router.get('/', forecastController.getForecast);
router.get('/location/:id', forecastController.getForecastByLocation);

module.exports = router;
