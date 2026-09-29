// Boards created in this browser, so the creator can find them again from the
// landing page. Convenience only: ownership is enforced by the database rules.

export type MyBoard = { id: string; roomCode: string; passcode: string; title: string; createdAt: number };

const KEY = "kyauk-thin-bone:mine";

export function readMine(): MyBoard[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as MyBoard[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function rememberMine(board: MyBoard) {
  try {
    const rest = readMine().filter((b) => b.id !== board.id);
    localStorage.setItem(KEY, JSON.stringify([board, ...rest].slice(0, 20)));
  } catch {
    // Storage blocked (private mode): the board still exists, it just won't be listed.
  }
}

export function forgetMine(id: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(readMine().filter((b) => b.id !== id)));
  } catch {}
}
