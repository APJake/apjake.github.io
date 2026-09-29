import { formatDiff, formatMs, place } from "@/lib/whosthefirst/ranking";
import type { RoundResult } from "@/lib/whosthefirst/types";
import styles from "./WhosTheFirst.module.css";

type Props = { results: RoundResult[]; uid: string };

export default function Results({ results, uid }: Props) {
  const first = results.find((r) => r.ms !== null)?.ms ?? 0;
  return (
    <ol className={styles.results}>
      {results.map((r, i) => (
        <li key={r.uid} className={`${styles.resultRow} ${i === 0 && r.ms !== null ? styles.winner : ""}`}>
          <span className={styles.place}>{r.ms === null ? "—" : place(i)}</span>
          <span className={styles.resultName}>
            {r.name}
            {r.uid === uid && <span className={`monoLabel ${styles.you}`}>You</span>}
          </span>
          {r.ms === null ? (
            <span className={`mono ${styles.muted} ${styles.resultTime}`}>No tap</span>
          ) : (
            <>
              <span className={`mono ${styles.resultTime}`}>{formatMs(r.ms)}</span>
              <span className={`mono ${styles.resultDiff}`}>{formatDiff(r.ms, first)}</span>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
