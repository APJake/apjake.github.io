"use client";

import { useState } from "react";
import type { PlayerRow } from "@/lib/scoreboard/board";
import { num, signed, timeAgo } from "@/lib/scoreboard/format";
import EditableName from "./EditableName";
import ScoreControls from "./ScoreControls";
import ScoreInput from "./ScoreInput";
import styles from "./Scoreboard.module.css";

/** Creator's card: name, score, preset buttons, and a drawer for start score / remove. */
export default function PlayerCard({
  player,
  matchByMatch,
  step,
  now,
  canRemove,
  onScore,
  onRename,
  onStart,
  onRemove,
}: {
  player: PlayerRow;
  matchByMatch: boolean;
  step: number;
  now: number;
  canRemove: boolean;
  onScore: (delta: number) => void;
  onRename: (name: string) => void;
  onStart: (to: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const startId = `start-${player.id}`;

  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <EditableName value={player.name} onSave={onRename} />
        <button
          type="button"
          className={styles.more}
          aria-expanded={open}
          aria-label={`${player.name} options`}
          onClick={() => setOpen((o) => !o)}
        >
          ⋯
        </button>
      </div>

      {matchByMatch ? (
        <div className={styles.scoreBlock}>
          <p className={styles.total}>
            <span className="monoLabel">Total</span> {num(player.score)}
          </p>
          <p className={`${styles.big} ${player.current ? styles.bigLive : ""}`} aria-label="Current match">
            {signed(player.current)}
          </p>
        </div>
      ) : (
        <div className={styles.scoreBlock}>
          <p className={styles.big}>{num(player.score)}</p>
          <p className={styles.ago}>{timeAgo(player.updatedAt, now)}</p>
        </div>
      )}

      <ScoreControls step={step} label={player.name} onScore={onScore} />

      {open && (
        <div className={styles.drawer}>
          <label className={styles.inline} htmlFor={startId}>
            <span className="monoLabel">Starting score</span>
            <ScoreInput id={startId} label="Starting score" value={player.start ?? 0} onCommit={onStart} />
          </label>
          <button
            type="button"
            className={styles.btnDanger}
            disabled={!canRemove}
            onClick={() => {
              if (confirm(`Remove ${player.name}? Their score will be lost.`)) onRemove();
            }}
          >
            Remove
          </button>
        </div>
      )}
    </li>
  );
}
