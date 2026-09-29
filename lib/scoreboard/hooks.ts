import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db, ensureUser } from "./firebase";
import { isConfigured } from "./config";
import type { Board } from "./board";

export type BoardState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | { status: "ready"; board: Board };

/** Live subscription to one board. */
export function useBoard(id: string | null): BoardState {
  const [state, setState] = useState<BoardState>({ status: "loading" });

  useEffect(() => {
    if (!id || !isConfigured) {
      setState({ status: "missing" });
      return;
    }
    setState({ status: "loading" });
    return onValue(
      ref(db(), `scoreboard/boards/${id}`),
      (snap) => setState(snap.exists() ? { status: "ready", board: snap.val() as Board } : { status: "missing" }),
      (err) => setState({ status: "error", message: err.message }),
    );
  }, [id]);

  return state;
}

/** The anonymous uid of this browser, or null until it's known. */
export function useUid(): string | null {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    if (!isConfigured) return;
    let live = true;
    ensureUser()
      .then((u) => live && setUid(u.uid))
      .catch(() => live && setUid(""));
    return () => {
      live = false;
    };
  }, []);
  return uid;
}

/**
 * Current time on the server's clock, ticking once a second. Timestamps are
 * written by the server, so "3s ago" stays right on a device whose clock is off.
 */
export function useServerNow(): number {
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isConfigured) return;
    return onValue(ref(db(), ".info/serverTimeOffset"), (snap) => setOffset(Number(snap.val()) || 0));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return now + offset;
}
