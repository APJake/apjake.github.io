import type { Bill } from "./types";

// The bill in progress, so a refresh or a closed tab doesn't lose it.
// Stays in this browser only; nothing is sent anywhere.

const KEY = "who-ate-what:draft";
const VERSION = 1;

export function readDraft(): { bill: Bill; step: number } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.v !== VERSION || !Array.isArray(data.bill?.people) || !Array.isArray(data.bill?.items)) return null;
    return { bill: data.bill as Bill, step: Number(data.step) || 0 };
  } catch {
    return null;
  }
}

export function writeDraft(bill: Bill, step: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, bill, step }));
  } catch {
    // Storage blocked (private mode): the app still works, it just won't survive a reload.
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
