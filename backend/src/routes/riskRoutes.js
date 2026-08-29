const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

router.get('/mortality', riskController.getMortalityRisk);
router.get('/historical', riskController.getHistoricalMortality);
router.get('/recommendations', riskController.getRecommendations);

module.exports = router;
