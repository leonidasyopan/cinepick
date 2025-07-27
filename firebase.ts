import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Add additional error logging to help diagnose deployment issues
const logEnvVarStatus = (name: string, value: string): string => {
  if (!value) {
    console.warn(`Missing environment variable: ${name}`);
  }
  return value;
};

// Make sure all config values are defined with proper fallbacks
const firebaseConfig = {
  apiKey: logEnvVarStatus('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY || ''),
  authDomain: logEnvVarStatus('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || ''),
  projectId: logEnvVarStatus('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID || ''),
  storageBucket: logEnvVarStatus('VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || ''),
  messagingSenderId: logEnvVarStatus('VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''),
  appId: logEnvVarStatus('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID || ''),
  measurementId: logEnvVarStatus('VITE_FIREBASE_MEASUREMENT_ID', import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '')
};

// Check if all necessary Firebase config keys are provided
const areFirebaseKeysProvided =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId;

// Initialize Firebase only if the app hasn't been initialized yet and keys are provided
const app = areFirebaseKeysProvided && !getApps().length
  ? initializeApp(firebaseConfig)
  : (getApps()[0] || null);

// Conditionally initialize Analytics.
// This is just to enable analytics tracking. The instance is not used in the app yet.
if (app) {
  isSupported().then(supported => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

// Conditionally export auth and db so the app can run without Firebase for unauthenticated users
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

// Export a flag to check if Firebase is available
export const isFirebaseEnabled = !!app;

// Default export for the app instance to use with Firebase AI
export default app;