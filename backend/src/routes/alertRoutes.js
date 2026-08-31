const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { validateAlert } = require('../middleware/validationMiddleware');

router.get('/', alertController.getActiveAlerts);
router.get('/sms-templates', alertController.getSmsTemplates);
router.get('/location/:id', alertController.getAlertsByLocation);
router.post('/', verifyToken, requireRole('authority', 'admin'), validateAlert, alertController.createAlert);
router.post('/broadcast', verifyToken, requireRole('authority', 'admin'), alertController.broadcastAlert);

module.exports = router;
