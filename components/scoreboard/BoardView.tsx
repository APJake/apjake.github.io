"use client";

import { useSearchParams } from "next/navigation";
import { matchesNewestFirst, playersByScore } from "@/lib/scoreboard/board";
import { APP_PATH } from "@/lib/scoreboard/config";
import { num, signed, timeAgo } from "@/lib/scoreboard/format";
import { useBoard, useServerNow } from "@/lib/scoreboard/hooks";
import MatchHistory from "./MatchHistory";
import { BoardMessage } from "./BoardMessage";
import styles from "./Scoreboard.module.css";

/** Read-only scoreboard for viewers, always ranked by total score. */
export default function BoardView() {
  const id = useSearchParams().get("board");
  const state = useBoard(id);
  const now = useServerNow();

  if (state.status !== "ready") return <BoardMessage state={state} />;
  const { board } = state;
  const ranked = playersByScore(board);

  return (
    <div className={styles.stack}>
      <header className={styles.boardHead}>
        <p className={`monoLabel ${styles.live}`}>
          <span className={styles.dot} aria-hidden="true" /> Live
          {board.matchByMatch && <> · Match #{(board.matchCount ?? 0) + 1}</>}
        </p>
        <h1 className={`display ${styles.title}`}>{board.title || "Scoreboard"}</h1>
        {board.description && <p className={styles.desc}>{board.description}</p>}
      </header>

      <ol className={styles.ranking}>
        {ranked.map((p, i) => (
          <li key={p.id} className={`${styles.rankRow} ${i === 0 && ranked.length > 1 ? styles.leader : ""}`}>
            <span className={`mono ${styles.rank}`}>{i + 1}</span>
            <span className={styles.rankName}>{p.name}</span>
            {board.matchByMatch ? (
              <span className={styles.rankScore}>
                <span className={`${styles.rankBig} ${p.current ? styles.bigLive : ""}`}>{signed(p.current)}</span>
                <span className={styles.rankSmall}>Total {num(p.score)}</span>
              </span>
            ) : (
              <span className={styles.rankScore}>
                <span className={styles.rankBig}>{num(p.score)}</span>
                <span className={styles.rankSmall}>{timeAgo(p.updatedAt, now)}</span>
              </span>
            )}
          </li>
        ))}
      </ol>

      {board.matchByMatch && <MatchHistory matches={matchesNewestFirst(board)} players={ranked} />}

      <p className={styles.footNote}>
        <a href={APP_PATH}>Make your own scoreboard →</a>
      </p>
    </div>
  );
}
