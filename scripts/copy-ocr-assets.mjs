// Copies the on-device OCR engine (Tesseract.js worker, WASM core and
// language data) into public/ocr/ so the bill scanner in Who Ate What is
// served from this site, with no third-party CDN at runtime.
// Runs before `next dev` and `next build`; the output is gitignored.

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nm = (...p) => join(root, "node_modules", ...p);
const out = join(root, "public", "ocr");

const files = [
  [nm("tesseract.js", "dist", "worker.min.js"), "worker.min.js"],
  // The worker picks one of these by browser support. The .wasm.js builds embed their WASM.
  ...["lstm", "simd-lstm", "relaxedsimd-lstm"].map((v) => [
    nm("tesseract.js-core", `tesseract-core-${v}.wasm.js`),
    join("core", `tesseract-core-${v}.wasm.js`),
  ]),
  // "best_int" models: LSTM-only, smaller and more accurate than the legacy ones.
  ...["eng", "vie", "mya"].map((l) => [
    nm("@tesseract.js-data", l, "4.0.0_best_int", `${l}.traineddata.gz`),
    join("lang", `${l}.traineddata.gz`),
  ]),
];

for (const [from, to] of files) {
  if (!existsSync(from)) {
    console.error(`copy-ocr-assets: missing ${from}. Run npm install.`);
    process.exit(1);
  }
  const dest = join(out, to);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(from, dest);
}
console.log(`copy-ocr-assets: ${files.length} files → public/ocr/`);
