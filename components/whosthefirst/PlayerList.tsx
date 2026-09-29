import type { Player } from "@/lib/whosthefirst/types";
import styles from "./WhosTheFirst.module.css";

type Props = { players: Record<string, Player>; uid: string };

export default function PlayerList({ players, uid }: Props) {
  const list = Object.entries(players).sort(([, a], [, b]) => a.joinedAt - b.joinedAt);
  return (
    <section className={styles.block} aria-labelledby="players-heading">
      <h2 id="players-heading" className={`monoLabel ${styles.blockTitle}`}>
        Players
      </h2>
      <ul className={styles.players}>
        {list.map(([id, p]) => (
          <li key={id} className={styles.player}>
            <span className={styles.playerName}>
              {p.name}
              {id === uid && <span className={`monoLabel ${styles.you}`}>You</span>}
            </span>
            <span className={`monoLabel ${p.ready ? styles.readyOn : styles.readyOff}`}>
              {p.ready ? "✓ Ready" : "Not ready"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
