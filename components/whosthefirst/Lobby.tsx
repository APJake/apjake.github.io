"use client";

import { useEffect, useState } from "react";
import { isPasscode, isRoomCode, normalizeCode } from "@/lib/whosthefirst/codes";
import { createRoom, joinRoom, RoomError, type RoomErrorCode } from "@/lib/whosthefirst/room";
import type { Session } from "@/lib/whosthefirst/types";
import styles from "./WhosTheFirst.module.css";

const NAME_KEY = "wtf:name";

export const errorText: Record<RoomErrorCode, string> = {
  "not-found": "No room with that code and passcode. It may have expired.",
  frozen: "A round is in progress. Try again when it ends.",
  full: "That room is full (20 players).",
  busy: "Couldn't create a room right now. Try again.",
};

type Props = { uid: string; initialCode: string; onEnter: (s: Session) => void };

export default function Lobby({ uid, initialCode, onEnter }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(initialCode);
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<{ where: "create" | "join"; text: string } | null>(null);

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {}
  }, []);
  useEffect(() => setCode(initialCode), [initialCode]);

  const cleanName = name.trim().slice(0, 20);
  const nameOk = cleanName.length > 0;

  const run = async (where: "create" | "join", fn: () => Promise<Omit<Session, "name">>) => {
    if (!nameOk) {
      setError({ where, text: "Enter your name first." });
      return;
    }
    setBusy(where);
    setError(null);
    try {
      localStorage.setItem(NAME_KEY, cleanName);
    } catch {}
    try {
      const room = await fn();
      onEnter({ ...room, name: cleanName });
    } catch (e) {
      const c = e instanceof RoomError ? e.code : where === "create" ? "busy" : "not-found";
      setError({ where, text: errorText[c] });
      setBusy(null);
    }
  };

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    run("create", () => createRoom(uid, cleanName));
  };

  const onJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const c = normalizeCode(code);
    if (!isRoomCode(c) || !isPasscode(passcode)) {
      setError({ where: "join", text: "Room code is 6 characters, passcode is 4 digits." });
      return;
    }
    run("join", () => joinRoom(c, passcode, uid, cleanName));
  };

  return (
    <div className={styles.lobby}>
      <section className={styles.intro}>
        <h1 className={`display ${styles.hero}`}>
          WAIT FOR GO.
          <br />
          <span className={styles.accent}>TAP FIRST.</span>
        </h1>
        <p className={styles.lead}>
          2–20 players, one room. Everyone taps Ready, the screen counts down, then it lights up. The quickest
          reaction wins, measured on each device to the millisecond.
        </p>
      </section>

      <label className={styles.field}>
        <span className="monoLabel">Your name</span>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          autoComplete="nickname"
          placeholder="Jake"
        />
      </label>

      <div className={styles.panels}>
        <form className={styles.panel} onSubmit={onCreate}>
          <h2 className={`monoLabel ${styles.panelTitle}`}>Create room</h2>
          <p className={styles.panelNote}>You get a room code and a 4-digit passcode to share.</p>
          <button className={styles.primary} disabled={busy !== null}>
            {busy === "create" ? "Creating…" : "Create room"}
          </button>
          {error?.where === "create" && <p className={styles.error} role="alert">{error.text}</p>}
        </form>

        <form className={styles.panel} onSubmit={onJoin}>
          <h2 className={`monoLabel ${styles.panelTitle}`}>Enter room</h2>
          <div className={styles.pair}>
            <label className={styles.field}>
              <span className="monoLabel">Room code</span>
              <input
                className={`${styles.input} ${styles.codeInput}`}
                value={code}
                onChange={(e) => setCode(normalizeCode(e.target.value).slice(0, 6))}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder="ABC123"
              />
            </label>
            <label className={styles.field}>
              <span className="monoLabel">Passcode</span>
              <input
                className={`${styles.input} ${styles.codeInput}`}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="0000"
              />
            </label>
          </div>
          <button className={styles.secondary} disabled={busy !== null}>
            {busy === "join" ? "Entering…" : "Enter room"}
          </button>
          {error?.where === "join" && <p className={styles.error} role="alert">{error.text}</p>}
        </form>
      </div>
    </div>
  );
}
