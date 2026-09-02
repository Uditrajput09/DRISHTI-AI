// frontend/src/firebase.js
// Firebase client initialization for DRISHTI-AI
import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDdq3uwfQns0EBdHtOAlgUKV7r-Frp2VR4",
  authDomain: "drishti-ai-dbea6.firebaseapp.com",
  projectId: "drishti-ai-dbea6",
  storageBucket: "drishti-ai-dbea6.firebasestorage.app",
  messagingSenderId: "572011004962",
  appId: "1:572011004962:web:f4f0f9252f096057a5b67b",
  measurementId: "G-THKCSS7J0Z"
};

export const vapidKey = "BGAXsIVEeU0te-bxGxZjE-Whzh0arigB1AbR6i3ryRiB5dyDqcvkdDOJX5W70-bAJORQaZQTm9w_doXiXSkk_eE";

// Initialize Firebase App instance safely
let app = null;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  console.warn("Firebase initialization warning:", e);
}

export default app;
