"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { MAX_PLAYERS } from "@/lib/whosthefirst/room";
import styles from "./WhosTheFirst.module.css";

type Props = { code: string; passcode: string; count: number; onLeave: () => void };

export default function RoomHeader({ code, passcode, count, onLeave }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const link = `${window.location.origin}/apps/whosthefirst/?room=${code}`;
    try {
      await navigator.clipboard.writeText(`Who's the first — room ${code}, passcode ${passcode}\n${link}`);
      setCopied(true);
      track("wtf_invite_copy", { app: "whosthefirst" });
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <section className={styles.roomHead} aria-label="Room">
      <dl className={styles.creds}>
        <div>
          <dt className="monoLabel">Room</dt>
          <dd className={`mono ${styles.cred}`}>{code}</dd>
        </div>
        <div>
          <dt className="monoLabel">Passcode</dt>
          <dd className={`mono ${styles.cred}`}>{passcode}</dd>
        </div>
        <div>
          <dt className="monoLabel">Players</dt>
          <dd className={`mono ${styles.cred}`}>
            {count}
            <span className={styles.muted}>/{MAX_PLAYERS}</span>
          </dd>
        </div>
      </dl>
      <div className={styles.headActions}>
        <button className={styles.ghost} onClick={copy}>
          {copied ? "Copied" : "Copy invite"}
        </button>
        <button className={styles.ghost} onClick={onLeave}>
          Leave
        </button>
      </div>
    </section>
  );
}
