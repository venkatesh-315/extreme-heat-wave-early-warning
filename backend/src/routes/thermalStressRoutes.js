const express = require('express');
const router = express.Router();
const thermalStressController = require('../controllers/thermalStressController');
const { validateCalculation } = require('../middleware/validationMiddleware');

router.get('/current', thermalStressController.getCurrentThermalStress);
router.post('/calculate', validateCalculation, thermalStressController.calculateMetrics);
router.post('/ml-predict', validateCalculation, thermalStressController.predictMLStress);

module.exports = router;
