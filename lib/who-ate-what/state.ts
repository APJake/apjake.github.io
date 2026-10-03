import { currencyOf } from "./money";
import type { Bill, BillDiscount, CurrencyCode, Discount, Item, Person } from "./types";
import { MAX_PEOPLE, MIN_PEOPLE } from "./types";

export type Action =
  | { type: "setCount"; count: number }
  | { type: "renamePerson"; id: string; name: string }
  | { type: "removePerson"; id: string }
  | { type: "addItem"; id: string }
  | { type: "updateItem"; id: string; patch: Partial<Omit<Item, "id">> }
  | { type: "removeItem"; id: string }
  | { type: "toggleEater"; itemId: string; personId: string }
  | { type: "setEaters"; itemId: string; eaters: string[] }
  | { type: "assignUnassignedToAll" }
  | { type: "setItemDiscount"; id: string; discount: Discount | null }
  | { type: "addBillDiscount"; id: string }
  | { type: "updateBillDiscount"; id: string; patch: Partial<Omit<BillDiscount, "id">> }
  | { type: "removeBillDiscount"; id: string }
  | { type: "setCurrency"; currency: CurrencyCode }
  | { type: "setPct"; field: "servicePct" | "taxPct"; value: number }
  | { type: "setReceiptTotal"; value: number | null }
  | {
      type: "importItems";
      items: { name: string; qty: number; price: number }[];
      replace: boolean;
      receiptTotal: number | null;
      servicePct: number | null;
      taxPct: number | null;
      discounts: Discount[];
    }
  | { type: "load"; bill: Bill }
  | { type: "reset" };

export function newId(): string {
  try {
    return crypto.randomUUID().slice(0, 8);
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}

export const defaultName = (n: number) => `Person ${n}`;

function makePeople(existing: Person[], count: number): Person[] {
  if (count <= existing.length) return existing.slice(0, count);
  const taken = new Set(existing.map((p) => p.name));
  const out = [...existing];
  for (let n = 1; out.length < count; n++) {
    const name = defaultName(n);
    if (!taken.has(name)) out.push({ id: newId(), name });
  }
  return out;
}

export function emptyItem(id: string): Item {
  return { id, name: "", price: 0, qty: 1, eaters: [], discount: null };
}

export function initialBill(): Bill {
  return {
    currency: "MMK",
    people: makePeople([], 4),
    items: [emptyItem(newId())],
    billDiscounts: [],
    servicePct: 0,
    taxPct: 0,
    receiptTotal: null,
  };
}

const clampCount = (n: number) => Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, Math.round(n) || MIN_PEOPLE));

function mapItem(bill: Bill, id: string, fn: (it: Item) => Item): Bill {
  return { ...bill, items: bill.items.map((it) => (it.id === id ? fn(it) : it)) };
}

/** Drop eaters who are no longer in the people list. */
function prune(bill: Bill): Bill {
  const ids = new Set(bill.people.map((p) => p.id));
  return { ...bill, items: bill.items.map((it) => ({ ...it, eaters: it.eaters.filter((e) => ids.has(e)) })) };
}

export function reducer(bill: Bill, a: Action): Bill {
  switch (a.type) {
    case "setCount":
      return prune({ ...bill, people: makePeople(bill.people, clampCount(a.count)) });
    case "renamePerson":
      return { ...bill, people: bill.people.map((p) => (p.id === a.id ? { ...p, name: a.name.slice(0, 40) } : p)) };
    case "removePerson":
      if (bill.people.length <= MIN_PEOPLE) return bill;
      return prune({ ...bill, people: bill.people.filter((p) => p.id !== a.id) });
    case "addItem":
      return { ...bill, items: [...bill.items, emptyItem(a.id)] };
    case "updateItem":
      return mapItem(bill, a.id, (it) => ({ ...it, ...a.patch }));
    case "removeItem":
      return { ...bill, items: bill.items.filter((it) => it.id !== a.id) };
    case "toggleEater":
      return mapItem(bill, a.itemId, (it) => {
        const has = it.eaters.includes(a.personId);
        // Keep eaters in people order so shares and leftovers are stable.
        const next = has ? it.eaters.filter((e) => e !== a.personId) : [...it.eaters, a.personId];
        const order = new Map(bill.people.map((p, i) => [p.id, i]));
        return { ...it, eaters: next.sort((x, y) => (order.get(x) ?? 0) - (order.get(y) ?? 0)) };
      });
    case "setEaters":
      return mapItem(bill, a.itemId, (it) => ({ ...it, eaters: a.eaters }));
    case "assignUnassignedToAll": {
      const all = bill.people.map((p) => p.id);
      return { ...bill, items: bill.items.map((it) => (it.eaters.length === 0 && it.price > 0 ? { ...it, eaters: all } : it)) };
    }
    case "setItemDiscount":
      return mapItem(bill, a.id, (it) => ({ ...it, discount: a.discount }));
    case "addBillDiscount":
      return { ...bill, billDiscounts: [...bill.billDiscounts, { id: a.id, label: "", kind: "percent", value: 0 }] };
    case "updateBillDiscount":
      return { ...bill, billDiscounts: bill.billDiscounts.map((d) => (d.id === a.id ? { ...d, ...a.patch } : d)) };
    case "removeBillDiscount":
      return { ...bill, billDiscounts: bill.billDiscounts.filter((d) => d.id !== a.id) };
    case "setCurrency": {
      // Keep the typed numbers the same when switching (12,500 Ks → $12,500.00).
      const f = 10 ** (currencyOf(a.currency).decimals - currencyOf(bill.currency).decimals);
      const conv = (v: number) => Math.round(v * f);
      const convD = <D extends Discount>(d: D): D => (d.kind === "amount" ? { ...d, value: conv(d.value) } : d);
      return {
        ...bill,
        currency: a.currency,
        items: bill.items.map((it) => ({ ...it, price: conv(it.price), discount: it.discount && convD(it.discount) })),
        billDiscounts: bill.billDiscounts.map(convD),
        receiptTotal: bill.receiptTotal === null ? null : conv(bill.receiptTotal),
      };
    }
    case "setPct":
      return { ...bill, [a.field]: a.value };
    case "setReceiptTotal":
      return { ...bill, receiptTotal: a.value };
    case "importItems": {
      const isBlank = (it: Item) => !it.name.trim() && it.price === 0;
      const kept = a.replace ? [] : bill.items.filter((it) => !isBlank(it));
      const added = a.items.map((it) => ({ ...emptyItem(newId()), name: it.name.slice(0, 60), qty: it.qty, price: it.price }));
      return {
        ...bill,
        items: kept.length + added.length ? [...kept, ...added] : [emptyItem(newId())],
        receiptTotal: a.receiptTotal ?? bill.receiptTotal,
        servicePct: a.servicePct ?? bill.servicePct,
        taxPct: a.taxPct ?? bill.taxPct,
        billDiscounts: [
          ...(a.replace ? [] : bill.billDiscounts),
          ...a.discounts.map((d) => ({ ...d, id: newId(), label: "From slip" })),
        ],
      };
    }
    case "load":
      return prune(a.bill);
    case "reset":
      return initialBill();
  }
}
