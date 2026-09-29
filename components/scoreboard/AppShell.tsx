import { APP_PATH, isConfigured } from "@/lib/scoreboard/config";
import styles from "./Scoreboard.module.css";


export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.app}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <a className={styles.brand} href={APP_PATH}>
            <span className={styles.brandMark} aria-hidden="true" />
            <span className={styles.brandName}>Kyauk Thin Bone</span>
            <span className={styles.brandMm} lang="my">
              ကျောက်သင်ပုန်း
            </span>
          </a>
          <a className={`monoLabel ${styles.barLink}`} href="/">
            JAKE
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
    </div>
  );
}
