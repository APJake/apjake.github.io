import { formatMoney } from "./money";
import type { SplitResult } from "./split";
import type { Bill } from "./types";

// Draws the split as a receipt-style PNG on a canvas: no dependency, and the
// output looks the same on every device. Colours mirror app/globals.css.

const C = {
  bg: "#0b0b0c",
  ink: "#f2efe9",
  ink2: "#a8a29a",
  muted: "#8b867d",
  line: "rgba(242, 239, 233, 0.12)",
  amber: "#ffb020",
  green: "#8fd19e",
};

const W = 720;
const PAD = 44;
const INNER = W - PAD * 2;

function fontVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

/** Wrap text into lines no wider than `max`. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t}…`;
}

/** Lays out (and, with a real context, paints) the receipt. Returns its height. */
function draw(ctx: CanvasRenderingContext2D, bill: Bill, r: SplitResult, paint: boolean, date: string): number {
  const display = fontVar("--font-display", "Helvetica Neue, Arial, sans-serif");
  const body = fontVar("--font-body", "Helvetica Neue, Arial, sans-serif");
  const mono = fontVar("--font-mono", "ui-monospace, monospace");
  const money = (v: number) => formatMoney(v, bill.currency);

  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") => {
    ctx.font = font;
    if (!paint) return;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
  };
  const rule = (y: number, color = C.line) => {
    if (!paint) return;
    ctx.fillStyle = color;
    ctx.fillRect(PAD, y, INNER, 1);
  };

  ctx.textBaseline = "alphabetic";
  let y = PAD + 14;

  text("WHO ATE WHAT", PAD, y, `500 13px ${mono}`, C.amber);
  text(date, W - PAD, y, `500 13px ${mono}`, C.muted, "right");
  y += 50;
  text("The split", PAD, y, `800 44px ${display}`, C.ink);
  y += 30;
  const dishCount = r.lines.length;
  text(
    `${bill.people.length} people · ${dishCount} dish${dishCount === 1 ? "" : "es"}`,
    PAD, y, `400 16px ${body}`, C.ink2,
  );
  y += 26;
  rule(y);

  // One row per person: name and total, then what they had.
  for (const p of r.people) {
    y += 38;
    ctx.font = `800 28px ${display}`;
    const totalText = money(p.total);
    const totalW = ctx.measureText(totalText).width;
    text(totalText, W - PAD, y, `800 28px ${display}`, C.ink, "right");
    ctx.font = `500 20px ${body}`;
    text(ellipsize(ctx, p.person.name, INNER - totalW - 24), PAD, y, `500 20px ${body}`, C.ink);

    ctx.font = `500 13px ${mono}`;
    const parts = p.shares.map((s) => (s.of > 1 ? `${s.name || "Dish"} 1/${s.of}` : s.name || "Dish"));
    const extras: string[] = [];
    if (p.billDiscount) extras.push(`disc −${money(p.billDiscount)}`);
    if (p.service + p.tax) extras.push(`svc+tax +${money(p.service + p.tax)}`);
    const detail = [parts.join(" · ") || "Nothing", ...extras].join(" · ");
    for (const line of wrap(ctx, detail, INNER)) {
      y += 21;
      text(line, PAD, y, `500 13px ${mono}`, C.muted);
    }
    y += 16;
    rule(y);
  }

  // Totals block.
  const row = (label: string, value: string, color = C.ink2) => {
    y += 28;
    text(label, PAD, y, `400 16px ${body}`, color);
    text(value, W - PAD, y, `500 15px ${mono}`, color, "right");
  };
  y += 8;
  if (r.itemDiscounts > 0) {
    row("Dishes", money(r.gross));
    row("Dish discounts", `−${money(r.itemDiscounts)}`, C.green);
  }
  row("Subtotal", money(r.subtotal), C.ink);
  r.billDiscounts.filter((d) => d.amount > 0).forEach((d, i) =>
    row(d.label.trim() || `Bill discount${r.billDiscounts.length > 1 ? ` ${i + 1}` : ""}`, `−${money(d.amount)}`, C.green),
  );
  if (r.service) row(`Service charge ${bill.servicePct / 100}%`, `+${money(r.service)}`);
  if (r.tax) row(`Tax ${bill.taxPct / 100}%`, `+${money(r.tax)}`);
  y += 22;
  rule(y, "rgba(242, 239, 233, 0.22)");
  y += 46;
  text("Total", PAD, y, `500 20px ${body}`, C.ink);
  text(money(r.grandTotal), W - PAD, y, `800 40px ${display}`, C.amber, "right");
  if (r.balanced) {
    y += 30;
    text(`✓ All ${r.people.length} shares add up to the total`, PAD, y, `400 14px ${body}`, C.green);
  }
  y += 40;
  text("apjake.github.io/apps/who-ate-what", PAD, y, `500 12px ${mono}`, C.muted);
  return y + PAD - 12;
}

export async function renderReceipt(bill: Bill, result: SplitResult): Promise<Blob> {
  try {
    await document.fonts?.ready;
  } catch {}
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();

  const measure = document.createElement("canvas").getContext("2d")!;
  const height = Math.ceil(draw(measure, bill, result, false, date));
  // Keep huge tables under typical canvas limits.
  const scale = height * 2 > 16000 ? 16000 / height : 2;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, height);
  draw(ctx, bill, result, true, date);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create image"))), "image/png"),
  );
}

export function receiptFileName() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `who-ate-what-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.png`;
}
