const {
  registerUserFcmToken,
  unregisterUserFcmToken,
  getUserFcmTokens,
  sendNotificationToUser,
} = require('../services/notificationService');
const { isFirebaseAdminReady } = require('../config/firebaseAdmin');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Register FCM Device Token for Authenticated User
 * POST /api/notifications/register-token
 */
const registerToken = async (req, res, next) => {
  try {
    const { token, deviceType } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return errorResponse(res, 'A valid FCM registration token string is required.', 400);
    }

    const userId = req.user._id || req.user.id;
    if (!userId) {
      return errorResponse(res, 'Authenticated user context missing.', 401);
    }

    const userAgent = req.headers['user-agent'] || '';
    const result = await registerUserFcmToken(userId, token, {
      deviceType: deviceType || 'web',
      userAgent,
    });

    return successResponse(
      res,
      {
        registered: true,
        tokenCount: result.tokenCount,
        firebaseAdminReady: isFirebaseAdminReady(),
      },
      'FCM notification token successfully registered',
      200
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Unregister FCM Device Token for Authenticated User
 * POST /api/notifications/unregister-token
 */
const unregisterToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, 'Token is required for unregistration', 400);
    }

    const userId = req.user._id || req.user.id;
    await unregisterUserFcmToken(userId, token);

    return successResponse(
      res,
      { unregistered: true },
      'FCM notification token successfully removed'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Send Test Notification to Authenticated User
 * POST /api/notifications/send-test
 */
const sendTestNotification = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const tokens = await getUserFcmTokens(userId);

    if (tokens.length === 0) {
      return errorResponse(
        res,
        'No registered notification devices found for this account. Please enable notifications in your browser first.',
        400
      );
    }

    const testPayload = {
      title: 'ThermoGuard Test Alert 🔔',
      body: `Firebase Cloud Messaging is working correctly for ${req.user.name || 'your device'}.`,
      data: {
        type: 'test_alert',
        severity: 'info',
        alertId: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userName: req.user.name || 'User',
      },
      url: '/alerts',
      priority: 'high',
      requireInteraction: true,
    };

    const result = await sendNotificationToUser(userId, testPayload);

    return successResponse(
      res,
      {
        deliveryResult: result,
        recipient: req.user.name,
        deviceCount: tokens.length,
        isSimulated: Boolean(result.simulated),
      },
      result.simulated
        ? 'Test alert simulated (Firebase Admin credentials pending in .env)'
        : 'Test notification sent successfully to your device'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get Notification System & Device Status for Current User
 * GET /api/notifications/status
 */
const getNotificationStatus = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const tokens = await getUserFcmTokens(userId);

    return successResponse(
      res,
      {
        isFirebaseAdminReady: isFirebaseAdminReady(),
        registeredDevicesCount: tokens.length,
        hasRegisteredTokens: tokens.length > 0,
      },
      'Notification status retrieved'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerToken,
  unregisterToken,
  sendTestNotification,
  getNotificationStatus,
};
