"use client";

import { useEffect, useState } from "react";
import { APP_PATH } from "@/lib/scoreboard/config";
import { spacedRoom } from "@/lib/scoreboard/format";
import { forgetMine, readMine, type MyBoard } from "@/lib/scoreboard/local";
import styles from "./Scoreboard.module.css";

export default function Landing() {
  const [mine, setMine] = useState<MyBoard[]>([]);
  useEffect(() => setMine(readMine()), []);

  return (
    <div className={styles.stack}>
      <header className={styles.hero}>
        <p className="monoLabel">A live scoreboard</p>
        <h1 className={`display ${styles.heroTitle}`}>
          Keep score.
          <br />
          Share it live.
        </h1>
        <p className={styles.desc}>
          Kyauk Thin Bone is the slate you keep score on — for card nights, board games and anything else with points.
        </p>
      </header>

      <div className={styles.choices}>
        <a className={styles.choice} href={`${APP_PATH}create/`}>
          <span className="monoLabel">01</span>
          <span className={styles.choiceTitle}>Create scoreboard</span>
          <span className={styles.choiceBody}>Get a room code and passcode, add up to 20 players, start scoring.</span>
          <span className={styles.choiceArrow} aria-hidden="true">
            →
          </span>
        </a>
        <a className={styles.choice} href={`${APP_PATH}join/`}>
          <span className="monoLabel">02</span>
          <span className={styles.choiceTitle}>View scoreboard</span>
          <span className={styles.choiceBody}>Enter a room code and passcode to follow the scores live.</span>
          <span className={styles.choiceArrow} aria-hidden="true">
            →
          </span>
        </a>
      </div>

      {mine.length > 0 && (
        <section aria-labelledby="mine-title">
          <div className={styles.sectionHead}>
            <h2 id="mine-title" className="monoLabel">
              Your scoreboards
            </h2>
            <span className={styles.meta}>on this device</span>
          </div>
          <ul className={styles.mine}>
            {mine.map((b) => (
              <li key={b.id} className={styles.mineRow}>
                <a href={`${APP_PATH}manage/?id=${b.id}`} className={styles.mineLink}>
                  <span className={styles.mineTitle}>{b.title || "Untitled scoreboard"}</span>
                  <span className={`mono ${styles.meta}`}>
                    {spacedRoom(b.roomCode)} · {b.passcode}
                  </span>
                </a>
                <button
                  type="button"
                  className={styles.btnGhost}
                  aria-label={`Hide ${b.title || "scoreboard"} from this list`}
                  onClick={() => {
                    forgetMine(b.id);
                    setMine(readMine());
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
