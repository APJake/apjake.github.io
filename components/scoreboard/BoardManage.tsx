"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  addPlayer,
  addScore,
  matchesNewestFirst,
  nextPlayerName,
  playersInOrder,
  removePlayer,
  renamePlayer,
  saveMatch,
  saveSettings,
  setMatchByMatch,
  setStartScore,
  type Settings,
} from "@/lib/scoreboard/board";
import { APP_PATH } from "@/lib/scoreboard/config";
import { useBoard, useServerNow, useUid } from "@/lib/scoreboard/hooks";
import { rememberMine } from "@/lib/scoreboard/local";
import BoardSettings from "./BoardSettings";
import { BoardMessage } from "./BoardMessage";
import MatchHistory from "./MatchHistory";
import PlayerCard from "./PlayerCard";
import ShareCard from "./ShareCard";
import styles from "./Scoreboard.module.css";

/** The creator's screen: every control, live. */
export default function BoardManage() {
  const id = useSearchParams().get("id");
  const state = useBoard(id);
  const uid = useUid();
  const now = useServerNow();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const board = state.status === "ready" ? state.board : null;
  const isOwner = Boolean(board && uid && board.owner === uid);

  useEffect(() => {
    if (!id || !board || !isOwner) return;
    rememberMine({ id, roomCode: board.roomCode, passcode: board.passcode, title: board.title, createdAt: board.createdAt });
  }, [id, board?.roomCode, board?.passcode, board?.title, board?.createdAt, isOwner]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.status !== "ready") return <BoardMessage state={state} />;
  if (uid === null) return <BoardMessage state={{ status: "loading" }} />;
  if (!board || !id) return null;

  if (!isOwner) {
    return (
      <div className={styles.notice} role="alert">
        <p className="monoLabel">View only</p>
        <p>Only the browser that created this scoreboard can edit it.</p>
        <p>
          <a href={`${APP_PATH}view/?id=${id}`}>Open the scoreboard →</a>
        </p>
      </div>
    );
  }

  const run = (p: Promise<unknown>) => p.catch((e: Error) => setError(e.message || "Couldn't save. Check your connection."));

  const players = playersInOrder(board);
  const settings: Settings = {
    title: board.title ?? "",
    description: board.description ?? "",
    defaultScore: board.defaultScore ?? 0,
    step: board.step ?? 5,
    matchByMatch: Boolean(board.matchByMatch),
  };

  const changeSettings = (patch: Partial<Settings>) => {
    if (patch.matchByMatch === false && players.some((p) => p.current !== 0)) {
      if (!confirm("Turn off match by match? The unsaved scores of the current match will be discarded.")) return;
    }
    if (patch.matchByMatch !== undefined) run(setMatchByMatch(id, board, patch.matchByMatch));
    const { matchByMatch: _ignored, ...rest } = patch;
    if (Object.keys(rest).length) run(saveSettings(id, rest));
  };

  const onSaveMatch = async () => {
    setSaving(true);
    await run(saveMatch(id, board));
    setSaving(false);
  };

  const matchNo = (board.matchCount ?? 0) + 1;

  return (
    <div className={styles.stack}>
      <header className={styles.boardHead}>
        <p className={`monoLabel ${styles.live}`}>
          <span className={styles.dot} aria-hidden="true" /> Creator
          {settings.matchByMatch && <> · Match #{matchNo}</>}
        </p>
        <h1 className={`display ${styles.title}`}>{settings.title || "Scoreboard"}</h1>
        {settings.description && <p className={styles.desc}>{settings.description}</p>}
      </header>

      <ShareCard id={id} roomCode={board.roomCode} passcode={board.passcode} />

      <details className={styles.panel}>
        <summary className={styles.panelSummary}>
          <span className="monoLabel">Settings</span>
        </summary>
        <BoardSettings idPrefix="live" value={settings} onChange={changeSettings} />
      </details>

      {error && (
        <p className={styles.error} role="alert">
          {error}{" "}
          <button type="button" className={styles.linkBtn} onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}

      <section aria-labelledby="players-title">
        <div className={styles.sectionHead}>
          <h2 id="players-title" className="monoLabel">
            Players
          </h2>
          <span className={styles.meta}>
            {players.length}/{MAX_PLAYERS}
          </span>
        </div>
        <ul className={styles.cards}>
          {players.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              matchByMatch={settings.matchByMatch}
              step={settings.step}
              now={now}
              canRemove={players.length > MIN_PLAYERS}
              onScore={(d) => run(addScore(id, p.id, d, settings.matchByMatch))}
              onRename={(name) => run(renamePlayer(id, p.id, name))}
              onStart={(to) => run(setStartScore(id, p.id, p.start ?? 0, to))}
              onRemove={() => run(removePlayer(id, p.id))}
            />
          ))}
        </ul>
        <button
          type="button"
          className={styles.addPlayer}
          disabled={players.length >= MAX_PLAYERS}
          onClick={() => run(addPlayer(id, nextPlayerName(players.map((p) => p.name)), settings.defaultScore))}
        >
          {players.length >= MAX_PLAYERS ? `Maximum ${MAX_PLAYERS} players` : "+ Add player"}
        </button>
      </section>

      {settings.matchByMatch && (
        <>
          <div className={styles.saveBar}>
            <div className={`${styles.saveBarInner}`}>
              <span className="monoLabel">Match #{matchNo}</span>
              <button type="button" className={styles.btnPrimary} disabled={saving} onClick={onSaveMatch}>
                {saving ? "Saving…" : "Save match"}
              </button>
            </div>
          </div>
          <MatchHistory matches={matchesNewestFirst(board)} players={players} />
        </>
      )}
    </div>
  );
}
