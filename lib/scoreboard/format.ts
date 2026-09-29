const pad = (n: number) => String(n).padStart(2, "0");

/** 1s ago · 3min ago · 23h ago · 23/10/2026 13:45:59 */
export function timeAgo(at: number, now: number): string {
  const s = Math.max(1, Math.floor((now - at) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = new Date(at);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** +25 · 0 · −3 (with a real minus sign). */
export function signed(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
}

/** −3 rather than -3 for display. */
export const num = (n: number) => (n < 0 ? `−${Math.abs(n)}` : String(n));

/** 123456 → "123 456" */
export const spacedRoom = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

/** Parses a user-typed integer, accepting a leading + or − sign. */
export function parseScore(raw: string): number | null {
  const t = raw.trim().replace(/−/g, "-");
  if (!/^[+-]?\d{1,7}$/.test(t)) return null;
  return parseInt(t, 10);
}
