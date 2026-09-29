import type { Player, RoundResult, Tap } from "./types";

/** Tappers first, fastest reaction first; players who never tapped go last. */
export function rankRound(
  taps: Record<string, Tap> | null | undefined,
  players: Record<string, Player> | null | undefined,
): RoundResult[] {
  const tapped = Object.entries(taps ?? {})
    .map(([uid, t]) => ({ uid, name: t.name, ms: t.ms }))
    .sort((a, b) => a.ms - b.ms || a.uid.localeCompare(b.uid));
  const missed = Object.entries(players ?? {})
    .filter(([uid]) => !taps?.[uid])
    .map(([uid, p]) => ({ uid, name: p.name, ms: null }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...tapped, ...missed];
}

export function place(i: number): string {
  return ["🥇", "🥈", "🥉"][i] ?? `${i + 1}.`;
}

export function formatMs(ms: number): string {
  return `${ms.toFixed(3)} ms`;
}

/** 0.000s for the winner, +0.042s for everyone behind. */
export function formatDiff(ms: number, first: number): string {
  const d = (ms - first) / 1000;
  return d === 0 ? "0.000s" : `+${d.toFixed(3)}s`;
}

/** RTDB can hand arrays back as objects; normalise either shape. */
export function asList<T>(v: T[] | Record<string, T> | null | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : Object.values(v);
}
