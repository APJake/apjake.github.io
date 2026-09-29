"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isPasscode, isRoomCode, lookupBoard } from "@/lib/scoreboard/board";
import { APP_PATH } from "@/lib/scoreboard/config";
import { track } from "@/lib/analytics";
import styles from "./Scoreboard.module.css";

const onlyDigits = (s: string, max: number) => s.replace(/\D/g, "").slice(0, max);

/** Room code + passcode → the read-only viewer. */
export default function JoinBoard() {
  const router = useRouter();
  const [room, setRoom] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = isRoomCode(room) && isPasscode(pass);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      const id = await lookupBoard(room, pass);
      track(id ? "ktb_board_join" : "ktb_board_join_failed", id ? {} : { reason: "not_found" });
      if (id) {
        router.push(`${APP_PATH}view/?board=${id}`);
        return;
      }
      setError("No scoreboard matches that room code and passcode.");
    } catch (err) {
      track("ktb_board_join_failed", { reason: (err as { code?: string }).code ?? (err as Error).name });
      setError((err as Error).message || "Couldn't reach the server. Check your connection.");
    }
    setBusy(false);
  };

  return (
    <form className={styles.stack} onSubmit={submit}>
      <header className={styles.boardHead}>
        <p className="monoLabel">View scoreboard</p>
        <h1 className={`display ${styles.title}`}>Enter the room</h1>
        <p className={styles.desc}>Ask the creator for the room code and passcode, or open the link they shared.</p>
      </header>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="room" className="monoLabel">
            Room code
          </label>
          <input
            id="room"
            className={`mono ${styles.codeInput}`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="000000"
            autoFocus
            value={room}
            onChange={(e) => setRoom(onlyDigits(e.target.value, 6))}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="pass" className="monoLabel">
            Passcode
          </label>
          <input
            id="pass"
            className={`mono ${styles.codeInput}`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="0000"
            value={pass}
            onChange={(e) => setPass(onlyDigits(e.target.value, 4))}
          />
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={!ready || busy}>
        {busy ? "Looking…" : "View scoreboard →"}
      </button>
    </form>
  );
}
