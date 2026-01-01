import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_SECRET_TOKEN,
  authDomain: import.meta.env.VITE_FB_AUTH_DOM,
  databaseURL: import.meta.env.VITE_FB_DB_URL,
  projectId: import.meta.env.VITE_FB_PROJ_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE,
  messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASURE_ID
};



// Validate config
const missingKeys = Object.entries(firebaseConfig).filter(([, value]) => !value);
if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration keys:', missingKeys.map(([key]) => key));
}

let app: any;
let auth: any;
let analytics: any;

try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { app, analytics, auth };
