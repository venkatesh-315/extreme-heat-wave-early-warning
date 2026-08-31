const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// All notification registration & test endpoints strictly require verified authentication
router.post('/register-token', verifyToken, notificationController.registerToken);
router.post('/unregister-token', verifyToken, notificationController.unregisterToken);
router.post('/send-test', verifyToken, notificationController.sendTestNotification);
router.get('/status', verifyToken, notificationController.getNotificationStatus);

module.exports = router;
