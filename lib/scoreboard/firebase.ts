import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  type Auth,
  type User,
} from "firebase/auth";
import { connectDatabaseEmulator, getDatabase, type Database } from "firebase/database";
import { firebaseConfig } from "@/lib/firebaseApp";

/** Local testing only: points the SDK at `firebase emulators:start`. */
const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1";

/*
 * A named app rather than the shared default one. Auth state is stored per
 * app, and whosthefirst switches the default app to per-tab session
 * persistence; the scoreboard creator's identity has to outlive the tab,
 * so it lives in its own app with local persistence.
 */
const APP_NAME = "kyauk-thin-bone";

let database: Database | null = null;
let auth: Auth | null = null;

function app(): FirebaseApp {
  return getApps().some((a) => a.name === APP_NAME) ? getApp(APP_NAME) : initializeApp(firebaseConfig, APP_NAME);
}

export function db(): Database {
  if (!database) {
    database = getDatabase(app());
    if (useEmulator) connectDatabaseEmulator(database, "127.0.0.1", 9000);
  }
  return database;
}

function authInstance(): Auth {
  if (!auth) {
    auth = getAuth(app());
    if (useEmulator) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return auth;
}

let signingIn: Promise<User> | null = null;

/**
 * Creators are identified by a Firebase anonymous account kept in local
 * storage. The board's `owner` is that uid, and the rules only let the owner
 * write. Viewers never need to sign in.
 */
export function ensureUser(): Promise<User> {
  if (signingIn) return signingIn;
  const a = authInstance();
  signingIn = setPersistence(a, browserLocalPersistence)
    .then(
      () =>
        new Promise<User>((resolve, reject) => {
          const stop = onAuthStateChanged(
            a,
            (user) => {
              stop();
              if (user) resolve(user);
              else signInAnonymously(a).then((c) => resolve(c.user), reject);
            },
            reject,
          );
        }),
    )
    .catch((err) => {
      signingIn = null;
      throw err;
    });
  return signingIn;
}
