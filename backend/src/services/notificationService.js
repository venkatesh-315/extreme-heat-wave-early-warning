const mongoose = require('mongoose');
const User = require('../models/User');
const { getMessaging, isFirebaseAdminReady } = require('../config/firebaseAdmin');
const logger = require('../utils/logger');

// In-memory fallback for token store when running without persistent DB
const inMemoryTokens = new Map();

/**
 * Register or update an FCM token for a user
 */
async function registerUserFcmToken(userId, token, metadata = {}) {
  if (!userId || !token) {
    throw new Error('User ID and FCM registration token are required');
  }

  const cleanToken = token.trim();
  const tokenRecord = {
    token: cleanToken,
    deviceType: metadata.deviceType || 'web',
    userAgent: metadata.userAgent || '',
    createdAt: new Date(),
    lastUsedAt: new Date(),
  };

  if (mongoose.connection.readyState === 1) {
    try {
      // Find user
      const user = await User.findById(userId);
      if (user) {
        if (!Array.isArray(user.fcmTokens)) {
          user.fcmTokens = [];
        }

        // Check if token already exists
        const existingIndex = user.fcmTokens.findIndex((t) => t.token === cleanToken);
        if (existingIndex !== -1) {
          user.fcmTokens[existingIndex].lastUsedAt = new Date();
          user.fcmTokens[existingIndex].deviceType = tokenRecord.deviceType;
          user.fcmTokens[existingIndex].userAgent = tokenRecord.userAgent;
        } else {
          // Add new token
          user.fcmTokens.push(tokenRecord);
        }

        await user.save({ validateBeforeSave: false });
        logger.info(`✅ FCM token registered in DB for user ${user.name || userId}`);
        return { success: true, tokenCount: user.fcmTokens.length };
      }
    } catch (err) {
      logger.error('Error saving FCM token to MongoDB:', err.message);
    }
  }

  // Fallback to in-memory store
  const userTokens = inMemoryTokens.get(String(userId)) || [];
  const existingIdx = userTokens.findIndex((t) => t.token === cleanToken);
  if (existingIdx !== -1) {
    userTokens[existingIdx].lastUsedAt = new Date();
  } else {
    userTokens.push(tokenRecord);
  }
  inMemoryTokens.set(String(userId), userTokens);

  logger.info(`✅ FCM token registered in-memory for user ${userId}`);
  return { success: true, tokenCount: userTokens.length };
}

/**
 * Unregister/remove an FCM token for a user
 */
async function unregisterUserFcmToken(userId, token) {
  if (!userId || !token) return { success: true };

  const cleanToken = token.trim();

  if (mongoose.connection.readyState === 1) {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { token: cleanToken } },
      });
      logger.info(`🗑️ FCM token unregistered from DB for user ${userId}`);
    } catch (err) {
      logger.error('Error removing FCM token from DB:', err.message);
    }
  }

  const userTokens = inMemoryTokens.get(String(userId));
  if (userTokens) {
    inMemoryTokens.set(
      String(userId),
      userTokens.filter((t) => t.token !== cleanToken)
    );
  }

  return { success: true };
}

/**
 * Get all active FCM tokens for a user
 */
async function getUserFcmTokens(userId) {
  let tokens = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findById(userId).select('fcmTokens');
      if (user && Array.isArray(user.fcmTokens)) {
        tokens = user.fcmTokens.map((t) => t.token);
      }
    } catch (err) {
      logger.error('Error querying FCM tokens from DB:', err.message);
    }
  }

  if (tokens.length === 0) {
    const memTokens = inMemoryTokens.get(String(userId)) || [];
    tokens = memTokens.map((t) => t.token);
  }

  return [...new Set(tokens.filter(Boolean))];
}

/**
 * Prune invalid/stale tokens from a user
 */
async function pruneInvalidTokens(userId, invalidTokens) {
  if (!invalidTokens || invalidTokens.length === 0) return;

  if (mongoose.connection.readyState === 1) {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { token: { $in: invalidTokens } } },
      });
      logger.info(`🧹 Cleaned up ${invalidTokens.length} expired FCM token(s) for user ${userId}`);
    } catch (err) {
      logger.error('Error pruning invalid tokens from DB:', err.message);
    }
  }

  const memTokens = inMemoryTokens.get(String(userId));
  if (memTokens) {
    inMemoryTokens.set(
      String(userId),
      memTokens.filter((t) => !invalidTokens.includes(t.token))
    );
  }
}

/**
 * Send notification to a specific user across all their registered devices
 */
async function sendNotificationToUser(userId, payload = {}) {
  try {
    const tokens = await getUserFcmTokens(userId);

    if (tokens.length === 0) {
      logger.warn(`No registered FCM tokens found for user ${userId}`);
      return {
        success: false,
        reason: 'NO_ACTIVE_TOKENS',
        message: 'No registered devices found for this user',
        sentCount: 0,
      };
    }

    const title = payload.title || 'ThermoGuard Alert 🔔';
    const body = payload.body || 'Temperature and thermal stress levels updated.';
    const data = {};

    // Flatten data to strings for FCM compatibility
    if (payload.data && typeof payload.data === 'object') {
      Object.keys(payload.data).forEach((key) => {
        data[key] = String(payload.data[key]);
      });
    }
    data.timestamp = data.timestamp || new Date().toISOString();
    data.type = data.type || 'heat_alert';

    const messaging = getMessaging();

    if (!isFirebaseAdminReady() || !messaging) {
      logger.info(
        `[DRY-RUN SIMULATION] Notification for User ${userId} [${tokens.length} device(s)]:\n` +
        `  Title: "${title}"\n` +
        `  Body: "${body}"\n` +
        `  Data: ${JSON.stringify(data)}`
      );
      return {
        success: true,
        simulated: true,
        sentCount: tokens.length,
        message: 'Notification simulated successfully (Firebase Admin credentials pending)',
      };
    }

    // Build Multicast Message
    const message = {
      tokens: tokens,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        headers: {
          Urgency: payload.priority === 'high' ? 'high' : 'normal',
        },
        notification: {
          title,
          body,
          icon: payload.icon || '/favicon.svg',
          badge: payload.badge || '/favicon.svg',
          requireInteraction: Boolean(payload.requireInteraction),
          tag: data.type || 'thermoguard-alert',
        },
        fcmOptions: {
          link: payload.url || '/alerts',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    logger.info(
      `📲 FCM Multicast result for user ${userId}: ${response.successCount} succeeded, ${response.failureCount} failed.`
    );

    // Collect invalid tokens for pruning
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error) {
        const code = resp.error.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/invalid-argument'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      await pruneInvalidTokens(userId, invalidTokens);
    }

    return {
      success: response.successCount > 0,
      sentCount: response.successCount,
      failedCount: response.failureCount,
      totalDevices: tokens.length,
    };
  } catch (err) {
    logger.error(`Error sending notification to user ${userId}:`, err.message);
    return {
      success: false,
      error: err.message,
      sentCount: 0,
    };
  }
}

/**
 * Broadcast notification to all active users or filtered by criteria
 */
async function sendNotificationToAllUsers(payload = {}, filter = {}) {
  try {
    let allTokens = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query = { 'fcmTokens.0': { $exists: true } };
        if (filter.role) query.role = filter.role;
        const users = await User.find(query).select('fcmTokens');
        users.forEach((u) => {
          if (Array.isArray(u.fcmTokens)) {
            u.fcmTokens.forEach((t) => {
              if (t.token) allTokens.push(t.token);
            });
          }
        });
      } catch (err) {
        logger.error('Error fetching broadcast users:', err.message);
      }
    }

    // Add memory tokens
    inMemoryTokens.forEach((tokens) => {
      tokens.forEach((t) => {
        if (t.token) allTokens.push(t.token);
      });
    });

    allTokens = [...new Set(allTokens.filter(Boolean))];

    if (allTokens.length === 0) {
      logger.info('Broadcast: No active registered FCM devices found across users');
      return { success: true, sentCount: 0, message: 'No registered devices found' };
    }

    const title = payload.title || 'ThermoGuard Public Heat Advisory 🚨';
    const body = payload.body || 'Critical heatwave alerts are active for monitored zones.';
    const data = {};
    if (payload.data && typeof payload.data === 'object') {
      Object.keys(payload.data).forEach((key) => {
        data[key] = String(payload.data[key]);
      });
    }

    const messaging = getMessaging();

    if (!isFirebaseAdminReady() || !messaging) {
      logger.info(
        `[DRY-RUN SIMULATION] Broadcast to ${allTokens.length} total device(s):\n` +
        `  Title: "${title}"\n` +
        `  Body: "${body}"`
      );
      return {
        success: true,
        simulated: true,
        sentCount: allTokens.length,
      };
    }

    // Firebase batch limit is 500 tokens per multicast
    const batchSize = 500;
    let totalSuccess = 0;
    let totalFailure = 0;

    for (let i = 0; i < allTokens.length; i += batchSize) {
      const tokenBatch = allTokens.slice(i, i + batchSize);
      const message = {
        tokens: tokenBatch,
        notification: { title, body },
        data,
        webpush: {
          notification: {
            title,
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: data.type || 'heat-broadcast',
          },
          fcmOptions: {
            link: payload.url || '/alerts',
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
    }

    logger.info(`📢 Broadcast complete: ${totalSuccess} sent, ${totalFailure} failed`);
    return {
      success: totalSuccess > 0 || totalFailure === 0,
      sentCount: totalSuccess,
      failedCount: totalFailure,
    };
  } catch (err) {
    logger.error('Error broadcasting notification:', err.message);
    return { success: false, error: err.message, sentCount: 0 };
  }
}

module.exports = {
  registerUserFcmToken,
  unregisterUserFcmToken,
  getUserFcmTokens,
  sendNotificationToUser,
  sendNotificationToAllUsers,
};
