import { MIN_PLAYERS } from "@/lib/whosthefirst/room";
import type { Phase } from "@/lib/whosthefirst/types";
import styles from "./WhosTheFirst.module.css";

type Props = { ready: boolean; phase: Phase; count: number; waiting: number; onToggle: () => void };

export default function ReadyBar({ ready, phase, count, waiting, onToggle }: Props) {
  const hint =
    count < MIN_PLAYERS
      ? `Need at least ${MIN_PLAYERS} players. Share the room code and passcode.`
      : waiting > 0
        ? `Waiting for ${waiting} player${waiting === 1 ? "" : "s"} to get ready.`
        : "Starting…";
  return (
    <section className={styles.readyBar}>
      <button className={ready ? styles.secondary : styles.primary} onClick={onToggle} aria-pressed={ready}>
        {ready ? "Not ready" : phase === "result" ? "Ready for next round" : "Ready"}
      </button>
      <p className={styles.muted}>{hint}</p>
    </section>
  );
}
