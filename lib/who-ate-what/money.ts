import type { CurrencyCode } from "./types";

export type Currency = { code: CurrencyCode; label: string; decimals: number };

export const CURRENCIES: Currency[] = [
  { code: "MMK", label: "Ks", decimals: 0 },
  { code: "VND", label: "₫", decimals: 0 },
  { code: "USD", label: "$", decimals: 2 },
  { code: "SGD", label: "S$", decimals: 2 },
  { code: "THB", label: "฿", decimals: 2 },
  { code: "EUR", label: "€", decimals: 2 },
];

export function currencyOf(code: CurrencyCode): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/** Minor units → "12,500" / "12.50". No symbol. */
export function formatAmount(minor: number, code: CurrencyCode): string {
  const { decimals } = currencyOf(code);
  return (minor / 10 ** decimals).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Minor units → "12,500 Ks" / "$12.50". */
export function formatMoney(minor: number, code: CurrencyCode): string {
  const c = currencyOf(code);
  const sign = minor < 0 ? "−" : "";
  const n = formatAmount(Math.abs(minor), code);
  return c.decimals === 0 ? `${sign}${n} ${c.label}` : `${sign}${c.label}${n}`;
}

/**
 * Typed text → minor units. Accepts "12,500", "12500", "12.5", " 1 200 ".
 * Returns null for empty or unreadable input.
 */
export function parseAmount(text: string, code: CurrencyCode): number | null {
  const compact = text.replace(/\s/g, "");
  // Kyat and dong have no decimals, so "45.000" is forty-five thousand.
  if (currencyOf(code).decimals === 0 && /^\d{1,3}([.,]\d{3})+$/.test(compact)) {
    return Number(compact.replace(/[.,]/g, ""));
  }
  const cleaned = compact.replace(/,/g, "");
  if (!cleaned || !/^\d*\.?\d*$/.test(cleaned) || cleaned === ".") return null;
  const { decimals } = currencyOf(code);
  const value = Math.round(Number(cleaned) * 10 ** decimals);
  return Number.isFinite(value) ? value : null;
}

/** Basis points → "10" / "7.5" for an input box. */
export function formatPct(bp: number): string {
  return String(bp / 100);
}

/** "10" / "7.5" → basis points, capped 0–100%. */
export function parsePct(text: string): number | null {
  const cleaned = text.replace(/[%\s]/g, "");
  if (!cleaned || !/^\d*\.?\d*$/.test(cleaned) || cleaned === ".") return null;
  const bp = Math.round(Number(cleaned) * 100);
  return Number.isFinite(bp) ? Math.min(bp, 10000) : null;
}
