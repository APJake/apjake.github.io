export type Phase = "idle" | "ready" | "started" | "result";

export type Player = { name: string; ready: boolean; joinedAt: number };

export type Game = {
  phase: Phase;
  /** Rounds played so far. Incremented when a round starts. */
  round: number;
  /** Server-time ms: when the 3…2…1 countdown began. */
  readyAt?: number;
  /** Server-time ms: when GO shows on every screen. */
  startAt?: number;
  /** Server-time ms: when the first tap of the round reached the database. */
  firstTapAt?: number;
  players?: Record<string, Player>;
};

/** `ms` is the player's reaction time: local tap timestamp minus local GO paint. */
export type Tap = { ms: number; name: string; at: number };

export type RoundResult = { uid: string; name: string; ms: number | null };

export type HistoryRound = { endedAt: number; results: RoundResult[] };

export type Meta = { code: string; createdAt: number; expiresAt: number };

export type Room = {
  meta: Meta;
  game: Game;
  taps?: Record<string, Record<string, Tap>>;
  history?: Record<string, HistoryRound>;
};

export type Session = { key: string; code: string; passcode: string; name: string };
