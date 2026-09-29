"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { isConfigured, signIn } from "@/lib/whosthefirst/firebase";
import { isRoomCode, normalizeCode } from "@/lib/whosthefirst/codes";
import type { Session } from "@/lib/whosthefirst/types";
import ConsentSettings from "../ConsentSettings";
import Lobby from "./Lobby";
import RoomView from "./RoomView";
import styles from "./WhosTheFirst.module.css";

export const SESSION_KEY = "wtf:session";

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null) {
  try {
    if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: a reload just drops you back in the lobby */
  }
}

export default function WhosTheFirst() {
  const [uid, setUid] = useState<string | null>(null);
  const [authFailed, setAuthFailed] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [initialCode, setInitialCode] = useState("");

  useEffect(() => {
    if (!isConfigured) return;
    setSession(readSession());
    const fromUrl = normalizeCode(new URLSearchParams(window.location.search).get("room") ?? "");
    if (isRoomCode(fromUrl)) setInitialCode(fromUrl);
    signIn()
      .then((u) => setUid(u.uid))
      .catch(() => {
        setAuthFailed(true);
        track("wtf_connect_failed", { app: "whosthefirst" });
      });
  }, []);

  const enter = (s: Session | null) => {
    writeSession(s);
    setSession(s);
  };

  let body: React.ReactNode;
  if (!isConfigured) {
    body = (
      <p className={styles.notice}>
        This app isn&apos;t connected to its database yet. Set the <code>NEXT_PUBLIC_FIREBASE_*</code>{" "}
        variables and rebuild.
      </p>
    );
  } else if (authFailed) {
    body = <p className={styles.notice}>Couldn&apos;t reach the game server. Check your connection and reload.</p>;
  } else if (!uid) {
    body = <p className={`monoLabel ${styles.loading}`}>Connecting…</p>;
  } else if (session) {
    body = <RoomView key={session.key} session={session} uid={uid} onExit={() => enter(null)} />;
  } else {
    body = <Lobby uid={uid} initialCode={initialCode} onEnter={enter} />;
  }

  return (
    <div className={styles.app}>
      <header className={styles.top}>
        <a
          className={`monoLabel ${styles.back}`}
          href="/apps/"
          data-track="cta_click"
          data-track-cta="back_to_apps"
          data-track-app="whosthefirst"
        >
          ← Apps
        </a>
        <p className={`display ${styles.brand}`}>WHO&apos;S THE FIRST</p>
      </header>
      <main id="main" className={styles.main}>
        {body}
      </main>
      <footer className={styles.foot}>
        <ConsentSettings />
      </footer>
    </div>
  );
}
