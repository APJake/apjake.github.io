// No 0/O, 1/I/L: codes get read aloud across a room.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomInts(n: number, max: number): number[] {
  const out: number[] = [];
  const buf = new Uint32Array(1);
  // Rejection sampling keeps every symbol equally likely.
  const limit = Math.floor(0x100000000 / max) * max;
  while (out.length < n) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) out.push(buf[0] % max);
  }
  return out;
}

export function makeRoomCode(length = 6): string {
  return randomInts(length, ALPHABET.length)
    .map((i) => ALPHABET[i])
    .join("");
}

export function makePasscode(): string {
  return randomInts(4, 10).join("");
}

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export const isRoomCode = (s: string) => /^[A-Z0-9]{6}$/.test(s);
export const isPasscode = (s: string) => /^\d{4}$/.test(s);
