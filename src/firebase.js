// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, isSupported } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyCC-A0fraXRn2fwhWKvDmnp-6hUQtc_4YA",
    authDomain: "thermo-guard.firebaseapp.com",
    projectId: "thermo-guard",
    storageBucket: "thermo-guard.firebasestorage.app",
    messagingSenderId: "547455478713",
    appId: "1:547455478713:web:9c452ce65f40dd01a82468",
    measurementId: "G-70W090QVNY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase Cloud Messaging safely (handles environments where Push/SW is unsupported)
let messagingInstance = null;

export const getFirebaseMessaging = async () => {
    if (typeof window === 'undefined') return null;
    if (messagingInstance) return messagingInstance;
    
    try {
        const supported = await isSupported();
        if (supported) {
            messagingInstance = getMessaging(app);
            return messagingInstance;
        } else {
            console.warn('[ThermoGuard FCM] Firebase Messaging is not supported in this browser environment.');
            return null;
        }
    } catch (err) {
        console.error('[ThermoGuard FCM] Error initializing Firebase Messaging:', err);
        return null;
    }
};

export default app;