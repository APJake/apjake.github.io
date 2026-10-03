// On-device bill-slip reading with Tesseract.js. Everything (engine, WASM,
// language data) is served from /ocr/ on this site (see
// scripts/copy-ocr-assets.mjs), loaded only when someone scans, and cached by
// the browser after the first time. The photo never leaves the device.
//
// Pipeline: photo → find the slip (or use the corners the user dragged) →
// flatten → trim to the paper → resize so the text is the size Tesseract reads
// best → read (a normal pass plus a digits-only pass for prices) → parse. If
// the dishes don't add up to the slip's subtotal, read once more at another
// size and keep the better result.

import type { Worker } from "tesseract.js";
import type { CurrencyCode } from "../types";
import * as img from "./image";
import type { Gray, Quad } from "./image";
import { type OcrLine, type ScanResult, parseReceipt } from "./parse";

export type OcrLang = "eng+vie" | "mya+eng";

export const OCR_LANGS: { id: OcrLang; label: string }[] = [
  { id: "eng+vie", label: "English / Tiếng Việt" },
  { id: "mya+eng", label: "မြန်မာ / English" },
];

export type OcrProgress = { stage: "load" | "read" | "check"; progress: number };

/**
 * Reading attempts in order: Tesseract page mode and text-line height (px).
 * The next one runs only if the dishes don't add up to the slip's subtotal.
 * Tuned on real photographed slips: "single block" at 28 px read all of them
 * in one go; "single column" at 24 px is a good second opinion for Latin
 * script, but the Myanmar model loses the price columns in that mode.
 */
const ATTEMPTS: Record<OcrLang, { psm: "4" | "6"; height: number }[]> = {
  "eng+vie": [
    { psm: "6", height: 28 },
    { psm: "4", height: 24 },
  ],
  "mya+eng": [
    { psm: "6", height: 28 },
    { psm: "6", height: 36 },
  ],
};
/** Longest side of the photo kept for processing. */
const MAX_PHOTO = 3000;

let cached: { lang: OcrLang; worker: Promise<Worker> } | null = null;
let onProgress: ((p: OcrProgress) => void) | null = null;
let stage: OcrProgress["stage"] = "load";

function getWorker(lang: OcrLang): Promise<Worker> {
  if (cached?.lang === lang) return cached.worker;
  if (cached) void cached.worker.then((w) => w.terminate()).catch(() => {});
  const worker = (async () => {
    const mod = await import("tesseract.js");
    // CommonJS package: named exports may sit on `default` depending on the bundler.
    const { createWorker, OEM } = "createWorker" in mod ? mod : (mod as { default: typeof mod }).default;
    const w = await createWorker(lang.split("+"), OEM.LSTM_ONLY, {
      workerPath: "/ocr/worker.min.js",
      corePath: "/ocr/core",
      langPath: "/ocr/lang",
      logger: (m: { status: string; progress: number }) =>
        onProgress?.({ stage: m.status === "recognizing text" ? stage : "load", progress: m.progress }),
    });
    await w.setParameters({ preserve_interword_spaces: "1" });
    return w;
  })();
  cached = { lang, worker };
  worker.catch(() => {
    if (cached?.worker === worker) cached = null;
  });
  return worker;
}

export type Photo = {
  rgba: { data: Uint8ClampedArray; width: number; height: number };
  /** A small JPEG of the (upright) photo for the crop screen. */
  preview: string;
  /** Where the slip seems to be, in photo pixels. */
  quad: Quad;
  found: boolean;
};

/** Decode the photo upright, keep a working copy and guess where the slip is. */
export async function loadPhoto(file: Blob): Promise<Photo> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const k = Math.min(1, MAX_PHOTO / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = { data: data.data, width: data.width, height: data.height };

  const small = document.createElement("canvas");
  const ks = Math.min(1, 1400 / Math.max(canvas.width, canvas.height));
  small.width = Math.round(canvas.width * ks);
  small.height = Math.round(canvas.height * ks);
  small.getContext("2d")!.drawImage(canvas, 0, 0, small.width, small.height);
  const preview = small.toDataURL("image/jpeg", 0.85);

  const detected = img.detectSlip(rgba);
  return { rgba, preview, quad: detected ?? img.fullQuad(rgba.width, rgba.height), found: !!detected };
}

function toCanvas(g: Gray): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = g.width;
  canvas.height = g.height;
  canvas.getContext("2d")!.putImageData(new ImageData(img.toRgba(g), g.width, g.height), 0, 0);
  return canvas;
}

type Page = Awaited<ReturnType<Worker["recognize"]>>["data"];

function linesOf(page: Page): OcrLine[] {
  return (page.blocks ?? []).flatMap((b) =>
    b.paragraphs.flatMap((p) =>
      p.lines.map((l) => ({
        text: l.text.replace(/\n$/, ""),
        top: l.bbox.y0,
        bottom: l.bbox.y1,
        confidence: l.confidence,
        words: l.words.map((w) => ({ text: w.text, x0: w.bbox.x0, x1: w.bbox.x1 })),
      })),
    ),
  );
}

/** How far the dishes are from the slip's own subtotal (null when there's nothing to check against). */
export function imbalance(r: ScanResult): number | null {
  const items = r.lines.filter((l) => l.kind === "item");
  const sum = items.reduce((a, l) => a + l.amount, 0);
  const hasExtras = r.lines.some((l) => ["discount", "tax", "service"].includes(l.kind));
  const target = r.subtotal ?? (hasExtras ? null : r.total);
  return target === null ? null : Math.abs(sum - target);
}

export type SlipRead = {
  result: ScanResult;
  /** The flattened, cleaned slip the lines' top/bottom refer to (for row snippets). */
  image: HTMLCanvasElement;
};

export async function readSlip(
  photo: Photo,
  quad: Quad,
  lang: OcrLang,
  currency: CurrencyCode,
  progress: (p: OcrProgress) => void,
): Promise<SlipRead> {
  onProgress = progress;
  try {
    progress({ stage: "load", progress: 0 });
    const workerP = getWorker(lang);
    const size = img.warpSize(quad, 1400);
    let flat = img.warp(img.toGray(photo.rgba), quad, size.width, size.height);
    flat = img.trimToPaper(flat);
    const th = img.textHeight(flat);
    const worker = await workerP;

    let best: (SlipRead & { off: number }) | null = null;
    for (const [attempt, { psm, height }] of ATTEMPTS[lang].entries()) {
      const g = img.stretch(th ? img.scale(flat, height / th) : flat);
      const canvas = toCanvas(g);
      stage = attempt === 0 ? "read" : "check";
      await worker.setParameters({ tessedit_pageseg_mode: psm as never });
      const main = await worker.recognize(canvas, { rotateAuto: true }, { text: true, blocks: true });
      await worker.setParameters({ tessedit_char_whitelist: "0123456789.,x " });
      let digits: Page;
      try {
        digits = (await worker.recognize(canvas, {}, { blocks: true })).data;
      } finally {
        await worker.setParameters({ tessedit_char_whitelist: "" });
      }
      const result = parseReceipt(linesOf(main.data), currency, linesOf(digits));
      result.text = main.data.text;
      const off = imbalance(result);
      const score = off ?? Number.MAX_SAFE_INTEGER / 2;
      if (!best || score < best.off) best = { result, image: canvas, off: score };
      if (off === 0 || off === null) break;
    }
    return { result: best!.result, image: best!.image };
  } finally {
    onProgress = null;
  }
}

/** Stop a scan in progress (frees the worker; the next scan starts a new one). */
export function cancelScan() {
  if (!cached) return;
  void cached.worker.then((w) => w.terminate()).catch(() => {});
  cached = null;
}
