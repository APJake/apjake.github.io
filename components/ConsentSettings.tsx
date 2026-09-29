"use client";

import { analyticsConfigured, openConsent } from "@/lib/analytics";
import styles from "./ConsentSettings.module.css";

/** Reopens the consent banner. Hidden when analytics isn't configured. */
export default function ConsentSettings({ className }: { className?: string }) {
  if (!analyticsConfigured) return null;
  return (
    <button type="button" className={`monoLabel ${styles.button} ${className ?? ""}`.trim()} onClick={openConsent}>
      Analytics settings
    </button>
  );
}
