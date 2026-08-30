/**
 * Dedicated Machine Learning Routes
 * Mounts GET and POST /api/ml/predict
 */

const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

// POST /api/ml/predict
router.post('/predict', mlController.predictML);

// GET /api/ml/predict
router.get('/predict', mlController.predictMLGet);

module.exports = router;
