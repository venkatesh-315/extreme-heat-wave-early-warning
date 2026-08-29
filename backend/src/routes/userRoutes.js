const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Protected profile routes
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);

// Admin/Authority route
router.get('/', verifyToken, requireRole('authority', 'admin'), userController.getAllUsers);

module.exports = router;
