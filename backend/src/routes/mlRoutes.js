/**
 * Dedicated Machine Learning Routes
 * Mounts:
 * - POST /api/ml/predict (Single point inference with MongoDB persistence)
 * - GET  /api/ml/predict (Query param inference)
 * - POST /api/ml/forecast (3-5 day ML forecasting workflow)
 * - GET  /api/ml/forecast (Query param 3-5 day forecasting)
 * - GET  /api/ml/predictions (Historical prediction queries)
 * - GET  /api/ml/history (Alias for predictions)
 * - GET  /api/ml/latest/:location_id (Latest prediction by location)
 */

const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

// POST /api/ml/predict & GET /api/ml/predict
router.post('/predict', mlController.predictML);
router.get('/predict', mlController.predictMLGet);

// POST /api/ml/forecast & GET /api/ml/forecast (3-5 Day Forecasting Workflow)
router.post('/forecast', mlController.generateForecast);
router.get('/forecast', mlController.generateForecastGet);

// GET /api/ml/predictions & GET /api/ml/history
router.get('/predictions', mlController.getMLPredictions);
router.get('/history', mlController.getMLPredictions);

// GET /api/ml/latest/:location_id
router.get('/latest/:location_id', mlController.getLatestPrediction);

module.exports = router;
