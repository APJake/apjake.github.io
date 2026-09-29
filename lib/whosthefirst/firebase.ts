import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { connectDatabaseEmulator, getDatabase, onValue, ref, type Database } from "firebase/database";

// Inlined at build time. The web config is public by design; the database
// rules (database.rules.json) are what protect the data.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Local testing only: points the SDK at `firebase emulators:start`. */
const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1";

export const isConfigured = Boolean(config.apiKey && config.databaseURL && config.projectId);

let db: Database | null = null;
let offset = 0;

export function getDb(): Database {
  if (db) return db;
  const app = getApps().length ? getApp() : initializeApp(config);
  db = getDatabase(app);
  if (useEmulator) {
    connectDatabaseEmulator(db, "127.0.0.1", 9000);
    connectAuthEmulator(getAuth(app), "http://127.0.0.1:9099", { disableWarnings: true });
  }
  onValue(ref(db, ".info/serverTimeOffset"), (s) => {
    offset = s.val() ?? 0;
  });
  return db;
}

/** Best estimate of the database server's clock, in epoch ms. */
export function serverNow(): number {
  return Date.now() + offset;
}

/**
 * Anonymous sign-in. Session persistence gives every browser tab its own
 * player, while a reload keeps the same one.
 */
export async function signIn(): Promise<User> {
  getDb();
  const auth = getAuth(getApp());
  await setPersistence(auth, browserSessionPersistence);
  const existing = await new Promise<User | null>((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off();
      resolve(u);
    });
  });
  return existing ?? (await signInAnonymously(auth)).user;
}
