// frontend/src/firebase.js
// Firebase client initialization for DRISHTI-AI
// All config values MUST come from environment variables — no hardcoded keys.
import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

// Initialize Firebase App instance safely (skipped if no apiKey configured)
let app = null;
if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    if (import.meta.env.DEV) console.warn("Firebase initialization warning:", e);
  }
}

export default app;
