"use client";

import { useEffect, useState } from "react";
import {
  analyticsConfigured,
  CONSENT_OPEN_EVENT,
  readConsent,
  setConsent,
  type Consent,
} from "@/lib/analytics";
import styles from "./ConsentBanner.module.css";

/**
 * Asks once, before any analytics loads. Reopened from "Analytics settings"
 * (components/ConsentSettings.tsx). Rendered only after mount, so the
 * prerendered HTML never contains it and there is no flash for returning
 * visitors.
 */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Consent | null>(null);

  useEffect(() => {
    if (!analyticsConfigured) return;
    const show = () => {
      setCurrent(readConsent());
      setOpen(true);
    };
    if (readConsent() === null) show();
    window.addEventListener(CONSENT_OPEN_EVENT, show);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, show);
  }, []);

  if (!open) return null;

  const choose = (c: Consent) => {
    setConsent(c);
    setOpen(false);
  };

  return (
    <section className={styles.banner} aria-labelledby="consent-heading">
      <h2 id="consent-heading" className={`monoLabel ${styles.title}`}>
        Analytics
      </h2>
      <p className={styles.text}>
        Can I count page views and clicks with Google Analytics for Firebase? It helps me see what people
        read. Nothing personal is collected, and nothing is sent unless you accept.
      </p>
      {current && (
        <p className={`monoLabel ${styles.status}`}>Currently {current === "granted" ? "on" : "off"}</p>
      )}
      <div className={styles.actions}>
        <button type="button" className={`monoLabel ${styles.decline}`} onClick={() => choose("denied")}>
          Decline
        </button>
        <button type="button" className={`monoLabel ${styles.accept}`} onClick={() => choose("granted")}>
          Accept
        </button>
      </div>
    </section>
  );
}
