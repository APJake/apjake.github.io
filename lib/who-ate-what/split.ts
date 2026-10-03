import type { Bill, Discount, Item, Person } from "./types";

/**
 * Split `amount` into parts proportional to `weights`, using largest-remainder
 * rounding so the parts always sum to `amount` exactly. Ties go to the earliest
 * index starting from `offset`, so leftovers don't always land on the same
 * person. Integer-only (BigInt), so large bills can't lose precision.
 */
export function allocate(amount: number, weights: number[], offset = 0): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const total = weights.reduce((a, w) => a + Math.max(0, w), 0);
  // No basis to split on: share equally.
  const ws = total > 0 ? weights.map((w) => BigInt(Math.max(0, w))) : weights.map(() => 1n);
  const sum = ws.reduce((a, w) => a + w, 0n);
  const amt = BigInt(amount);

  const parts = ws.map((w) => (amt * w) / sum);
  const rems = ws.map((w, i) => ({ i, r: (amt * w) % sum }));
  let left = Number(amt - parts.reduce((a, p) => a + p, 0n));

  const rank = (i: number) => (i - (offset % n) + n) % n;
  rems.sort((a, b) => (a.r === b.r ? rank(a.i) - rank(b.i) : a.r > b.r ? -1 : 1));
  for (let k = 0; left > 0; k = (k + 1) % n, left--) parts[rems[k].i] += 1n;

  return parts.map(Number);
}

/** Basis-point percentage of an amount, rounded half up. */
function pctOf(amount: number, bp: number): number {
  return Number((BigInt(amount) * BigInt(bp) + 5000n) / 10000n);
}

export function discountAmount(base: number, d: Discount | null): number {
  if (!d || base <= 0) return 0;
  const raw = d.kind === "percent" ? pctOf(base, d.value) : d.value;
  return Math.min(Math.max(0, raw), base);
}

export type ItemLine = {
  item: Item;
  gross: number;
  discount: number;
  net: number;
  /** Eaters that still exist in the people list. */
  eaters: string[];
};

export type PersonShare = { itemId: string; name: string; amount: number; of: number };

export type PersonResult = {
  person: Person;
  shares: PersonShare[];
  /** Sum of dish shares (after dish discounts). */
  subtotal: number;
  billDiscount: number;
  service: number;
  tax: number;
  total: number;
};

export type SplitResult = {
  lines: ItemLine[];
  /** Dishes with a price but nobody assigned: not part of the split. */
  unassigned: ItemLine[];
  gross: number;
  itemDiscounts: number;
  subtotal: number;
  billDiscounts: { id: string; label: string; amount: number }[];
  billDiscountTotal: number;
  service: number;
  tax: number;
  grandTotal: number;
  people: PersonResult[];
  /** Σ person totals === grandTotal. True by construction; checked anyway. */
  balanced: boolean;
};

export function lineOf(item: Item, people: Person[]): ItemLine {
  const gross = item.price * Math.max(0, item.qty);
  const discount = discountAmount(gross, item.discount);
  const ids = new Set(people.map((p) => p.id));
  return { item, gross, discount, net: gross - discount, eaters: item.eaters.filter((id) => ids.has(id)) };
}

export function split(bill: Bill): SplitResult {
  const { people } = bill;
  const index = new Map(people.map((p, i) => [p.id, i]));
  const allLines = bill.items.map((it) => lineOf(it, people));
  const lines = allLines.filter((l) => l.eaters.length > 0);
  const unassigned = allLines.filter((l) => l.eaters.length === 0 && l.gross > 0);

  const results: PersonResult[] = people.map((person) => ({
    person, shares: [], subtotal: 0, billDiscount: 0, service: 0, tax: 0, total: 0,
  }));

  // 1. Each dish's net price, split equally among whoever had it.
  lines.forEach((line, li) => {
    const parts = allocate(line.net, line.eaters.map(() => 1), li);
    line.eaters.forEach((id, k) => {
      const r = results[index.get(id)!];
      r.shares.push({ itemId: line.item.id, name: line.item.name, amount: parts[k], of: line.eaters.length });
      r.subtotal += parts[k];
    });
  });

  const gross = lines.reduce((a, l) => a + l.gross, 0);
  const itemDiscounts = lines.reduce((a, l) => a + l.discount, 0);
  const subtotal = results.reduce((a, r) => a + r.subtotal, 0);

  // 2. Bill discounts, applied in order to the running total, then shared in
  //    proportion to what each person ate.
  let running = subtotal;
  const billDiscounts = bill.billDiscounts.map((d) => {
    const amount = discountAmount(running, d);
    running -= amount;
    return { id: d.id, label: d.label, amount };
  });
  const billDiscountTotal = subtotal - running;

  // 3. Service charge on the discounted total; tax on that plus service.
  const service = pctOf(running, bill.servicePct);
  const tax = pctOf(running + service, bill.taxPct);
  const grandTotal = running + service + tax;

  // Discount, service and tax are all proportional to what each person ate,
  // so each person's total is rounded once, straight from the grand total.
  // Rounding each part separately would let errors stack, and two people who
  // ate the same thing could end up a couple of units apart.
  const weights = results.map((r) => r.subtotal);
  allocate(grandTotal, weights, 1).forEach((amt, i) => (results[i].total = amt));

  // The breakdown: every part but the last non-zero one is allocated the same
  // way; the last one takes what's left, so the parts still add up to the total.
  const parts = [
    { key: "billDiscount", amount: billDiscountTotal, sign: -1 },
    { key: "service", amount: service, sign: 1 },
    { key: "tax", amount: tax, sign: 1 },
  ] as const;
  const last = [...parts].reverse().find((p) => p.amount > 0);
  for (const p of parts) {
    if (p === last || p.amount === 0) continue;
    allocate(p.amount, weights, 1).forEach((amt, i) => (results[i][p.key] = amt));
  }
  if (last) {
    for (const r of results) {
      const others = parts.reduce((a, p) => (p === last ? a : a + p.sign * r[p.key]), 0);
      r[last.key] = last.sign * (r.total - r.subtotal - others);
    }
  }

  const balanced =
    results.reduce((a, r) => a + r.total, 0) === grandTotal &&
    results.every((r) => r.subtotal - r.billDiscount + r.service + r.tax === r.total);

  return {
    lines, unassigned, gross, itemDiscounts, subtotal, billDiscounts, billDiscountTotal,
    service, tax, grandTotal, people: results, balanced,
  };
}
