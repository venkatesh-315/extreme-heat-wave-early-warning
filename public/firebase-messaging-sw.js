// ThermoGuard — Firebase Cloud Messaging Service Worker for Background Heat Alerts
/* eslint-disable no-undef */

// 1. Load Firebase App and Messaging compat SDKs for Service Worker context
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// 2. Initialize Firebase in the Service Worker using the ThermoGuard project credentials
firebase.initializeApp({
  apiKey: "AIzaSyCC-A0fraXRn2fwhWKvDmnp-6hUQtc_4YA",
  authDomain: "thermo-guard.firebaseapp.com",
  projectId: "thermo-guard",
  storageBucket: "thermo-guard.firebasestorage.app",
  messagingSenderId: "547455478713",
  appId: "1:547455478713:web:9c452ce65f40dd01a82468",
  measurementId: "G-70W090QVNY"
});

const messaging = firebase.messaging();

// 3. Handle Background FCM Push Messages when ThermoGuard is not in the active foreground
messaging.onBackgroundMessage((payload) => {
  console.log('[ThermoGuard SW] Received background FCM message:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'ThermoGuard Emergency Heat Alert 🚨';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Elevated thermal stress detected. Check immediate heat advisory actions.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.data?.type || 'thermoguard-heatwave-alert',
    renotify: true,
    requireInteraction: payload.data?.level === 'RED' || payload.notification?.requireInteraction || false,
    data: {
      url: payload.data?.url || (payload.fcmOptions && payload.fcmOptions.link) || '/alerts',
      alertId: payload.data?.alertId || null,
      type: payload.data?.type || 'heat_alert',
      timestamp: payload.data?.timestamp || new Date().toISOString(),
    },
    actions: [
      {
        action: 'view-alert',
        title: 'View Heat Directive',
      },
      {
        action: 'close',
        title: 'Dismiss',
      }
    ],
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. Handle Notification Click (Re-focus existing tab or open /alerts)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/alerts';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a ThermoGuard tab is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 5. Install & Activate Service Worker immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
