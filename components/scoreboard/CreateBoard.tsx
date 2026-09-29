"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  createBoard,
  errorMessage,
  newId,
  newPasscode,
  newRoomCode,
  nextPlayerName,
  type DraftPlayer,
  type Settings,
} from "@/lib/scoreboard/board";
import { APP_PATH } from "@/lib/scoreboard/config";
import { spacedRoom } from "@/lib/scoreboard/format";
import { rememberMine } from "@/lib/scoreboard/local";
import { track } from "@/lib/analytics";
import BoardSettings from "./BoardSettings";
import EditableName from "./EditableName";
import ScoreInput from "./ScoreInput";
import styles from "./Scoreboard.module.css";

/** Setup → Add players → Start scoring. Nothing is written until "Start scoring". */
export default function CreateBoard() {
  const router = useRouter();
  const [codes, setCodes] = useState<{ room: string; pass: string } | null>(null);
  const [settings, setSettings] = useState<Settings>({
    title: "",
    description: "",
    defaultScore: 0,
    step: 5,
    matchByMatch: false,
  });
  const [players, setPlayers] = useState<DraftPlayer[]>([{ key: newId(8), name: nextPlayerName([]), start: 0 }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated after mount so the static HTML and the first client render agree.
  useEffect(() => setCodes({ room: newRoomCode(), pass: newPasscode() }), []);

  const changeSettings = (patch: Partial<Settings>) => {
    if (patch.defaultScore !== undefined && patch.defaultScore !== settings.defaultScore) {
      // Players still on the old default follow the new one; hand-edited starts stay.
      const from = settings.defaultScore;
      const to = patch.defaultScore;
      setPlayers((ps) => ps.map((p) => (p.start === from ? { ...p, start: to } : p)));
    }
    setSettings((s) => ({ ...s, ...patch }));
  };

  const add = () =>
    setPlayers((ps) =>
      ps.length >= MAX_PLAYERS
        ? ps
        : [...ps, { key: newId(8), name: nextPlayerName(ps.map((p) => p.name)), start: settings.defaultScore }],
    );

  const patchPlayer = (key: string, patch: Partial<DraftPlayer>) =>
    setPlayers((ps) => ps.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  const start = async () => {
    if (!codes) return;
    setBusy(true);
    setError(null);
    try {
      const res = await createBoard({ roomCode: codes.room, passcode: codes.pass, settings, players });
      track("ktb_board_create", { players: players.length, match_by_match: settings.matchByMatch });
      rememberMine({ id: res.id, roomCode: res.roomCode, passcode: res.passcode, title: settings.title, createdAt: Date.now() });
      router.push(`${APP_PATH}manage/?board=${res.id}`);
    } catch (e) {
      track("ktb_board_create_failed", { reason: (e as { code?: string }).code ?? (e as Error).name });
      setError(errorMessage(e, "Couldn't create the scoreboard. Check your connection and try again."));
      setBusy(false);
    }
  };

  return (
    <div className={styles.stack}>
      <header className={styles.boardHead}>
        <p className="monoLabel">New scoreboard</p>
        <h1 className={`display ${styles.title}`}>Set it up</h1>
      </header>

      <section className={styles.shareCard} aria-label="Room">
        <div className={styles.codes}>
          <div className={styles.code}>
            <span className="monoLabel">Room code</span>
            <span className={`mono ${styles.codeValue}`}>{codes ? spacedRoom(codes.room) : "··· ···"}</span>
          </div>
          <div className={styles.code}>
            <span className="monoLabel">Passcode</span>
            <span className={`mono ${styles.codeValue}`}>{codes ? codes.pass : "····"}</span>
          </div>
        </div>
        <p className={styles.hint}>Auto-generated. Viewers use these to find your board; a share link comes after creation.</p>
      </section>

      <section className={styles.panelOpen} aria-labelledby="setup-title">
        <h2 id="setup-title" className={`monoLabel ${styles.panelTitle}`}>
          1 · Setup
        </h2>
        <BoardSettings idPrefix="new" value={settings} onChange={changeSettings} />
      </section>

      <section className={styles.panelOpen} aria-labelledby="players-title">
        <div className={styles.sectionHead}>
          <h2 id="players-title" className={`monoLabel ${styles.panelTitle}`}>
            2 · Players
          </h2>
          <span className={styles.meta}>
            {players.length}/{MAX_PLAYERS} · tap a name to edit
          </span>
        </div>
        <ul className={styles.draftList}>
          {players.map((p) => (
            <li key={p.key} className={styles.draftRow}>
              <EditableName value={p.name} onSave={(name) => patchPlayer(p.key, { name })} />
              <label className={styles.inline}>
                <span className={styles.meta}>Start</span>
                <ScoreInput
                  label={`${p.name} starting score`}
                  value={p.start}
                  onCommit={(n) => patchPlayer(p.key, { start: n })}
                />
              </label>
              <button
                type="button"
                className={styles.btnGhost}
                aria-label={`Remove ${p.name}`}
                disabled={players.length <= MIN_PLAYERS}
                onClick={() => setPlayers((ps) => ps.filter((x) => x.key !== p.key))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.addPlayer} disabled={players.length >= MAX_PLAYERS} onClick={add}>
          {players.length >= MAX_PLAYERS ? `Maximum ${MAX_PLAYERS} players` : "+ Add player"}
        </button>
      </section>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={busy || !codes} onClick={start}>
        {busy ? "Creating…" : "3 · Start scoring →"}
      </button>
    </div>
  );
}
