import ConsentSettings from "@/components/ConsentSettings";
import { APP_PATH, isConfigured } from "@/lib/scoreboard/config";
import styles from "./Scoreboard.module.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.app}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <a
            className={`monoLabel ${styles.barLink}`}
            href="/apps/"
            data-track="cta_click"
            data-track-cta="back_to_apps"
            data-track-app="kyauk-thin-bone"
          >
            ← Apps
          </a>
          <a className={styles.brand} href={APP_PATH}>
            <span className={styles.brandMark} aria-hidden="true" />
            <span className={styles.brandName}>Kyauk Thin Bone</span>
            <span className={styles.brandMm} lang="my">
              ကျောက်သင်ပုန်း
            </span>
          </a>
        </div>
      </header>
      <main id="main" className={styles.main}>
        {isConfigured ? (
          children
        ) : (
          <div className={styles.notice} role="alert">
            <p className="monoLabel">Not configured</p>
            <p>
              Firebase isn&apos;t set up for this build. Set the <code>NEXT_PUBLIC_FIREBASE_*</code> variables
              (see <code>.env.example</code>) and rebuild.
            </p>
          </div>
        )}
      </main>
      <footer className={styles.foot}>
        <ConsentSettings />
      </footer>
    </div>
  );
}
