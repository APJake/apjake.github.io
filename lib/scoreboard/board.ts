import { get, increment, ref, remove, serverTimestamp, set, update } from "firebase/database";
import { db, ensureUser } from "./firebase";

/*
 * Data layout (see database.rules.json):
 *
 *   rooms/{roomCode}            { owner }         claims the 6-digit code; never readable
 *   access/{roomCode}/{pass}    boardId           readable only by someone who knows both
 *   boards/{boardId}            Board             readable by anyone holding the id (the share link)
 *
 * The board id is 20 random characters, so the share link is the capability:
 * holding it is the same as knowing the room code and passcode.
 */

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 20;
export const MATCHES_PER_PAGE = 20;

export type Player = {
  name: string;
  /** Sort key for the creator's view; creation time in ms. */
  order: number;
  /** Starting score. `score` already includes it. */
  start: number;
  /** Running total. */
  score: number;
  /** Unsaved score for the match in progress (match-by-match only). */
  current: number;
  updatedAt: number;
};

export type Match = {
  n: number;
  at: number;
  scores: Record<string, number>;
};

export type Board = {
  owner: string;
  roomCode: string;
  passcode: string;
  title: string;
  description: string;
  defaultScore: number;
  /** Value of the third preset button, e.g. +5. */
  step: number;
  matchByMatch: boolean;
  matchCount: number;
  createdAt: number;
  updatedAt: number;
  players?: Record<string, Player>;
  matches?: Record<string, Match>;
};

export type Settings = Pick<Board, "title" | "description" | "defaultScore" | "step" | "matchByMatch">;

export type DraftPlayer = { key: string; name: string; start: number };

const digits = (n: number) => {
  const buf = new Uint32Array(n);
  crypto.getRandomValues(buf);
  return Array.from(buf, (v) => String(v % 10)).join("");
};

// A room code never starts with 0 so it always reads as six digits.
export const newRoomCode = () => String(1 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9)) + digits(5);
export const newPasscode = () => digits(4);

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export function newId(len = 20) {
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (v) => ALPHABET[v % ALPHABET.length]).join("");
}

export const playerName = (n: number) => `Player #${n}`;

/** Lowest "Player #n" not already taken, so names stay tidy after removals. */
export function nextPlayerName(names: string[]) {
  const taken = new Set(names);
  let n = 1;
  while (taken.has(playerName(n))) n++;
  return playerName(n);
}

export const isRoomCode = (s: string) => /^[0-9]{6}$/.test(s);
export const isPasscode = (s: string) => /^[0-9]{4}$/.test(s);

const boardPath = (id: string) => `boards/${id}`;

function isPermissionDenied(err: unknown) {
  return String((err as { code?: string; message?: string })?.code ?? (err as Error)?.message ?? "")
    .toUpperCase()
    .includes("PERMISSION_DENIED");
}

/**
 * Claims the room code, writes the board, then publishes the passcode entry.
 * If the room code is already taken a fresh one is tried; the final codes are
 * returned because they may differ from the ones shown on the setup screen.
 */
export async function createBoard(input: {
  roomCode: string;
  passcode: string;
  settings: Settings;
  players: DraftPlayer[];
}): Promise<{ id: string; roomCode: string; passcode: string }> {
  const user = await ensureUser();
  const database = db();

  let roomCode = input.roomCode;
  for (let attempt = 0; ; attempt++) {
    try {
      await set(ref(database, `rooms/${roomCode}`), { owner: user.uid });
      break;
    } catch (err) {
      if (!isPermissionDenied(err) || attempt >= 7) throw err;
      roomCode = newRoomCode();
    }
  }

  const id = newId();
  const now = Date.now();
  const players: Record<string, Omit<Player, "updatedAt"> & { updatedAt: object }> = {};
  input.players.forEach((p, i) => {
    players[newId(12)] = {
      name: p.name.trim() || playerName(i + 1),
      order: now + i,
      start: p.start,
      score: p.start,
      current: 0,
      updatedAt: serverTimestamp(),
    };
  });

  await set(ref(database, boardPath(id)), {
    owner: user.uid,
    roomCode,
    passcode: input.passcode,
    ...input.settings,
    matchCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    players,
  });
  await set(ref(database, `access/${roomCode}/${input.passcode}`), id);

  return { id, roomCode, passcode: input.passcode };
}

/** Resolves a room code + passcode to a board id, or null if they don't match. */
export async function lookupBoard(roomCode: string, passcode: string): Promise<string | null> {
  const snap = await get(ref(db(), `access/${roomCode}/${passcode}`));
  return snap.exists() ? (snap.val() as string) : null;
}

// --- Creator mutations -------------------------------------------------------
// Scores use server-side increment() so taps from two open tabs never clobber
// each other.

export function addScore(id: string, pid: string, delta: number, matchByMatch: boolean) {
  return update(ref(db(), boardPath(id)), {
    [`players/${pid}/${matchByMatch ? "current" : "score"}`]: increment(delta),
    [`players/${pid}/updatedAt`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function renamePlayer(id: string, pid: string, name: string) {
  return update(ref(db(), boardPath(id)), {
    [`players/${pid}/name`]: name,
    updatedAt: serverTimestamp(),
  });
}

/** Changing the starting score shifts the total by the same amount. */
export function setStartScore(id: string, pid: string, from: number, to: number) {
  return update(ref(db(), boardPath(id)), {
    [`players/${pid}/start`]: to,
    [`players/${pid}/score`]: increment(to - from),
    [`players/${pid}/updatedAt`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function addPlayer(id: string, name: string, start: number) {
  const pid = newId(12);
  return update(ref(db(), boardPath(id)), {
    [`players/${pid}`]: {
      name,
      order: Date.now(),
      start,
      score: start,
      current: 0,
      updatedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
}

export function removePlayer(id: string, pid: string) {
  return remove(ref(db(), `${boardPath(id)}/players/${pid}`));
}

export function saveSettings(id: string, settings: Partial<Settings>) {
  return update(ref(db(), boardPath(id)), { ...settings, updatedAt: serverTimestamp() });
}

/** Turning match-by-match off drops any unsaved match scores. */
export function setMatchByMatch(id: string, board: Board, on: boolean) {
  const patch: Record<string, unknown> = { matchByMatch: on, updatedAt: serverTimestamp() };
  if (!on) for (const pid of Object.keys(board.players ?? {})) patch[`players/${pid}/current`] = 0;
  return update(ref(db(), boardPath(id)), patch);
}

/**
 * Records the match in progress, adds each player's match score to their
 * total and starts the next match at 0 — all in one atomic multi-path update.
 */
export function saveMatch(id: string, board: Board) {
  const players = board.players ?? {};
  const scores: Record<string, number> = {};
  const patch: Record<string, unknown> = {};
  for (const [pid, p] of Object.entries(players)) {
    const c = p.current ?? 0;
    scores[pid] = c;
    patch[`players/${pid}/current`] = increment(-c);
    patch[`players/${pid}/score`] = increment(c);
    patch[`players/${pid}/updatedAt`] = serverTimestamp();
  }
  const n = (board.matchCount ?? 0) + 1;
  patch[`matches/${newId(12)}`] = { n, at: serverTimestamp(), scores };
  patch.matchCount = n;
  patch.updatedAt = serverTimestamp();
  return update(ref(db(), boardPath(id)), patch);
}

// --- Derived views -----------------------------------------------------------

export type PlayerRow = Player & { id: string };

export function playersInOrder(board: Board): PlayerRow[] {
  return Object.entries(board.players ?? {})
    .map(([id, p]) => ({ id, ...p, current: p.current ?? 0 }))
    .sort((a, b) => a.order - b.order);
}

/** Viewer order: highest total first; ties broken by the live match score. */
export function playersByScore(board: Board): PlayerRow[] {
  return playersInOrder(board).sort((a, b) => b.score - a.score || b.current - a.current || a.order - b.order);
}

export function matchesNewestFirst(board: Board): Match[] {
  return Object.values(board.matches ?? {}).sort((a, b) => b.n - a.n);
}
