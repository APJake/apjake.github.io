"use client";

import { useEffect } from "react";
import { SESSION_KEY } from "@/components/whosthefirst/WhosTheFirst";
import styles from "@/components/whosthefirst/WhosTheFirst.module.css";

/**
 * Last-resort recovery. The room session lives in sessionStorage and every
 * reload rejoins it, so without this a bad room state could lock a tab out
 * of the app for good.
 */
export default function WhosTheFirstError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const backToLobby = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    window.location.reload();
  };

  return (
    <div className={styles.app}>
      <header className={styles.top}>
        <a className={`monoLabel ${styles.back}`} href="/apps/">
          ← Apps
        </a>
        <p className={`display ${styles.brand}`}>WHO&apos;S THE FIRST</p>
      </header>
      <main id="main" className={styles.main}>
        <div className={styles.ended}>
          <p className={styles.notice}>Something went wrong in this room.</p>
          <div className={styles.headActions}>
            <button className={styles.primary} onClick={backToLobby}>
              Back to lobby
            </button>
            <button className={styles.secondary} onClick={retry}>
              Try again
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
