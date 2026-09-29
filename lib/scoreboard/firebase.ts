import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, onAuthStateChanged, signInAnonymously, type Auth, type User } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase, type Database } from "firebase/database";
import { firebaseConfig, isConfigured } from "./config";

export { isConfigured };

// Local development against `firebase emulators:start` (database on 9000, auth on 9099).
const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;

let database: Database | null = null;
let auth: Auth | null = null;

function app(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function db(): Database {
  if (!database) {
    database = getDatabase(app());
    if (emulatorHost) connectDatabaseEmulator(database, emulatorHost, 9000);
  }
  return database;
}

function authInstance(): Auth {
  if (!auth) {
    auth = getAuth(app());
    if (emulatorHost) connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  }
  return auth;
}

let signingIn: Promise<User> | null = null;

/**
 * Creators are identified by a Firebase anonymous account, which persists in
 * the browser. The board's `owner` is that uid, and the rules only let the
 * owner write. Viewers never need to sign in.
 */
export function ensureUser(): Promise<User> {
  if (signingIn) return signingIn;
  const a = authInstance();
  signingIn = new Promise<User>((resolve, reject) => {
    const stop = onAuthStateChanged(
      a,
      (user) => {
        stop();
        if (user) resolve(user);
        else signInAnonymously(a).then((c) => resolve(c.user), reject);
      },
      reject,
    );
  }).catch((err) => {
    signingIn = null;
    throw err;
  });
  return signingIn;
}
