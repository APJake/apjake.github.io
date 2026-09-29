import { formatMs } from "@/lib/whosthefirst/ranking";
import type { RoundResult } from "@/lib/whosthefirst/types";
import Results from "./Results";
import styles from "./WhosTheFirst.module.css";

type Props = { rounds: { round: number; results: RoundResult[] }[]; uid: string };

export default function History({ rounds, uid }: Props) {
  if (rounds.length === 0) return null;
  return (
    <section className={styles.block} aria-labelledby="history-heading">
      <h2 id="history-heading" className={`monoLabel ${styles.blockTitle}`}>
        Session history
      </h2>
      <div className={styles.history}>
        {rounds.map((h) => {
          const winner = h.results[0];
          return (
            <details key={h.round} className={styles.historyItem}>
              <summary className={styles.historySummary}>
                <span className="monoLabel">Round {h.round}</span>
                <span className={styles.muted}>
                  {winner && typeof winner.ms === "number"
                    ? `🥇 ${winner.name} · ${formatMs(winner.ms)}`
                    : "Nobody tapped"}
                </span>
              </summary>
              <Results results={h.results} uid={uid} />
            </details>
          );
        })}
      </div>
    </section>
  );
}
