import { currencyOf } from "../money";
import type { CurrencyCode } from "../types";

// Turns OCR'd bill-slip lines into dishes. Tuned on real Vietnamese, English
// and Myanmar slips photographed at the table. OCR is imperfect, so this
// guesses, cross-checks (qty × unit price = line amount, dishes = subtotal) and
// flags what it isn't sure about; the user confirms on a review screen.

export type ScanKind = "item" | "subtotal" | "total" | "tax" | "service" | "discount" | "other";

export type ScanLine = {
  /** The OCR text the line was built from (several lines for a wrapped name). */
  raw: string;
  name: string;
  /** For bilingual names, "Rau muống xào (Stir-fried morning glory)": the parts. */
  nameLocal: string;
  nameAlt: string | null;
  qty: number;
  /** Unit price, minor units. */
  price: number;
  /** Line amount (qty × price), minor units. */
  amount: number;
  kind: ScanKind;
  /** A percentage on the line ("VAT 8%"), basis points. */
  pct: number | null;
  /** The numbers on the line didn't agree with each other: check it. */
  uncertain: boolean;
  /** Set when the amount was worked out from the slip's subtotal. */
  fixedFromTotal: boolean;
  /** Vertical extent in the image, for showing a snippet of the line. */
  top: number;
  bottom: number;
};

export type ScanResult = {
  lines: ScanLine[];
  subtotal: number | null;
  total: number | null;
  currency: CurrencyCode;
  /** The OCR text as read, for the "what the reader saw" view. */
  text: string;
};

/** One line of OCR output with its position in the image (and its words, when known). */
export type OcrLine = {
  text: string;
  top: number;
  bottom: number;
  /** Tesseract's confidence, 0–100, when known. */
  confidence?: number;
  words?: { text: string; x0: number; x1: number }[];
};

/**
 * Put lines in reading order and join lines that sit side by side: on a
 * curled slip Tesseract can split one printed row into two overlapping lines
 * ("SAIGON 1 69" + "DAKLAK XANH 000 69.000").
 */
export function normalizeLines(lines: OcrLine[]): OcrLine[] {
  const sorted = lines.filter((l) => l.text.trim()).sort((a, b) => a.top - b.top);
  const out: OcrLine[] = [];
  let lastMerged = false;
  const span = (l: OcrLine) => [Math.min(...l.words!.map((w) => w.x0)), Math.max(...l.words!.map((w) => w.x1))];
  for (const l of sorted) {
    const prev = out[out.length - 1];
    if (prev && prev.words?.length && l.words?.length && !lastMerged) {
      const overlap = Math.min(prev.bottom, l.bottom) - Math.max(prev.top, l.top);
      const smaller = Math.min(prev.bottom - prev.top, l.bottom - l.top);
      // Side by side: overlapping rows, but (almost) no shared columns.
      const [a0, a1] = span(prev);
      const [b0, b1] = span(l);
      const xOverlap = Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
      const sideBySide = xOverlap <= 0.15 * Math.min(a1 - a0, b1 - b0);
      if (smaller > 0 && overlap / smaller >= 0.5 && sideBySide) {
        lastMerged = true;
        const words = [...prev.words, ...l.words].sort((a, b) => a.x0 - b.x0);
        out[out.length - 1] = {
          text: words.map((w) => w.text).join(" "),
          top: Math.min(prev.top, l.top),
          bottom: Math.max(prev.bottom, l.bottom),
          words,
        };
        continue;
      }
    }
    lastMerged = false;
    out.push(l);
  }
  return out;
}

/** Lower-case, no accents, so "Tổng Cộng" and OCR's "Tong Cong" match alike. */
export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// Matched against folded text. Order matters: the first match wins.
const KINDS: [Exclude<ScanKind, "item">, RegExp][] = [
  ["other", /phieu tam tinh|tien kh|khach dua|tien thu|tra lai|tien mat|cash|change|card|visa|master|chuyen khoan|transfer|kpay|wave pay|qr|ငွေပေး|ပြန်အမ်း/],
  ["subtotal", /sub\s*-?\s*total|tam tinh|tien hang|cong tien hang|tong tien mon|ပေါင်းခြင်း/],
  ["discount", /giam gia|chiet khau|khuyen mai|\bkm\b|discount|voucher|promo|\bdisc\b|လျှော့/],
  ["service", /phi phuc vu|phi dich vu|service|\bsvc\b|\bsc\b|ဝန်ဆောင်/],
  ["tax", /\bvat\b|thue|gtgt|\btax\b|\bgst\b|အခွန်/],
  ["total", /t[o0]ng ?c[o0]n|thanh to[a@]n|tong ?tien|tong so tien|phai tra|phai thu|can tra|total|amount due|balance due|grand|net amount|စုစုပေါင်း|ကျသင့်ငွေ|ပေါင်း/],
];

// Lines that are never dishes even if they carry a number.
const NOISE =
  /\b(ban|table|hoa don|invoice|bill no|receipt|so hd|so ct|ma hd|ngay|date|gio|time|thu ngan|cashier|nhan vien|phuc vu|staff|server|waiter|tel|dt|ph|hp|mobile|zalo|hotline|phone|wifi|pass|mat khau|mst|tax code|dia chi|address|khach|guest|pax|cover|in luc|printed|order no|ma don|mang di|take ?away|dine in|powered|so:?)\b|sl ?khach|cam on|thank|www\.|\.com|@|ဘောက်ချာ|ရက်စွဲ|ဖုန်း|စားပွဲ/;

// Column headers ("STT  Tên món  SL  Đơn giá  Thành tiền") and section titles.
const HEADER =
  /\b(stt|ten mon|ten hang|mat hang|so luong|don gia|thanh tien|t\.?tien|sl\/tl|qty|item|description|price|amount)\b|^\W*\w?\W*(mon an|d[eo] uong|food|drinks?|beverages?|mains?|desserts?)\W*$/;

const SPLIT_TOKENS = /[\s|]+/;

/** OCR letters that are really digits, inside number-like tokens. */
function fixDigits(token: string): string {
  if (!/\d/.test(token) || !/^[\dOoIlSsBZ|.,]+$/.test(token)) return token;
  return token.replace(/[Oo]/g, "0").replace(/[Il|]/g, "1").replace(/[Ss]/g, "5").replace(/B/g, "8").replace(/Z/g, "2");
}

type Num = {
  /** Value in minor units; for small plain integers also a possible quantity. */
  value: number;
  index: number;
  /** Last token index (a number split over tokens, "59 000", spans several). */
  end: number;
  /** A small whole number with no separators: could be a quantity. */
  small: boolean;
  /** Written with proper thousands groups ("39.000"), so trustworthy as money. */
  formatted: boolean;
};

/**
 * "45.000" / "45,000" / "12.50" / "276/000" → minor units. For currencies
 * without decimals (VND, MMK) a ".00" ending is a cut-off thousands group:
 * a slip printed "78.000" right at the paper's edge reads "78.00".
 */
export function parseNumber(token: string, decimals: number): { value: number; formatted: boolean } | null {
  const t = token.replace(/\//g, ",");
  if (!/^\d[\d.,]*$/.test(t)) return null;
  const groups = t.split(/[.,]/);
  const last = groups[groups.length - 1];
  if (groups.length === 1) {
    if (t.length > 12) return null;
    return { value: Number(t) * 10 ** decimals, formatted: false };
  }
  const head = groups.slice(0, -1);
  const headOk = /^\d{1,3}$/.test(head[0]) && head.slice(1).every((g) => /^\d{3}$/.test(g));
  if (last.length === 3 && headOk) {
    return { value: Number(groups.join("")) * 10 ** decimals, formatted: true };
  }
  if (last.length <= 2 && last.length > 0) {
    if (decimals === 0 && headOk) {
      // Cut-off thousands: "78.00" → 78,000; "1.292.00" → 1,292,000.
      return { value: Number(head.join("")) * 1000, formatted: false };
    }
    if (decimals > 0 && /^\d+$/.test(head.join(""))) {
      const frac = (last + "00").slice(0, decimals);
      return { value: Number(head.join("")) * 10 ** decimals + Number(frac), formatted: true };
    }
  }
  return null;
}

/** Number-like tokens on a line, with "59 000" and "69 00" style splits joined. */
function numbersIn(tokens: string[], decimals: number): Num[] {
  const clean = tokens.map((tok) =>
    fixDigits(tok.replace(/^[-–(:$฿€₫]+|[)đ₫$฿€:;'"`]+$|(ks|vnd|vnđ|d|c|e)$/gi, "").replace(/[.,]+$/, "")),
  );
  const out: Num[] = [];
  for (let i = 0; i < clean.length; i++) {
    const t = clean[i];
    if (!/^\d[\d.,/]*$/.test(t)) continue;
    if (/\d[:-]\d/.test(tokens[i]) || /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(t)) continue; // times, dates
    const digits = t.replace(/[.,/]/g, "");
    if (digits.length >= 9 && !/[.,]/.test(t)) continue; // phone numbers, ids
    if (/^0\d{2,}/.test(digits) && !/[.,]/.test(t)) continue; // "000123", "0901"
    let merged = t;
    let j = i;
    // "59 000" → 59000; "1 292 000" → 1292000.
    while (/^\d{1,3}$/.test(merged.split(/[.,]/).pop()!) && j + 1 < clean.length && /^\d{3}$/.test(clean[j + 1]) && /^\d{1,3}([.,]\d{3})*$/.test(merged)) {
      merged = `${merged},${clean[j + 1]}`;
      j++;
    }
    // "69 00" at the end of the line: a cut-off "69.000".
    if (decimals === 0 && j === i && j + 1 === clean.length - 1 && /^0{1,2}$/.test(clean[j + 1]) && /^\d{1,3}$/.test(t)) {
      merged = `${t}.00`;
      j++;
    }
    const parsed = parseNumber(merged, decimals);
    out.push({
      value: parsed?.value ?? NaN,
      index: i,
      end: j,
      small: !!parsed && /^\d{1,2}$/.test(merged),
      formatted: parsed?.formatted ?? false,
    });
    i = j;
  }
  return out;
}

function pctIn(line: string): number | null {
  const m = line.match(/(\d{1,2}(?:[.,]\d{1,2})?)\s*%/);
  return m ? Math.round(Number(m[1].replace(",", ".")) * 100) : null;
}

export function guessCurrency(text: string, fallback: CurrencyCode): CurrencyCode {
  const f = fold(text);
  if (/[₫]|\bvnd\b|tong cong|thanh toan|tam tinh|tien hang|\d[.,]\d{3}\s*d\b/.test(f) || /\d\.\d{3}\s*[đd]\b/i.test(text)) return "VND";
  if (/\bks\b|kyat|ကျပ်|[က-႟]/.test(f)) return "MMK";
  if (/฿|\bthb\b|baht/.test(f)) return "THB";
  if (/s\$|\bsgd\b/.test(f)) return "SGD";
  if (/€|\beur\b/.test(f)) return "EUR";
  if (/\$|\busd\b/.test(f)) return "USD";
  return fallback;
}

type Parsed = Omit<ScanLine, "nameLocal" | "nameAlt" | "fixedFromTotal"> & {
  nameOnly: boolean;
  /** qty came from a number at the start of the line (could be a row number). */
  leadingQty?: boolean;
  /** The row number at the start of the line, if any. */
  rowNo?: number;
};

/** Works out qty, unit price and amount from the numbers at the end of a line. */
function resolveNumbers(
  trailing: Num[],
  line: string,
  decimals: number,
): { qty: number; price: number; amount: number; uncertain: boolean; leadingQty?: boolean } {
  const unit = 10 ** decimals;
  const last = trailing[trailing.length - 1];
  let amount = last.value;
  const before = trailing.slice(0, -1);
  // Quantity: a small whole number (next to an "x" if there is one).
  const qtyNum = [...before].reverse().find((n) => n.small && n.value / unit >= 1 && n.value / unit <= 99);
  const qty = qtyNum ? qtyNum.value / unit : null;
  // Unit price: a money-looking number that isn't the quantity.
  const unitNum = [...before].reverse().find((n) => n !== qtyNum && !n.small && n.value > 0);
  let price = unitNum?.value ?? null;

  const agree = (a: number, b: number) => a === b;
  const truncatedMatch = (expected: number) => [10, 100, 1000].some((k) => amount * k === expected);

  if (qty && price !== null) {
    const expected = qty * price;
    if (agree(expected, amount)) return { qty, price, amount, uncertain: false };
    if (truncatedMatch(expected)) return { qty, price, amount: expected, uncertain: false };
    // Disagreement: trust whichever number is cleanly formatted, the amount if both are.
    if (unitNum!.formatted && !last.formatted) return { qty, price, amount: expected, uncertain: true };
    if (amount % qty === 0) return { qty, price: amount / qty, amount, uncertain: true };
    return { qty: 1, price: amount, amount, uncertain: true };
  }
  if (price !== null) {
    if (amount % price === 0 && amount / price >= 1 && amount / price <= 99) {
      return { qty: amount / price, price, amount, uncertain: false };
    }
    if (truncatedMatch(price)) return { qty: 1, price, amount: price, uncertain: false };
    return { qty: 1, price: amount, amount, uncertain: true };
  }
  if (qty) {
    if (amount % qty === 0) return { qty, price: amount / qty, amount, uncertain: false };
    return { qty: 1, price: amount, amount, uncertain: true };
  }
  // A lone amount; "2 Cheeseburger 25.00" or "Fries x2 9.00" carry the count in the text.
  const f = fold(line);
  const xm = f.match(/(?:^|\s)(?:x|×|\*)\s?(\d{1,2})(?:\s|$)|(?:^|\s)(\d{1,2})\s?(?:x|×|\*)(?:\s|$)|^(\d{1,2})\s+\p{L}/u);
  const q = xm ? Number(xm[1] ?? xm[2] ?? xm[3]) : 1;
  if (q > 1 && amount % q === 0) return { qty: q, price: amount / q, amount, uncertain: false, leadingQty: !!xm?.[3] };
  price = amount;
  return { qty: 1, price, amount, uncertain: false };
}

function cleanName(s: string): string {
  return s
    .replace(/[|_~=*•»«]+/g, " ")
    // Junk tokens: long digit runs, digit-letter mixes like "G4", stray symbols.
    .split(/\s+/)
    .filter((t) => !/\d{4,}|^[^\p{L}\d(]+$|^\p{L}\d|^\d+\p{L}{1,2}\d/u.test(t) || /^\d+[a-z]{1,3}$/i.test(t))
    .join(" ")
    // A stray letter before a row number ("ì 7 sản").
    .replace(/^\s*\p{L}\s+(?=\d{1,2}\s)/u, "")
    .replace(/^\s*\d{1,2}[.)]?\s+(?=\S)/, "")
    .replace(/(^|\s)\d{3,}(?=\s|$)/g, " ")
    .replace(/^[^\p{L}\d(]{1,4}(?=[\p{L}(])/u, "")
    .replace(/\s(?:x|×)\s?\d{1,2}$|\s\d{1,2}\s?(?:x|×)$/i, "")
    .replace(/[\s:.\-–—,'"`]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLine(src: OcrLine, decimals: number, minAmount: number): Parsed | null {
  // Burmese digits (၀–၉) → 0–9.
  const line = src.text
    .replace(/[\u1040-\u1049]/g, (d) => String(d.charCodeAt(0) - 0x1040))
    .replace(/\s+/g, " ")
    .trim();
  if (!line) return null;
  const f = fold(line);
  const tokens = line.split(SPLIT_TOKENS).filter(Boolean);
  const nums = numbersIn(tokens, decimals);
  const pct = pctIn(line);
  const kind: ScanKind = KINDS.find(([, re]) => re.test(f))?.[0] ?? "item";
  const letters = (line.match(/\p{L}/gu) ?? []).length;
  const noisy = NOISE.test(f) || HEADER.test(f);
  const base = { raw: src.text, top: src.top, bottom: src.bottom, pct };
  // Text without a price: part of a dish name, or (headers, staff, address)
  // a barrier that names can't be joined across.
  // Shadows, the QR code or the table edge read as junk: few letters, low confidence.
  const junk = letters < line.replace(/\s/g, "").length * 0.55 || (src.confidence !== undefined && src.confidence < 45);
  const nameOnly = (): Parsed | null =>
    letters < 2 || (junk && kind === "item" && !noisy)
      ? null
      : kind === "item" && !noisy
        ? { ...base, name: cleanName(line), qty: 1, price: 0, amount: 0, kind, uncertain: false, nameOnly: true }
        : { ...base, name: line, qty: 1, price: 0, amount: 0, kind: "other", uncertain: false, nameOnly: false };

  // Money sits at the end of the line (maybe followed by a currency mark).
  const valid = nums.filter((n) => !Number.isNaN(n.value));
  if (valid.length === 0) return nameOnly();
  const lastIdx = nums[nums.length - 1].end;
  const tail = tokens.slice(lastIdx + 1).join(" ");
  if (tail && !/^[đd₫c]?$|^(vnd|vnđ|ks|kyat|ကျပ်|usd|\$)$/i.test(tail)) return nameOnly();

  // The run of numbers at the end ("2 39.000 78.000", "135,000 x 1 135,000").
  let start = nums.length - 1;
  const isConnector = (t: string) => /^(x|×|\*|@)$/i.test(t);
  while (start > 0) {
    const gap = tokens.slice(nums[start - 1].end + 1, nums[start].index);
    if (gap.every(isConnector)) start--;
    else break;
  }
  const nameEnd = nums[start].index;
  const trailing = nums.slice(start).filter((n) => !Number.isNaN(n.value) && !(pct !== null && /%/.test(tokens[n.index])));
  if (!trailing.length || trailing[trailing.length - 1].value <= 0) return nameOnly();

  // Just a small number ("nấm chua cay   2"): the count, with the price lost.
  if (trailing.length === 1 && trailing[0].small && decimals === 0) {
    const qty = trailing[0].value;
    const name = cleanName(tokens.slice(0, nameEnd).join(" "));
    if (kind === "item" && !noisy && name) {
      return { ...base, name, qty, price: 0, amount: 0, kind, uncertain: true, nameOnly: false };
    }
  }
  const resolved = resolveNumbers(trailing, line, decimals);
  const name = cleanName(tokens.slice(0, nameEnd).join(" "));
  const rowMatch = line.match(/^\W{0,2}(\d{1,2})[.)]?\s+\S/);
  const rowNo = rowMatch && rowMatch.index !== undefined && nameEnd > 1 ? Number(rowMatch[1]) : undefined;
  // "SAIGON  1  69": no dong price is 69, the rest of the number was lost.
  if (resolved.amount < minAmount && kind === "item" && !noisy && name) {
    return { ...base, name, qty: resolved.qty, price: 0, amount: 0, kind, uncertain: true, nameOnly: false, rowNo };
  }

  // Phone numbers split into groups: "0901 234 567", "09 123 456 789".
  const phoneMatch = line.match(/(?:^|\s)(0[1-9]\d{0,3}(?:[\s.-]\d{2,4}){2,})(?:\s|$)/);
  const phone = !!phoneMatch && phoneMatch[1].replace(/\D/g, "").length >= 9;
  // A long number with no separators that isn't a round price is an id ("T86513").
  const idLike = decimals === 0 && !trailing.some((n) => n.formatted) && resolved.amount % 100 !== 0 && resolved.amount > 9999;
  const isOther = kind === "item" && (noisy || phone || idLike);
  return { ...base, name, ...resolved, kind: isOther ? "other" : kind, nameOnly: false, rowNo };
}

/** "Rau muống xào (Stir-fried morning glory)" → local part and translation. */
function splitBilingual(name: string): { local: string; alt: string | null } {
  const m = name.match(/^(.{3,}?)\s*\((.{6,})\)?\s*$/);
  if (!m || !/\p{L}{3}/u.test(m[2])) return { local: name, alt: null };
  return { local: m[1].trim(), alt: m[2].replace(/\)$/, "").trim() };
}

/**
 * Fold in a second, digits-only OCR pass: it reads prices more reliably. Where
 * the main pass has a dish row with no usable price, take the numbers read at
 * the same height; where it missed a price line entirely, add it (it picks up
 * its name from the lines around it).
 */
function mergeDigitPass(main: OcrLine[], digits: OcrLine[], decimals: number, minAmount: number): OcrLine[] {
  const out = [...main];
  for (const d of digits) {
    if (!d.words?.length) continue;
    const overlaps = out.filter((m) => {
      const ov = Math.min(m.bottom, d.bottom) - Math.max(m.top, d.top);
      return ov > 0.4 * Math.min(m.bottom - m.top, d.bottom - d.top);
    });
    const digitParse = parseLine(d, decimals, minAmount);
    if (!digitParse || digitParse.nameOnly || digitParse.kind === "other" || digitParse.amount < minAmount) continue;
    if (overlaps.length === 0) {
      out.push({ ...d, text: d.text.trim() });
      continue;
    }
    const parsedOverlaps = overlaps.map((m) => ({ m, mp: parseLine(m, decimals, minAmount) }));
    // Already read properly by the main pass (on this line or the one beside it): nothing to add.
    if (parsedOverlaps.some(({ mp }) => mp && !mp.nameOnly && mp.amount > 0 && (!mp.uncertain || mp.amount === digitParse.amount))) continue;
    for (const { m, mp } of parsedOverlaps) {
      if (!mp || mp.kind !== "item") continue;
      if (mp.uncertain && digitParse.uncertain && mp.amount > 0) continue;
      // Keep the main pass's words (the name), swap in the digit pass's numbers.
      const letterWords = (m.words ?? []).filter((w) => /\p{L}{2}/u.test(w.text));
      const nameEnd = letterWords.length ? Math.max(...letterWords.map((w) => w.x1)) : -Infinity;
      const tail = d.words.filter((w) => w.x0 > nameEnd).map((w) => w.text);
      if (!tail.some((t) => /\d{2,}/.test(t))) continue;
      const nameText = m.words?.length ? letterWords.map((w) => w.text).join(" ") : m.text.replace(/[\d\s.,x]+$/, "");
      out[out.indexOf(m)] = { ...m, text: `${nameText} ${tail.join(" ")}` };
      break;
    }
  }
  return out;
}

export function parseReceipt(input: string | OcrLine[], fallback: CurrencyCode, digitLines?: OcrLine[]): ScanResult {
  const text = typeof input === "string" ? input : input.map((l) => l.text).join("\n");
  const currency = guessCurrency(text, fallback);
  const { decimals } = currencyOf(currency);
  // Smallest believable line amount: nothing on a menu costs 69 dong.
  const minAmount = currency === "VND" ? 1000 : decimals === 0 ? 50 : 1;
  const ocr: OcrLine[] =
    typeof input === "string"
      ? input.split(/\r?\n/).map((text, i) => ({ text, top: i * 10, bottom: i * 10 + 8 }))
      : normalizeLines(digitLines ? mergeDigitPass(normalizeLines(input), digitLines, decimals, minAmount) : input);
  let parsed = ocr.map((l) => parseLine(l, decimals, minAmount)).filter((p): p is Parsed => p !== null);

  // Numbered rows (1, 2, 3 … on the left): those leading numbers are row
  // numbers, not quantities.
  const numbered = parsed.filter((p) => p.kind === "item" && p.rowNo !== undefined);
  let ascending = 0;
  for (let i = 1; i < numbered.length; i++) if (numbered[i].rowNo! > numbered[i - 1].rowNo!) ascending++;
  if (numbered.length >= 3 && ascending >= (numbered.length - 1) * 0.6) {
    for (const p of numbered) {
      if (p.leadingQty) Object.assign(p, { qty: 1, price: p.amount, leadingQty: false });
    }
  }

  // A row whose price got cut off, directly followed by a line with a price
  // and no count of its own: one row split in two by a curl in the paper.
  const midY = (p: Parsed) => (p.top + p.bottom) / 2;
  // Or the same row read twice at the same height with the same amount.
  parsed = parsed.filter((p, i) => {
    const prev = parsed[i - 1];
    if (!prev || prev.kind !== "item" || prev.nameOnly || p.kind !== "item" || p.nameOnly || !p.amount) return true;
    // Only lines whose boxes really overlap: two dishes at the same price on
    // consecutive rows are common and must stay apart.
    const overlap = Math.min(prev.bottom, p.bottom) - Math.max(prev.top, p.top);
    const shared = overlap / Math.max(1, Math.min(prev.bottom - prev.top, p.bottom - p.top));
    const lost = prev.amount === 0 && shared >= 0.4;
    const twice = prev.amount === p.amount && shared >= 0.5;
    if (!lost && !twice) return true;
    prev.name = `${prev.name} ${p.name}`.trim();
    prev.raw = `${prev.raw}\n${p.raw}`;
    prev.amount = p.amount;
    prev.qty = p.amount % prev.qty === 0 ? prev.qty : 1;
    prev.price = p.amount / prev.qty;
    prev.uncertain = p.uncertain;
    prev.bottom = Math.max(prev.bottom, p.bottom);
    return false;
  });

  // After the (first) total line it's payment details, change, thank-yous.
  const firstTotal = parsed.findIndex((p) => p.kind === "total");
  parsed.forEach((p, i) => {
    if (firstTotal >= 0 && i > firstTotal && (p.kind === "item" || p.nameOnly)) {
      p.kind = "other";
      p.nameOnly = false;
    }
  });

  // Wrapped names: each name-only line joins the nearest dish line above or
  // below, within a few line heights, without crossing a subtotal/total line.
  const heights = ocr.map((l) => l.bottom - l.top).filter((h) => h > 0).sort((a, b) => a - b);
  const lineH = heights[heights.length >> 1] || 10;
  const mid = (p: Parsed) => (p.top + p.bottom) / 2;
  const dishes = parsed.filter((p) => p.kind === "item" && !p.nameOnly);
  const extra = new Map<Parsed, Parsed[]>(dishes.map((d) => [d, []]));
  const claimed = new Set<Parsed>();
  // A dish line that's only numbers ("2 x 55.000  110.000") takes the name
  // line right above it.
  for (const d of dishes) {
    if (d.name) continue;
    const above = parsed[parsed.indexOf(d) - 1];
    if (above?.nameOnly) {
      extra.get(d)!.push(above);
      claimed.add(above);
    }
  }
  for (const p of parsed) {
    if (!p.nameOnly || claimed.has(p)) continue;
    const i = parsed.indexOf(p);
    let best: Parsed | null = null;
    let bestDist = Infinity;
    for (const d of dishes) {
      const j = parsed.indexOf(d);
      const between = parsed.slice(Math.min(i, j) + 1, Math.max(i, j));
      if (between.some((b) => !b.nameOnly && b.kind !== "item")) continue;
      // A closing bracket ends a name ("… (Beef shake with garlic)"): nothing
      // after it joins the dish above, and it doesn't join the dish below.
      const closes = (x: Parsed) => /\)\W*$/.test(x.name);
      if (between.some((b) => b.nameOnly && closes(b))) continue;
      if (j > i && closes(p)) continue;
      // Prefer the line above on a tie: continuation lines ("VÀNG") follow their dish.
      const dist = Math.abs(mid(d) - mid(p)) + (j > i ? 0.01 : 0);
      if (dist < bestDist) {
        best = d;
        bestDist = dist;
      }
    }
    if (best && bestDist <= lineH * 4.5) extra.get(best)!.push(p);
  }

  const lines: ScanLine[] = [];
  for (const p of parsed) {
    if (p.nameOnly || (p.kind === "other" && p.amount === 0)) continue;
    let { name, raw, top, bottom } = p;
    const more = extra.get(p);
    if (more?.length) {
      const parts = [...more, p].sort((a, b) => mid(a) - mid(b));
      name = cleanName(parts.map((x) => cleanName(x.name)).filter(Boolean).join(" "));
      raw = parts.map((x) => x.raw).join("\n");
      top = Math.min(...parts.map((x) => x.top));
      bottom = Math.max(...parts.map((x) => x.bottom));
    }
    const { local, alt } = splitBilingual(name);
    lines.push({ ...p, name, raw, top, bottom, nameLocal: local, nameAlt: alt, fixedFromTotal: false });
  }

  // "Total 18,000 … Amount due 18,900": the first of several totals is the subtotal.
  const totals = lines.filter((l) => l.kind === "total");
  if (totals.length > 1 && !lines.some((l) => l.kind === "subtotal")) totals[0].kind = "subtotal";
  // A discount of 0 ("Chiết khấu: 0") is nothing.
  for (const l of lines) if (l.kind === "discount" && l.amount === 0 && !l.pct) l.kind = "other";

  const last = (k: ScanKind) => [...lines].reverse().find((l) => l.kind === k)?.amount ?? null;
  const subtotal = last("subtotal");
  const total = last("total") ?? subtotal;

  return { lines, subtotal, total, currency, text };
}
