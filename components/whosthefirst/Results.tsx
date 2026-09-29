import { formatDiff, formatMs, place } from "@/lib/whosthefirst/ranking";
import type { RoundResult } from "@/lib/whosthefirst/types";
import styles from "./WhosTheFirst.module.css";

type Props = { results: RoundResult[]; uid: string };

export default function Results({ results, uid }: Props) {
  const first = results.find((r) => typeof r.ms === "number")?.ms ?? 0;
  return (
    <ol className={styles.results}>
      {results.map((r, i) => {
        const ms = typeof r.ms === "number" ? r.ms : null;
        return (
          <li key={r.uid} className={`${styles.resultRow} ${i === 0 && ms !== null ? styles.winner : ""}`}>
            <span className={styles.place}>{ms === null ? "—" : place(i)}</span>
            <span className={styles.resultName}>
              {r.name}
              {r.uid === uid && <span className={`monoLabel ${styles.you}`}>You</span>}
            </span>
            {ms === null ? (
              <span className={`mono ${styles.muted} ${styles.resultTime}`}>No tap</span>
            ) : (
              <>
                <span className={`mono ${styles.resultTime}`}>{formatMs(ms)}</span>
                <span className={`mono ${styles.resultDiff}`}>{formatDiff(ms, first)}</span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
