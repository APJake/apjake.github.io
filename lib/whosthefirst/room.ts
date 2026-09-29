/**
 * Every room mutation. There is no server: clients drive the state machine
 * themselves, and RTDB transactions make each transition happen exactly once
 * however many clients race to trigger it.
 *
 *   idle ─(all ready)→ ready ─(startAt)→ started ─(first tap + 3s)→ result
 *                        ↑                                             │
 *                        └────────────────(all ready)──────────────────┘
 */
import {
  get,
  onDisconnect,
  ref,
  runTransaction,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import { getDb, serverNow } from "./firebase";
import { makePasscode, makeRoomCode } from "./codes";
import { rankRound } from "./ranking";
import type { Game, Tap } from "./types";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 20;
/** Length of the 3…2…1 countdown. */
export const COUNTDOWN_MS = 3000;
/** Taps are accepted for this long after the first one lands. */
export const TAP_WINDOW_MS = 3000;
/** Ends a round nobody tapped in. */
export const NO_TAP_TIMEOUT_MS = 15000;
/** A room and its history are dropped this long after the last activity. */
export const ROOM_TTL_MS = 2 * 60 * 60 * 1000;

export type RoomErrorCode = "not-found" | "frozen" | "full" | "busy";

export class RoomError extends Error {
  constructor(public code: RoomErrorCode) {
    super(code);
  }
}

export const roomKey = (code: string, passcode: string) => `${code}-${passcode}`;

const gameRef = (key: string) => ref(getDb(), `rooms/${key}/game`);
const playerRef = (key: string, uid: string) => ref(getDb(), `rooms/${key}/game/players/${uid}`);

/** Random pause after "1" so nobody can tap on rhythm. */
const suspense = () => 500 + Math.floor(Math.random() * 2000);

/** Pushes the room's expiry forward. Called on every meaningful action. */
export function touch(key: string, code: string) {
  const expiresAt = serverNow() + ROOM_TTL_MS;
  return update(ref(getDb()), {
    [`rooms/${key}/meta/expiresAt`]: expiresAt,
    [`codes/${code}/expiresAt`]: expiresAt,
  }).catch(() => {});
}

async function reserveCode(expiresAt: number): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = makeRoomCode();
    const res = await runTransaction(ref(getDb(), `codes/${code}`), (cur: { expiresAt: number } | null) => {
      if (cur && cur.expiresAt > serverNow()) return; // taken: abort, try another
      return { expiresAt };
    });
    if (res.committed) return code;
  }
  throw new RoomError("busy");
}

export async function createRoom(uid: string, name: string) {
  const expiresAt = serverNow() + ROOM_TTL_MS;
  const code = await reserveCode(expiresAt);
  const passcode = makePasscode();
  const key = roomKey(code, passcode);
  const game: Game = {
    phase: "idle",
    round: 0,
    players: { [uid]: { name, ready: false, joinedAt: serverNow() } },
  };
  // Multi-path so a stale, expired room under the same key is wiped too.
  await update(ref(getDb(), `rooms/${key}`), {
    meta: { code, createdAt: serverTimestamp(), expiresAt },
    game,
    taps: null,
    history: null,
  });
  return { key, code, passcode };
}

/** Adds (or re-adds after a reload) the player. Only allowed while idle or showing results. */
export async function joinRoom(code: string, passcode: string, uid: string, name: string) {
  const key = roomKey(code, passcode);
  // Wrong code, wrong passcode and expired all read as permission denied.
  try {
    const meta = await get(ref(getDb(), `rooms/${key}/meta`));
    if (!meta.exists()) throw new RoomError("not-found");
  } catch (e) {
    throw e instanceof RoomError ? e : new RoomError("not-found");
  }

  // An object, not a let: TS can't see the transaction callback assign it.
  const outcome: { refused: RoomErrorCode | null } = { refused: null };
  const res = await runTransaction(gameRef(key), (g: Game | null) => {
    if (!g) return g;
    outcome.refused = null;
    const players = g.players ?? {};
    if (players[uid]) {
      players[uid].name = name;
      return g;
    }
    if (g.phase === "ready" || g.phase === "started") {
      outcome.refused = "frozen";
      return;
    }
    if (Object.keys(players).length >= MAX_PLAYERS) {
      outcome.refused = "full";
      return;
    }
    g.players = { ...players, [uid]: { name, ready: false, joinedAt: serverNow() } };
    return g;
  });
  if (outcome.refused) throw new RoomError(outcome.refused);
  if (!res.committed || !res.snapshot.exists()) throw new RoomError("not-found");
  touch(key, code);
  return { key, code, passcode };
}

/** Removes the player; the last one out deletes the room and its history. */
export async function leaveRoom(key: string, code: string, uid: string) {
  await onDisconnect(playerRef(key, uid)).cancel();
  const res = await runTransaction(gameRef(key), (g: Game | null) => {
    if (!g) return g;
    if (g.players) delete g.players[uid];
    return g;
  });
  if (res.committed && !res.snapshot.child("players").hasChildren()) {
    await update(ref(getDb()), {
      [`rooms/${key}/meta`]: null,
      [`rooms/${key}/game`]: null,
      [`rooms/${key}/taps`]: null,
      [`rooms/${key}/history`]: null,
      [`codes/${code}`]: null,
    });
  }
}

/** Drops the player automatically if their connection goes away. */
export function removeOnDisconnect(key: string, uid: string) {
  return onDisconnect(playerRef(key, uid)).remove();
}

export async function setReady(key: string, code: string, uid: string, ready: boolean) {
  await set(ref(getDb(), `rooms/${key}/game/players/${uid}/ready`), ready);
  touch(key, code);
}

/** Starts a round once everybody (at least two players) is ready. Idempotent. */
export function maybeStart(key: string) {
  return runTransaction(gameRef(key), (g: Game | null) => {
    if (!g) return g;
    if (g.phase !== "idle" && g.phase !== "result") return;
    const players = Object.values(g.players ?? {});
    if (players.length < MIN_PLAYERS || !players.every((p) => p.ready)) return;
    const readyAt = serverNow();
    return {
      ...g,
      phase: "ready",
      round: (g.round ?? 0) + 1,
      readyAt,
      startAt: readyAt + COUNTDOWN_MS + suspense(),
      firstTapAt: null,
    };
  });
}

/** Flips ready → started once GO is due. Taps are only accepted after this. */
export function markStarted(key: string, round: number) {
  return runTransaction(gameRef(key), (g: Game | null) => {
    if (!g) return g;
    if (g.phase !== "ready" || g.round !== round) return;
    return { ...g, phase: "started" };
  });
}

export async function submitTap(key: string, round: number, uid: string, name: string, ms: number) {
  const tap: Omit<Tap, "at"> & { at: object } = { ms, name, at: serverTimestamp() };
  await set(ref(getDb(), `rooms/${key}/taps/${round}/${uid}`), tap);
  // The first tap to land opens the 3-second window for everyone else.
  await runTransaction(ref(getDb(), `rooms/${key}/game/firstTapAt`), (cur: number | null) => cur ?? serverNow());
}

/** Ends the round, resets ready flags and writes the ranking to history. Idempotent. */
export async function finalizeRound(key: string, code: string, round: number) {
  const res = await runTransaction(gameRef(key), (g: Game | null) => {
    if (!g) return g;
    if (g.phase !== "started" || g.round !== round) return;
    for (const p of Object.values(g.players ?? {})) p.ready = false;
    return { ...g, phase: "result" };
  });
  const game = res.snapshot.val() as Game | null;
  if (!res.committed || game?.phase !== "result" || game.round !== round) return;

  const taps = (await get(ref(getDb(), `rooms/${key}/taps/${round}`))).val() as Record<string, Tap> | null;
  await set(ref(getDb(), `rooms/${key}/history/${round}`), {
    endedAt: serverTimestamp(),
    results: rankRound(taps, game.players),
  });
  touch(key, code);
}
