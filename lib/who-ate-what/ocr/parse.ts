import { currencyOf } from "../money";
import type { CurrencyCode } from "../types";

// Turns OCR text from a bill slip into dish lines. Tuned for English,
// Vietnamese and Myanmar slips. OCR is imperfect, so this guesses and the user
// confirms everything on a review screen. It never needs to be perfect, just
// close enough that fixing it is quicker than typing.

export type ScanKind = "item" | "subtotal" | "total" | "tax" | "service" | "discount" | "other";

export type ScanLine = {
  raw: string;
  name: string;
  qty: number;
  /** Unit price, minor units. */
  price: number;
  /** Line amount as printed (qty × price when both were found), minor units. */
  amount: number;
  kind: ScanKind;
  /** A percentage on the line ("VAT 8%"), basis points. */
  pct: number | null;
};

export type ScanResult = {
  lines: ScanLine[];
  subtotal: number | null;
  total: number | null;
  currency: CurrencyCode;
  /** The OCR text as read, for the "what the reader saw" view. */
  text: string;
};

/** Lower-case, no accents, so "Tổng Cộng" and OCR's "Tong Cong" match alike. */
export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// Keyword lists are matched against folded text. Order matters: the first match wins.
const KINDS: [Exclude<ScanKind, "item">, RegExp][] = [
  ["subtotal", /sub\s*-?\s*total|tam tinh|tong tien hang|cong tien hang|tong tien mon|ပေါင်းခြင်း|စုစုပေါင်း\s*\(?ခွဲ/],
  ["other", /tien kh|khach dua|tien thu|tra lai|tien mat|cash|change|card|visa|master|chuyen khoan|transfer|kpay|wave|qr|ငွေပေး|ပြန်အမ်း/],
  ["discount", /giam gia|chiet khau|khuyen mai|\bkm\b|discount|voucher|promo|\bdisc\b|လျှော့/],
  ["service", /phi phuc vu|phi dich vu|service|\bsvc\b|\bsc\b|ဝန်ဆောင်/],
  ["tax", /\bvat\b|thue|gtgt|\btax\b|\bgst\b|အခွန်/],
  ["total", /t[o0]ng c[o0]n|tong thanh toan|thanh toan|tong tien|tong so tien|phai tra|total|amount due|balance due|grand|net amount|စုစုပေါင်း|ကျသင့်ငွေ|ပေါင်း/],
];

// Lines that are never dishes even if they carry a number.
const NOISE =
  /\b(ban|table|hoa don|invoice|bill no|receipt|so hd|so ct|ma hd|ngay|date|gio|time|thu ngan|cashier|nhan vien|staff|server|waiter|tel|dt|ph|hp|mobile|zalo|hotline|phone|wifi|pass|mst|tax code|dia chi|address|khach|guest|pax|cover|in luc|printed|order no|ma don)\b|cam on|thank|www\.|\.com|@|ဘောက်ချာ|ရက်စွဲ|ဖုန်း|စားပွဲ/;

// Column headers like "STT  Tên món  SL  Đơn giá  Thành tiền".
const HEADER = /\b(stt|ten mon|ten hang|mat hang|so luong|don gia|thanh tien|sl|dg|tt|qty|item|description|price|amount)\b/;

/** OCR often reads 0 as O and 1 as l inside numbers. */
function fixDigits(token: string): string {
  if (!/\d/.test(token) || !/^[\dOoIl|.,]+$/.test(token)) return token;
  return token.replace(/[Oo]/g, "0").replace(/[Il|]/g, "1");
}

/** "45.000" / "45,000" / "12.50" → minor units, or null. */
export function parseNumber(token: string, decimals: number): number | null {
  const t = token.replace(/[^\d.,]/g, "");
  if (!/\d/.test(t)) return null;
  const m = t.match(/^(.*?)[.,](\d+)$/);
  let whole: string;
  let frac = "";
  if (!m) whole = t;
  else if (m[2].length === 3 && /^\d{1,3}([.,]\d{3})*$/.test(m[1])) whole = t; // thousands
  else if (m[2].length <= 2) {
    whole = m[1];
    frac = m[2];
  } else return null;
  const digits = whole.replace(/[.,]/g, "");
  if (!digits || digits.length > 12) return null;
  const f = (frac + "00").slice(0, decimals);
  const value = Number(digits) * 10 ** decimals + (decimals ? Number(f) : 0);
  return Number.isFinite(value) ? value : null;
}

/** `value` is NaN for tokens that look numeric but can't be read ("55.0000"). */
type Num = { value: number; index: number; plain: boolean; raw: string };

/** Numeric tokens on a line that could be quantities or money. */
function numbersIn(tokens: string[], decimals: number): Num[] {
  const out: Num[] = [];
  tokens.forEach((tok, index) => {
    const t = fixDigits(tok.replace(/^[-–x×*@(:$฿€₫]+|[)đ₫$฿€:.,]+$|(ks|vnd|vnđ|d)$/gi, ""));
    if (!/^\d[\d.,]*$/.test(t)) return;
    if (/\d[/:-]\d/.test(tok)) return; // dates, times
    const digits = t.replace(/[.,]/g, "");
    if (digits.length >= 9 && !/[.,]/.test(t)) return; // phone numbers, ids
    if (/^0\d{3,}/.test(digits) && !/[.,]/.test(t)) return; // "000123" invoice numbers
    const value = parseNumber(t, decimals);
    out.push({ value: value ?? NaN, index, plain: /^\d{1,3}$/.test(t), raw: t });
  });
  return out;
}

function pctIn(line: string): number | null {
  const m = line.match(/(\d{1,2}(?:[.,]\d{1,2})?)\s*%/);
  return m ? Math.round(Number(m[1].replace(",", ".")) * 100) : null;
}

export function guessCurrency(text: string, fallback: CurrencyCode): CurrencyCode {
  const f = fold(text);
  if (/[₫]|\bvnd\b|\bvnđ\b|tong cong|thanh toan|tam tinh|\bd\b\s*$/m.test(f) || /\d\.\d{3}\s*(đ|d)\b/i.test(text)) return "VND";
  if (/\bks\b|kyat|ကျပ်|[က-႟]/.test(f)) return "MMK";
  if (/฿|\bthb\b|baht/.test(f)) return "THB";
  if (/s\$|\bsgd\b/.test(f)) return "SGD";
  if (/€|\beur\b/.test(f)) return "EUR";
  if (/\$|\busd\b/.test(f)) return "USD";
  return fallback;
}

/** One line of text → a guess at what it is. Null when it carries no amount. */
function parseLine(raw: string, decimals: number): (ScanLine & { nameOnly?: boolean }) | null {
  const line = raw.replace(/[|_]{2,}/g, " ").replace(/\s+/g, " ").trim();
  if (!line) return null;
  const f = fold(line);
  const tokens = line.split(" ");
  const nums = numbersIn(tokens, decimals);
  const pct = pctIn(line);
  const kind: ScanKind = KINDS.find(([, re]) => re.test(f))?.[0] ?? "item";
  const hasLetters = /[\p{L}]{2,}/u.test(line);

  if (nums.length === 0) {
    // A dish name printed on its own line, with numbers on the next one.
    if (kind === "item" && hasLetters && !NOISE.test(f) && !HEADER.test(f)) {
      return { raw, name: line, qty: 1, price: 0, amount: 0, kind, pct, nameOnly: true };
    }
    return null;
  }

  // Money sits at the end of the line (maybe followed by a currency word).
  const lastTok = nums[nums.length - 1].index;
  const tail = tokens.slice(lastTok + 1).join(" ");
  if (tail && !/^(đ|₫|d|vnd|vnđ|ks|kyat|ကျပ်|usd|\$)$/i.test(tail)) {
    return kind === "item" && hasLetters && !NOISE.test(f) && !HEADER.test(f) && !/^\d/.test(line)
      ? { raw, name: line, qty: 1, price: 0, amount: 0, kind, pct, nameOnly: true }
      : null;
  }
  let start = nums.length - 1;
  while (start > 0 && nums[start - 1].index === nums[start].index - 1) start--;
  const nameEnd = nums[start].index;
  const trailing = nums
    .slice(start)
    .filter((n) => !Number.isNaN(n.value) && !(pct !== null && /%/.test(tokens[n.index])));
  if (trailing.length === 0) return null;
  const amount = trailing[trailing.length - 1].value;
  if (amount <= 0) return null;

  let qty = 1;
  let price = amount;
  const unit = 10 ** decimals; // a plain "2" token parsed as money is 2 × unit
  const asQty = (n: Num) => (n.plain ? n.value / unit : null);

  // "x2" / "2x" / "SL: 2" anywhere on the line.
  const xm = f.match(/(?:^|\s)(?:x|×|\*)\s?(\d{1,2})(?:\s|$)|(?:^|\s)(\d{1,2})\s?(?:x|×|\*)(?:\s|$)|\bsl:?\s?(\d{1,2})\b/);
  const explicitQty = xm ? Number(xm[1] ?? xm[2] ?? xm[3]) : null;

  if (trailing.length >= 3) {
    // [qty] [unit] [amount]
    const [a, b] = trailing.slice(-3);
    const q = asQty(a);
    if (q && q > 0 && q * b.value === amount) {
      qty = q;
      price = b.value;
    } else if (amount % b.value === 0 && amount / b.value <= 99) {
      qty = amount / b.value;
      price = b.value;
    }
  } else if (trailing.length === 2) {
    const [a] = trailing;
    const q = asQty(a);
    if (q && q > 0 && q <= 99 && amount % q === 0) {
      // [qty] [amount]
      qty = q;
      price = amount / q;
    } else if (a.value > 0 && amount % a.value === 0 && amount / a.value <= 99) {
      // [unit] [amount]
      qty = amount / a.value;
      price = a.value;
    }
  } else if (explicitQty && explicitQty > 1 && amount % explicitQty === 0) {
    qty = explicitQty;
    price = amount / qty;
  } else if (nums[0].index === 0 && nums[0] !== trailing[0] && !Number.isNaN(nums[0].value)) {
    // "2 Cheeseburger 25.00": a leading count. (On a numbered list this is the
    // row number instead, which only changes qty; the line amount stays right.)
    const q = asQty(nums[0]);
    if (q && q > 1 && q <= 20 && amount % q === 0) {
      qty = q;
      price = amount / q;
    }
  }

  // Name: the words before the numbers, minus a leading row number ("1.", "01").
  const name = tokens
    .slice(0, nameEnd)
    .join(" ")
    .replace(/^\d{1,2}[.)]?\s+/, "")
    .replace(/(?:^|\s)(?:x|×|\*)\s?\d{1,2}$|\s\d{1,2}\s?(?:x|×|\*)$/i, "")
    .replace(/[:.\-–—]+$/, "")
    .trim();

  // Phone numbers split into groups: "0901 234 567", "09 123 456 789".
  const phone = /(^|\s)0\d{1,3}([\s.-]\d{2,4}){2,}(\s|$)/.test(line);
  const isNoise = kind === "item" && (NOISE.test(f) || HEADER.test(f) || phone || !hasLetters);
  return { raw, name, qty, price, amount, kind: isNoise ? "other" : kind, pct };
}

export function parseReceipt(text: string, fallback: CurrencyCode): ScanResult {
  const currency = guessCurrency(text, fallback);
  const { decimals } = currencyOf(currency);
  const parsed = text.split(/\r?\n/).map((l) => parseLine(l, decimals));

  const lines: ScanLine[] = [];
  let pendingName: string | null = null;
  let afterTotal = false;

  for (const p of parsed) {
    if (!p) continue;
    if (p.nameOnly) {
      // Keep it until we see the numbers; join wrapped names.
      pendingName = pendingName && !afterTotal ? `${pendingName} ${p.name}` : p.name;
      continue;
    }
    let line: ScanLine = p;
    // "2 x 45.000   90.000" under a name line → one dish.
    const f = fold(line.raw);
    if (
      pendingName && (line.kind === "item" || line.kind === "other") && !/[\p{L}]{3,}/u.test(line.name) &&
      !NOISE.test(f) && !HEADER.test(f)
    ) {
      line = { ...line, name: pendingName, kind: "item", raw: `${pendingName} ${line.raw}` };
    }
    pendingName = null;
    // After the total it's payment details, change, thank-you notes.
    if (afterTotal && line.kind === "item") line = { ...line, kind: "other" };
    if (line.kind === "total") afterTotal = true;
    lines.push(line);
  }

  // "Total 18,000 … Amount due 18,900": the first of several totals is the subtotal.
  const totals = lines.filter((l) => l.kind === "total");
  if (totals.length > 1 && !lines.some((l) => l.kind === "subtotal")) totals[0].kind = "subtotal";

  const last = (k: ScanKind) => [...lines].reverse().find((l) => l.kind === k)?.amount ?? null;
  return { lines, subtotal: last("subtotal"), total: last("total"), currency, text };
}
