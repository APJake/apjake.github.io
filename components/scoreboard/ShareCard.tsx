"use client";

import { useEffect, useState } from "react";
import { APP_PATH } from "@/lib/scoreboard/config";
import { spacedRoom } from "@/lib/scoreboard/format";
import styles from "./Scoreboard.module.css";

/** Room code, passcode and the public link that skips the passcode. */
export default function ShareCard({ id, roomCode, passcode }: { id: string; roomCode: string; passcode: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);

  const link = `${origin}${APP_PATH}view/?id=${id}`;

  const copy = async (what: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied((c) => (c === what ? null : c)), 1600);
    } catch {
      window.prompt("Copy this:", text);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Kyauk Thin Bone", url: link });
        return;
      } catch {
        // Cancelled or unsupported target: fall through to copy.
      }
    }
    copy("link", link);
  };

  return (
    <section className={styles.shareCard} aria-label="Share">
      <div className={styles.codes}>
        <button type="button" className={styles.code} onClick={() => copy("room", roomCode)}>
          <span className="monoLabel">{copied === "room" ? "Copied" : "Room code"}</span>
          <span className={`mono ${styles.codeValue}`}>{spacedRoom(roomCode)}</span>
        </button>
        <button type="button" className={styles.code} onClick={() => copy("pass", passcode)}>
          <span className="monoLabel">{copied === "pass" ? "Copied" : "Passcode"}</span>
          <span className={`mono ${styles.codeValue}`}>{passcode}</span>
        </button>
      </div>
      <div className={styles.linkRow}>
        <span className="monoLabel">Share link · no passcode needed</span>
        <div className={styles.linkBox}>
          <input className={styles.linkInput} readOnly value={link} aria-label="Share link" onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className={styles.btnAccent} onClick={share}>
            {copied === "link" ? "Copied" : "Share"}
          </button>
        </div>
        <a className={styles.smallLink} href={`${APP_PATH}view/?id=${id}`} target="_blank" rel="noopener">
          Open viewer ↗
        </a>
      </div>
    </section>
  );
}
