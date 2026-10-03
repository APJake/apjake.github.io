// On-device OCR with Tesseract.js. Everything (engine, WASM, language data) is
// served from /ocr/ on this site (see scripts/copy-ocr-assets.mjs), loaded only
// when someone scans, and cached by the browser after the first time. The photo
// never leaves the device.

import type { Worker } from "tesseract.js";

export type OcrLang = "eng+vie" | "mya+eng";

export const OCR_LANGS: { id: OcrLang; label: string }[] = [
  { id: "eng+vie", label: "English / Tiếng Việt" },
  { id: "mya+eng", label: "မြန်မာ / English" },
];

export type OcrProgress = { stage: "load" | "read"; progress: number };

let cached: { lang: OcrLang; worker: Promise<Worker> } | null = null;
let onProgress: ((p: OcrProgress) => void) | null = null;

function getWorker(lang: OcrLang): Promise<Worker> {
  if (cached?.lang === lang) return cached.worker;
  if (cached) void cached.worker.then((w) => w.terminate()).catch(() => {});
  const worker = (async () => {
    const mod = await import("tesseract.js");
    // CommonJS package: named exports may sit on `default` depending on the bundler.
    const { createWorker, OEM, PSM } = "createWorker" in mod ? mod : (mod as { default: typeof mod }).default;
    const w = await createWorker(lang.split("+"), OEM.LSTM_ONLY, {
      workerPath: "/ocr/worker.min.js",
      corePath: "/ocr/core",
      langPath: "/ocr/lang",
      logger: (m: { status: string; progress: number }) =>
        onProgress?.({ stage: m.status === "recognizing text" ? "read" : "load", progress: m.progress }),
    });
    await w.setParameters({
      // One uniform block keeps each row (name, qty, price, amount) on one line.
      // On test slips this beat the "single column" and "auto" modes, which
      // split the price columns away from the dish names.
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: "1",
    });
    return w;
  })();
  cached = { lang, worker };
  worker.catch(() => {
    if (cached?.worker === worker) cached = null;
  });
  return worker;
}

/** Grayscale, upright, a sensible size, and stretched contrast for faded thermal paper. */
async function prepare(file: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const long = Math.max(bitmap.width, bitmap.height);
  const scale = long > 2400 ? 2400 / long : long < 1200 ? 1200 / long : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) {
    const g = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = g;
    hist[g]++;
  }
  // Map the 2nd–98th percentile onto the full range.
  const n = d.length / 4;
  let lo = 0;
  let hi = 255;
  for (let acc = 0; lo < 255 && (acc += hist[lo]) < n * 0.02; ) lo++;
  for (let acc = 0; hi > 0 && (acc += hist[hi]) < n * 0.02; ) hi--;
  const span = Math.max(1, hi - lo);
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.min(255, Math.max(0, ((d[i] - lo) * 255) / span));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export async function readSlip(file: Blob, lang: OcrLang, progress: (p: OcrProgress) => void): Promise<string> {
  onProgress = progress;
  try {
    progress({ stage: "load", progress: 0 });
    const [worker, canvas] = await Promise.all([getWorker(lang), prepare(file)]);
    const { data } = await worker.recognize(canvas, { rotateAuto: true });
    return data.text;
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
