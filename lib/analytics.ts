/**
 * Firebase Analytics (GA4 underneath), behind a consent choice.
 *
 * Nothing loads until the visitor accepts: the Firebase SDK is imported on
 * demand, so visitors who decline never download it. Events tracked before a
 * choice is made are held in memory and sent only if the visitor accepts.
 *
 * Never pass personal data here — no names, room codes, passcodes or uids.
 */

export type EventParams = Record<string, string | number | boolean | null | undefined>;
export type Consent = "granted" | "denied";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

export const analyticsConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
    MEASUREMENT_ID,
);

const CONSENT_KEY = "analytics-consent";
/** Dispatched on `window` to reopen the consent banner. */
export const CONSENT_OPEN_EVENT = "analytics-consent:open";
const MAX_QUEUE = 50;
/** Query params that must never reach analytics (whosthefirst invite links carry the room code). */
const PRIVATE_PARAMS = ["room"];

type Sdk = {
  log: (name: string, params: EventParams) => void;
  setEnabled: (on: boolean) => void;
};

let sdk: Sdk | null = null;
let loading: Promise<void> | null = null;
const queue: [string, EventParams][] = [];

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(consent: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    /* private mode: the choice lasts for this page only */
  }
  if (consent === "granted") startAnalytics();
  else revokeAnalytics();
}

export function openConsent() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

function clean(params: EventParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) out[k] = v;
  return out;
}

export function startAnalytics(): Promise<void> {
  if (!analyticsConfigured) return Promise.resolve();
  if (sdk) {
    sdk.setEnabled(true);
    return Promise.resolve();
  }
  loading ??= (async () => {
    const [{ getFirebaseApp }, fa] = await Promise.all([import("@/lib/firebaseApp"), import("firebase/analytics")]);
    if (!(await fa.isSupported())) {
      queue.length = 0;
      return;
    }
    const instance = fa.initializeAnalytics(getFirebaseApp(), {
      // page_view is sent by components/Analytics.tsx on every route change.
      config: { send_page_view: false, ...(process.env.NODE_ENV !== "production" && { debug_mode: true }) },
    });
    sdk = {
      log: (name, params) => fa.logEvent(instance, name, clean(params)),
      setEnabled: (on) => fa.setAnalyticsCollectionEnabled(instance, on),
    };
    // The visitor may have declined again while the SDK was loading.
    if (readConsent() !== "granted") {
      sdk.setEnabled(false);
      queue.length = 0;
      return;
    }
    for (const [name, params] of queue.splice(0)) sdk.log(name, params);
  })().catch(() => {
    loading = null;
    queue.length = 0;
  });
  return loading;
}

export function revokeAnalytics() {
  queue.length = 0;
  sdk?.setEnabled(false);
  if (MEASUREMENT_ID) (window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`] = true;
}

function safeUrl(url: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    for (const p of PRIVATE_PARAMS) u.searchParams.delete(p);
    return u.toString();
  } catch {
    return undefined;
  }
}

/** Log an event. Held until consent is given, dropped if it's declined. */
export function track(name: string, eventParams: EventParams = {}) {
  if (!analyticsConfigured || typeof window === "undefined") return;
  const consent = readConsent();
  if (consent === "denied") return;
  // Explicit on every event so GA never falls back to the raw URL or referrer.
  const params = {
    page_location: safeUrl(window.location.href),
    page_referrer: safeUrl(document.referrer),
    ...eventParams,
  };
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", name, clean(params));
  if (sdk && consent === "granted") {
    sdk.log(name, params);
  } else if (queue.length < MAX_QUEUE) {
    queue.push([name, params]);
  }
}
