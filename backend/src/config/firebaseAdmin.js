const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const config = require('./env');
const logger = require('../utils/logger');

let firebaseApp = null;
let isInitialized = false;

try {
  // Check if Firebase Admin is already initialized
  if (admin.apps && admin.apps.length > 0) {
    firebaseApp = admin.app();
    isInitialized = true;
  } else {
    const { projectId, clientEmail, privateKey, serviceAccountPath } = config.firebase;

    // Strategy 1: Explicit Service Account JSON file path
    if (serviceAccountPath) {
      const resolvedPath = path.isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : path.resolve(__dirname, '../../', serviceAccountPath);

      if (fs.existsSync(resolvedPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || projectId,
        });
        isInitialized = true;
        logger.info(`🔥 Firebase Admin initialized via service account file: ${resolvedPath}`);
      } else {
        logger.warn(`Firebase service account file not found at: ${resolvedPath}`);
      }
    }

    // Strategy 2: Client Email and Private Key in Environment Variables
    if (!isInitialized && clientEmail && privateKey) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId || 'thermo-guard',
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
      isInitialized = true;
      logger.info('🔥 Firebase Admin initialized successfully via environment variables');
    }

    // Strategy 3: Default Google Application Credentials
    if (!isInitialized && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: projectId || 'thermo-guard',
        });
        isInitialized = true;
        logger.info('🔥 Firebase Admin initialized via applicationDefault credentials');
      } catch (appDefErr) {
        logger.warn(`Could not load default credentials: ${appDefErr.message}`);
      }
    }

    // Fallback: Resilient development mode
    if (!isInitialized) {
      logger.warn(
        '⚠️ Firebase Admin SDK initialized in DRY-RUN / SIMULATION mode. ' +
        'Push notifications will be simulated until valid FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are provided.'
      );
    }
  }
} catch (err) {
  logger.error('Failed to initialize Firebase Admin SDK:', err.message);
}

/**
 * Returns messaging instance or null if not ready
 */
const getMessaging = () => {
  if (isInitialized && firebaseApp) {
    return admin.messaging(firebaseApp);
  }
  return null;
};

const isFirebaseAdminReady = () => isInitialized;

module.exports = {
  admin,
  getMessaging,
  isFirebaseAdminReady,
};
