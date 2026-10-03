// Who Ate What — bill state. Every amount is an integer in the currency's
// minor unit (kyat for MMK, cents for USD), so shares can always be made to
// add up to the bill exactly.

export type CurrencyCode = "MMK" | "USD" | "SGD" | "THB" | "EUR";

export type Person = { id: string; name: string };

export type DiscountKind = "percent" | "amount";

/** `value` is basis points (1000 = 10%) for percent, minor units for amount. */
export type Discount = { kind: DiscountKind; value: number };

export type Item = {
  id: string;
  name: string;
  /** Unit price, minor units. */
  price: number;
  qty: number;
  /** Ids of the people who shared this dish. */
  eaters: string[];
  discount: Discount | null;
};

export type BillDiscount = Discount & { id: string; label: string };

export type Bill = {
  currency: CurrencyCode;
  people: Person[];
  items: Item[];
  billDiscounts: BillDiscount[];
  /** Basis points, applied to the subtotal after discounts. */
  servicePct: number;
  taxPct: number;
  /** Optional total printed on the receipt, minor units, for cross-checking. */
  receiptTotal: number | null;
};

export const MIN_PEOPLE = 2;
export const MAX_PEOPLE = 50;
