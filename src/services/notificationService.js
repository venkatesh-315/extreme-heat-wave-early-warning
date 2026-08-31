// ThermoGuard — Client-Side Firebase Cloud Messaging (FCM) Service
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../firebase';
import { apiClient } from './apiClient';
import { getCurrentUser } from './authService';

const FCM_TOKEN_STORAGE_KEY = 'thermoguard_fcm_token';

/**
 * Check if the current browser environment supports Push Notifications & Service Workers
 */
export function isPushNotificationSupported() {
  if (typeof window === 'undefined') return false;
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Get current browser notification permission state
 * @returns {'granted' | 'denied' | 'default' | 'unsupported'}
 */
export function getNotificationPermissionState() {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Get local cached FCM token
 */
export function getCachedFcmToken() {
  try {
    return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Save FCM token to local cache
 */
export function setCachedFcmToken(token) {
  try {
    if (token) {
      localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error saving cached FCM token:', err);
  }
}

/**
 * Register the Firebase Messaging Service Worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers are not supported in this browser.');
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    // Wait until the service worker is active
    await navigator.serviceWorker.ready;
    console.log('[ThermoGuard FCM] Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (err) {
    console.error('[ThermoGuard FCM] Service Worker registration failed:', err);
    throw err;
  }
}

/**
 * Request notification permission from user, retrieve FCM token, and register it with the backend
 */
export async function requestAndRegisterNotification(userParam = null) {
  const user = userParam || getCurrentUser();
  if (!user) {
    throw new Error('User must be logged in to enable notifications.');
  }

  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported by your browser.');
  }

  // 1. Request Browser Permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    if (permission === 'denied') {
      throw new Error(
        'Notification permission was denied. Please allow notifications in your browser site settings to receive heat alerts.'
      );
    }
    throw new Error('Notification permission was dismissed or not granted.');
  }

  // 2. Register Service Worker
  const swRegistration = await registerServiceWorker();

  // 3. Obtain Firebase Messaging Instance
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    throw new Error('Firebase Messaging could not be initialized.');
  }

  // 4. Retrieve FCM Token with VAPID Public Key
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined;
  
  let token = null;
  try {
    token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: swRegistration,
    });
  } catch (tokenErr) {
    console.error('[ThermoGuard FCM] Error getting FCM token from Firebase:', tokenErr);
    if (!vapidKey) {
      console.warn(
        '[ThermoGuard FCM] VITE_FIREBASE_VAPID_KEY is not set in frontend .env. ' +
        'Please add your Firebase Console Web Push Certificate (VAPID key).'
      );
    }
    throw new Error(`Failed to generate Firebase notification token: ${tokenErr.message}`);
  }

  if (!token) {
    throw new Error('No registration token available from Firebase. Please check Firebase console configuration.');
  }

  console.log('[ThermoGuard FCM] Successfully obtained FCM registration token:', token.slice(0, 15) + '...');
  setCachedFcmToken(token);

  // 5. Register Token with ThermoGuard Backend via Authenticated API
  try {
    await apiClient.post('/notifications/register-token', {
      token,
      deviceType: 'web',
      platform: navigator.platform || 'browser',
    });
    console.log('[ThermoGuard FCM] FCM token synced with backend API');
  } catch (apiErr) {
    console.warn('[ThermoGuard FCM] Backend token sync notice:', apiErr.message);
    // Token is still cached locally and valid
  }

  return {
    success: true,
    token,
    permission: 'granted',
  };
}

/**
 * Unregister/disable notifications
 */
export async function disableNotifications(userParam = null) {
  const token = getCachedFcmToken();
  if (token) {
    try {
      await apiClient.post('/notifications/unregister-token', { token });
    } catch (err) {
      console.warn('[ThermoGuard FCM] Error removing token from backend:', err.message);
    }
  }
  setCachedFcmToken(null);
  return { success: true };
}

/**
 * Listen for Firebase foreground messages when ThermoGuard app is active in the browser
 */
export function setupForegroundMessageListener(onReceiveMessage) {
  if (typeof window === 'undefined') return () => {};

  let unsubscribe = () => {};

  getFirebaseMessaging().then((messaging) => {
    if (messaging) {
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('[ThermoGuard FCM] Foreground push message received:', payload);
        if (typeof onReceiveMessage === 'function') {
          onReceiveMessage(payload);
        }
      });
    }
  });

  return () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
}

/**
 * Send a test alert notification to the current logged-in user through the backend
 */
export async function sendTestNotification() {
  return apiClient.post('/notifications/send-test', {});
}

/**
 * Query current user notification status from backend
 */
export async function getBackendNotificationStatus() {
  return apiClient.get('/notifications/status');
}
