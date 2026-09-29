import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

// Inlined at build time, so each variable must be referenced by its full
// name. The web config is public by design; the database rules
// (database.rules.json) are what protect the data.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * The one default app shared by analytics and the mini apps. Whichever asks
 * first creates it, so it must always carry the full config — an app created
 * without `measurementId` can't start analytics later.
 */
export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
