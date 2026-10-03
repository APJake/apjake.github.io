// Image work for the bill-slip scanner, as plain functions on pixel arrays so
// they run the same in the browser and in tests:
//  - find the slip in a photo (bright, colourless paper on a busy background),
//  - flatten it (perspective warp from four corners to an upright rectangle),
//  - clean it up for OCR (contrast, or an adaptive threshold for shadows).

export type Pt = { x: number; y: number };
/** Corners in order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Pt, Pt, Pt, Pt];
export type Gray = { data: Uint8ClampedArray; width: number; height: number };
type Rgba = { data: Uint8ClampedArray; width: number; height: number };

export function fullQuad(width: number, height: number): Quad {
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
}

export function toGray({ data, width, height }: Rgba): Gray {
  const out = new Uint8ClampedArray(width * height);
  for (let i = 0, j = 0; j < out.length; i += 4, j++) {
    out[j] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  }
  return { data: out, width, height };
}

function otsu(hist: Uint32Array, total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) {
      best = between;
      threshold = t;
    }
  }
  return threshold;
}

/**
 * Where's the paper? Scores pixels by "bright and colourless", thresholds
 * (Otsu), erodes to cut thin links to other white things, keeps the biggest
 * blob and takes its four extreme corners. Null if nothing paper-like stands
 * out; the user can always drag the corners.
 */
export function detectPaper(img: Rgba): Quad | null {
  const { width: W, height: H, data } = img;
  const s = Math.min(1, 480 / Math.max(W, H));
  const w = Math.max(1, Math.round(W * s));
  const h = Math.max(1, Math.round(H * s));
  const score = new Uint8Array(w * h);
  const hist = new Uint32Array(256);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (Math.min(H - 1, Math.floor(y / s)) * W + Math.min(W - 1, Math.floor(x / s))) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max ? (max - min) / max : 0;
      const v = Math.round(max * (1 - Math.min(1, sat * 2.2)));
      score[y * w + x] = v;
      hist[v]++;
    }
  }
  const t = Math.max(otsu(hist, w * h), 110);

  // Glare, tissues or a white plate can touch the slip. Eroding breaks those
  // links, but too much eats a narrow slip, so try a few strengths and several
  // blobs each, and keep the most slip-like: it fills its own four-corner
  // outline (paper is a rectangle) and has text in it (dark holes), which
  // glare and plates don't. Glare is also brighter than paper, so some masks
  // cap the brightness to cut it away.
  let best: { quad: Quad; score: number } | null = null;
  for (const [lo, hi] of [[t, 256], [t, 248], [t + 20, 248], [t - 20, 240]]) {
    let mask: Uint8Array = new Uint8Array(w * h);
    for (let i = 0; i < mask.length; i++) mask[i] = score[i] > lo && score[i] < hi ? 1 : 0;
    for (let k = 1; k <= 5; k++) {
      mask = erode(mask, w, h);
      if (![1, 2, 3, 5].includes(k)) continue;
      for (const blob of blobs(mask, w, h, w * h * 0.03).slice(0, 4)) {
        let quad = extremeCorners(blob.label, blob.id, w, h);
        // A covered corner (a thumb on the slip) pulls that corner inwards and
        // cuts off text; when much of the blob spills outside the four-corner
        // outline, use the smallest rotated rectangle around it instead.
        if (spill(blob.label, blob.id, w, h, quad) > 0.015) quad = minAreaRect(blob.label, blob.id, w, h);
        const { filled, holes } = fillHoles(blob.label, blob.id, w, h);
        const fill = filled / Math.max(1, quadArea(quad));
        const text = Math.min(1, holes / filled / 0.04);
        const sc = Math.min(1, fill) ** 2 * text * Math.sqrt(filled / (w * h));
        if (!best || sc > best.score) best = { quad, score: sc };
      }
    }
  }
  if (!best || best.score < 0.05) return null;

  // Back to full size, plus a margin so text at the very edge survives.
  const q = best.quad;
  const cx = (q[0].x + q[1].x + q[2].x + q[3].x) / 4;
  const cy = (q[0].y + q[1].y + q[2].y + q[3].y) / 4;
  const grow = (p: Pt): Pt => {
    const x = (cx + (p.x - cx) * 1.06) / s;
    const y = (cy + (p.y - cy) * 1.04) / s;
    return { x: Math.min(W, Math.max(0, x)), y: Math.min(H, Math.max(0, y)) };
  };
  return [grow(q[0]), grow(q[1]), grow(q[2]), grow(q[3])];
}

function erode(mask: Uint8Array, w: number, h: number): Uint8Array {
  const next = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      next[i] = mask[i] & mask[i - 1] & mask[i + 1] & mask[i - w] & mask[i + w];
    }
  }
  return next;
}

/** Connected blobs larger than `minSize`, biggest first; they share one label array. */
function blobs(mask: Uint8Array, w: number, h: number, minSize: number): { label: Int32Array; id: number; size: number }[] {
  const label = new Int32Array(w * h);
  const stack: number[] = [];
  const found: { label: Int32Array; id: number; size: number }[] = [];
  let id = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || label[i]) continue;
    id++;
    let size = 0;
    stack.push(i);
    label[i] = id;
    while (stack.length) {
      const p = stack.pop()!;
      size++;
      const x = p % w;
      if (x > 0 && mask[p - 1] && !label[p - 1]) (label[p - 1] = id), stack.push(p - 1);
      if (x < w - 1 && mask[p + 1] && !label[p + 1]) (label[p + 1] = id), stack.push(p + 1);
      if (p >= w && mask[p - w] && !label[p - w]) (label[p - w] = id), stack.push(p - w);
      if (p < w * (h - 1) && mask[p + w] && !label[p + w]) (label[p + w] = id), stack.push(p + w);
    }
    if (size >= minSize) found.push({ label, id, size });
  }
  return found.sort((a, b) => b.size - a.size);
}

/** The blob with its enclosed holes filled in: total size, and how much of that was holes. */
function fillHoles(label: Int32Array, id: number, w: number, h: number): { filled: number; holes: number } {
  // Flood the outside (everything not in the blob reachable from the border).
  const outside = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (p: number) => {
    if (label[p] !== id && !outside[p]) {
      outside[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < w; x++) push(x), push((h - 1) * w + x);
  for (let y = 0; y < h; y++) push(y * w), push(y * w + w - 1);
  while (stack.length) {
    const p = stack.pop()!;
    const x = p % w;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (p >= w) push(p - w);
    if (p < w * (h - 1)) push(p + w);
  }
  let filled = 0;
  let holes = 0;
  for (let i = 0; i < label.length; i++) {
    if (outside[i]) continue;
    filled++;
    if (label[i] !== id) holes++;
  }
  return { filled, holes };
}

/** TL = min(x+y), TR = max(x−y), BR = max(x+y), BL = min(x−y). */
function extremeCorners(label: Int32Array, id: number, w: number, h: number): Quad {
  let tl = { x: 0, y: 0, v: Infinity };
  let br = { x: 0, y: 0, v: -Infinity };
  let tr = { x: 0, y: 0, v: -Infinity };
  let bl = { x: 0, y: 0, v: Infinity };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (label[y * w + x] !== id) continue;
      if (x + y < tl.v) tl = { x, y, v: x + y };
      if (x + y > br.v) br = { x, y, v: x + y };
      if (x - y > tr.v) tr = { x, y, v: x - y };
      if (x - y < bl.v) bl = { x, y, v: x - y };
    }
  }
  return [tl, tr, br, bl].map(({ x, y }) => ({ x, y })) as Quad;
}

function quadArea(q: Quad): number {
  let a = 0;
  for (let i = 0; i < 4; i++) {
    const p = q[i];
    const n = q[(i + 1) % 4];
    a += p.x * n.y - n.x * p.y;
  }
  return Math.abs(a) / 2;
}

/**
 * Where's the text? Marks pixels that are clearly darker than a bright
 * neighbourhood (ink on paper), joins them into a block and returns its four
 * corners. Ignores glare, wood and hands, which have no text on them.
 */
export function detectText(img: Rgba): Quad | null {
  const { width: W, height: H } = img;
  const s = Math.min(1, 900 / Math.max(W, H));
  const w = Math.max(1, Math.round(W * s));
  const h = Math.max(1, Math.round(H * s));
  const gray = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (Math.min(H - 1, Math.floor(y / s)) * W + Math.min(W - 1, Math.floor(x / s))) * 4;
      const r = img.data[i];
      const g = img.data[i + 1];
      const b = img.data[i + 2];
      // Ink is dark and colourless; skin and wood are neither bright nor grey.
      gray[y * w + x] = (r * 77 + g * 150 + b * 29) >> 8;
    }
  }
  // Local mean via an integral image; ink = much darker than a bright surround.
  const r = Math.max(6, Math.round(w / 60));
  const ii = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += gray[y * w + x];
      ii[(y + 1) * (w + 1) + x + 1] = ii[y * (w + 1) + x + 1] + row;
    }
  }
  const ink = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(w, x + r + 1);
      const mean = (ii[y1 * (w + 1) + x1] - ii[y0 * (w + 1) + x1] - ii[y1 * (w + 1) + x0] + ii[y0 * (w + 1) + x0]) / ((x1 - x0) * (y1 - y0));
      const v = gray[y * w + x];
      const i = (Math.min(H - 1, Math.floor(y / s)) * W + Math.min(W - 1, Math.floor(x / s))) * 4;
      const sat = Math.max(img.data[i], img.data[i + 1], img.data[i + 2]) - Math.min(img.data[i], img.data[i + 1], img.data[i + 2]);
      ink[y * w + x] = mean > 140 && v < mean * 0.72 && sat < 60 ? 1 : 0;
    }
  }
  // Smear ink into one text block (lines, then the gaps between sections) and
  // keep the block holding the most ink.
  let mask: Uint8Array = ink;
  for (let k = 0; k < Math.round(Math.max(w, h) / 50); k++) mask = dilate(mask, w, h);
  const found = blobs(mask, w, h, w * h * 0.005);
  if (!found.length) return null;
  const inkIn = new Map<number, number>();
  const label = found[0].label;
  for (let i = 0; i < ink.length; i++) if (ink[i] && label[i]) inkIn.set(label[i], (inkIn.get(label[i]) ?? 0) + 1);
  const main = found.reduce((a, b) => ((inkIn.get(b.id) ?? 0) > (inkIn.get(a.id) ?? 0) ? b : a));
  // A rotated rectangle around the ink in that block: the angle from the text
  // lines, the extent from the 0.5–99.5th percentiles so a stray mark doesn't
  // stretch it.
  const pts: number[] = [];
  for (let i = 0; i < ink.length; i++) if (ink[i] && main.label[i] === main.id) pts.push(i % w, Math.floor(i / w));
  // A sample is plenty for the angle and extent.
  if (pts.length > 60000) {
    const step = Math.ceil(pts.length / 60000) * 2;
    const sample: number[] = [];
    for (let i = 0; i < pts.length; i += step) sample.push(pts[i], pts[i + 1]);
    pts.length = 0;
    pts.push(...sample);
  }
  const n = pts.length / 2;
  if (n < 50) return null;
  let mx = 0;
  let my = 0;
  for (let i = 0; i < pts.length; i += 2) (mx += pts[i]), (my += pts[i + 1]);
  mx /= n;
  my /= n;
  // Deskew by projection profile: at the right angle, ink piles up in sharp
  // rows (the text lines), so the row histogram is "peakiest".
  let angle = 0;
  let bestPeak = -1;
  const bins = new Float64Array(Math.ceil(Math.hypot(w, h)) * 2 + 4);
  for (let deg = -35; deg <= 35; deg += 0.5) {
    const a = (deg * Math.PI) / 180;
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    bins.fill(0);
    const off = bins.length / 2;
    for (let i = 0; i < pts.length; i += 2) bins[Math.round(-(pts[i] - mx) * sa + (pts[i + 1] - my) * ca + off)]++;
    let peak = 0;
    for (const b of bins) peak += b * b;
    if (peak > bestPeak) {
      bestPeak = peak;
      angle = a;
    }
  }
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const us: number[] = [];
  const vs: number[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    const dx = pts[i] - mx;
    const dy = pts[i + 1] - my;
    us.push(dx * cos + dy * sin);
    vs.push(-dx * sin + dy * cos);
  }
  const pct = (a: number[], q: number) => a.sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(q * a.length))];
  let u0 = pct(us, 0.005);
  let u1 = pct(us, 0.995);
  let v0 = pct(vs, 0.005);
  let v1 = pct(vs, 0.995);
  const padU = (u1 - u0) * 0.05 + 4;
  const padV = (v1 - v0) * 0.03 + 4;
  u0 -= padU;
  u1 += padU;
  v0 -= padV;
  v1 += padV;
  const back = (u: number, v: number): Pt => {
    const x = (mx + u * cos - v * sin) / s;
    const y = (my + u * sin + v * cos) / s;
    return { x: Math.min(W, Math.max(0, x)), y: Math.min(H, Math.max(0, y)) };
  };
  return [back(u0, v0), back(u1, v0), back(u1, v1), back(u0, v1)];
}

/** Paper outline when it hugs the text (true perspective), else the box around the text. */
export function detectSlip(img: Rgba): Quad | null {
  const text = detectText(img);
  const paper = detectPaper(img);
  if (!text) return paper;
  if (!paper) return text;
  const ratio = quadArea(paper) / quadArea(text);
  const textInside = text.every((p) => pointInQuad(p, paper, 0.03 * Math.max(img.width, img.height)));
  // The paper outline wins when it holds all the text and isn't much bigger
  // (it may have caught a bit of glare), or when it's smaller than the text box
  // and sits in it (the text box grabbed patterns from a plate or tissues).
  if (textInside && ratio < 2.2) return paper;
  if (ratio >= 0.4 && ratio < 1 && pointInQuad(centroid(paper), text, 0)) return paper;
  return text;
}

/** Share of the blob lying outside the quad. */
function spill(label: Int32Array, id: number, w: number, h: number, q: Quad): number {
  let total = 0;
  let out = 0;
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (label[y * w + x] !== id) continue;
      total++;
      if (!pointInQuad({ x, y }, q, 1.5)) out++;
    }
  }
  return total ? out / total : 0;
}

/** Smallest-area rotated rectangle around a blob (convex hull + rotating edges). */
function minAreaRect(label: Int32Array, id: number, w: number, h: number): Quad {
  // Leftmost and rightmost blob pixel per row are enough for the hull.
  const pts: Pt[] = [];
  for (let y = 0; y < h; y++) {
    let first = -1;
    let last = -1;
    for (let x = 0; x < w; x++) {
      if (label[y * w + x] !== id) continue;
      if (first < 0) first = x;
      last = x;
    }
    if (first >= 0) pts.push({ x: first, y }, { x: last + 1, y }, { x: first, y: y + 1 }, { x: last + 1, y: y + 1 });
  }
  pts.sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
  let best = { area: Infinity, a: 0, u0: 0, u1: 0, v0: 0, v1: 0 };
  for (let i = 0; i < hull.length; i++) {
    const p = hull[i];
    const q = hull[(i + 1) % hull.length];
    const a = Math.atan2(q.y - p.y, q.x - p.x);
    const c = Math.cos(a);
    const sn = Math.sin(a);
    let u0 = Infinity;
    let u1 = -Infinity;
    let v0 = Infinity;
    let v1 = -Infinity;
    for (const r of hull) {
      const u = r.x * c + r.y * sn;
      const v = -r.x * sn + r.y * c;
      u0 = Math.min(u0, u);
      u1 = Math.max(u1, u);
      v0 = Math.min(v0, v);
      v1 = Math.max(v1, v);
    }
    const area = (u1 - u0) * (v1 - v0);
    if (area < best.area) best = { area, a, u0, u1, v0, v1 };
  }
  // Rotate the frame so "up" is the slip's up (angle within ±45°).
  let { a, u0, u1, v0, v1 } = best;
  while (a > Math.PI / 4) {
    a -= Math.PI / 2;
    [u0, u1, v0, v1] = [-v1, -v0, u0, u1];
  }
  while (a < -Math.PI / 4) {
    a += Math.PI / 2;
    [u0, u1, v0, v1] = [v0, v1, -u1, -u0];
  }
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const at = (u: number, v: number): Pt => ({ x: u * c - v * sn, y: u * sn + v * c });
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
}

function centroid(q: Quad): Pt {
  return { x: (q[0].x + q[1].x + q[2].x + q[3].x) / 4, y: (q[0].y + q[1].y + q[2].y + q[3].y) / 4 };
}

function pointInQuad(p: Pt, q: Quad, tolerance: number): boolean {
  // Inside (or within `tolerance` of) every edge of a clockwise quad.
  for (let i = 0; i < 4; i++) {
    const a = q[i];
    const b = q[(i + 1) % 4];
    const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (cross / Math.hypot(b.x - a.x, b.y - a.y) < -tolerance) return false;
  }
  return true;
}

function dilate(mask: Uint8Array, w: number, h: number): Uint8Array {
  const next = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      next[i] =
        mask[i] | (x > 0 ? mask[i - 1] : 0) | (x < w - 1 ? mask[i + 1] : 0) | (y > 0 ? mask[i - w] : 0) | (y < h - 1 ? mask[i + w] : 0);
    }
  }
  return next;
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Output size for flattening a quad: its own proportions, scaled to `targetWidth`. */
export function warpSize(quad: Quad, targetWidth: number, maxPixels = 14e6): { width: number; height: number } {
  const [tl, tr, br, bl] = quad;
  const qw = Math.max(dist(tl, tr), dist(bl, br));
  const qh = Math.max(dist(tl, bl), dist(tr, br));
  let width = targetWidth;
  let height = Math.round((qh / Math.max(1, qw)) * width);
  if (width * height > maxPixels) {
    const k = Math.sqrt(maxPixels / (width * height));
    width = Math.round(width * k);
    height = Math.round(height * k);
  }
  return { width: Math.max(1, width), height: Math.max(1, height) };
}

/**
 * Perspective-correct the quad into an upright `width × height` image
 * (Heckbert's square-to-quad mapping, bilinear sampling).
 */
export function warp(src: Gray, quad: Quad, width: number, height: number): Gray {
  const [p0, p1, p2, p3] = quad;
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const dy3 = p0.y - p1.y + p2.y - p3.y;
  let g = 0;
  let h = 0;
  if (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) {
    const den = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    h = (dx1 * dy3 - dx3 * dy1) / den;
  }
  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + h * p3.x;
  const c = p0.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + h * p3.y;
  const f = p0.y;

  const out = new Uint8ClampedArray(width * height);
  const { data, width: SW, height: SH } = src;
  for (let y = 0; y < height; y++) {
    const v = (y + 0.5) / height;
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      const z = g * u + h * v + 1;
      const sx = (a * u + b * v + c) / z - 0.5;
      const sy = (d * u + e * v + f) / z - 0.5;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      if (x0 < 0 || y0 < 0 || x0 >= SW - 1 || y0 >= SH - 1) {
        out[y * width + x] = 255;
        continue;
      }
      const fx = sx - x0;
      const fy = sy - y0;
      const i = y0 * SW + x0;
      const top = data[i] + (data[i + 1] - data[i]) * fx;
      const bot = data[i + SW] + (data[i + SW + 1] - data[i + SW]) * fx;
      out[y * width + x] = top + (bot - top) * fy;
    }
  }
  return { data: out, width, height };
}

/** Map the 1st–99th percentile onto the full range. */
export function stretch(img: Gray): Gray {
  const hist = new Uint32Array(256);
  for (const v of img.data) hist[v]++;
  const n = img.data.length;
  let lo = 0;
  let hi = 255;
  for (let acc = 0; lo < 255 && (acc += hist[lo]) < n * 0.01; ) lo++;
  for (let acc = 0; hi > 0 && (acc += hist[hi]) < n * 0.01; ) hi--;
  const span = Math.max(1, hi - lo);
  const out = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i++) out[i] = ((img.data[i] - lo) * 255) / span;
  return { data: out, width: img.width, height: img.height };
}

/**
 * Bradley adaptive threshold: a pixel is ink when it's `t` darker than the
 * average of its neighbourhood. Copes with shadows and uneven light.
 */
export function adaptiveThreshold(img: Gray, windowFrac = 1 / 24, t = 0.12): Gray {
  const { width: w, height: h, data } = img;
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += data[y * w + x];
      integral[(y + 1) * (w + 1) + x + 1] = integral[y * (w + 1) + x + 1] + row;
    }
  }
  const r = Math.max(4, Math.round((w * windowFrac) / 2));
  const out = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(w, x + r + 1);
      const sum =
        integral[y1 * (w + 1) + x1] - integral[y0 * (w + 1) + x1] - integral[y1 * (w + 1) + x0] + integral[y0 * (w + 1) + x0];
      const mean = sum / ((x1 - x0) * (y1 - y0));
      out[y * w + x] = data[y * w + x] < mean * (1 - t) ? 0 : 255;
    }
  }
  return { data: out, width: w, height: h };
}

/** Gray → RGBA, for putting back on a canvas. */
export function toRgba(img: Gray): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(img.data.length * 4);
  for (let i = 0, j = 0; i < img.data.length; i++, j += 4) {
    out[j] = out[j + 1] = out[j + 2] = img.data[i];
    out[j + 3] = 255;
  }
  return out;
}

/**
 * After flattening, the slip is upright, so its columns (and rows) are bright
 * all the way along while table, plate or hand are not. Trims the image to the
 * longest bright run of columns, then rows. Leaves it alone if unsure.
 */
export function trimToPaper(img: Gray): Gray {
  const { width: w, height: h, data } = img;
  const median = (vals: number[]) => vals.sort((a, b) => a - b)[vals.length >> 1];
  const run = (levels: number[]): [number, number] | null => {
    const sorted = [...levels].sort((a, b) => a - b);
    const paper = sorted[Math.floor(sorted.length * 0.9)];
    const floor = sorted[Math.floor(sorted.length * 0.1)];
    if (paper - floor < 40) return null; // all paper already, or no contrast
    const t = floor + (paper - floor) * 0.6;
    // Ruled lines and bold text make short dark dips; bridge gaps up to 3%.
    const gap = Math.max(2, Math.round(levels.length * 0.03));
    const bright = levels.map((v) => v >= t);
    for (let i = 0; i < bright.length; ) {
      if (bright[i]) {
        i++;
        continue;
      }
      let j = i;
      while (j < bright.length && !bright[j]) j++;
      if (i > 0 && j < bright.length && j - i <= gap) for (let k = i; k < j; k++) bright[k] = true;
      i = j;
    }
    let best: [number, number] | null = null;
    let start = -1;
    for (let i = 0; i <= levels.length; i++) {
      if (i < levels.length && bright[i]) {
        if (start < 0) start = i;
      } else if (start >= 0) {
        if (!best || i - start > best[1] - best[0]) best = [start, i];
        start = -1;
      }
    }
    return best && best[1] - best[0] > levels.length * 0.35 ? best : null;
  };
  const step = Math.max(1, Math.floor(h / 400));
  const cols: number[] = [];
  for (let x = 0; x < w; x++) {
    const v: number[] = [];
    for (let y = 0; y < h; y += step) v.push(data[y * w + x]);
    cols.push(median(v));
  }
  const cr = run(cols) ?? [0, w];
  const margin = Math.round(w * 0.01);
  const x0 = Math.max(0, cr[0] - margin);
  const x1 = Math.min(w, cr[1] + margin);
  const rows: number[] = [];
  const xstep = Math.max(1, Math.floor((x1 - x0) / 200));
  for (let y = 0; y < h; y++) {
    const v: number[] = [];
    for (let x = x0; x < x1; x += xstep) v.push(data[y * w + x]);
    rows.push(median(v));
  }
  const rr = run(rows) ?? [0, h];
  const y0 = Math.max(0, rr[0] - margin);
  const y1 = Math.min(h, rr[1] + margin);
  if (x0 === 0 && x1 === w && y0 === 0 && y1 === h) return img;
  const out = new Uint8ClampedArray((x1 - x0) * (y1 - y0));
  for (let y = y0; y < y1; y++) out.set(data.subarray(y * w + x0, y * w + x1), (y - y0) * (x1 - x0));
  return { data: out, width: x1 - x0, height: y1 - y0 };
}

/**
 * Typical height of a text line, in pixels: split the row-by-row ink profile
 * into runs (text lines) and take the median height. Tesseract reads best at
 * a certain text size, so the image is rescaled until this hits a target.
 */
export function textHeight(img: Gray): number | null {
  const bin = adaptiveThreshold(img);
  const { width: w, height: h, data } = bin;
  const prof: number[] = [];
  for (let y = 0; y < h; y++) {
    let ink = 0;
    for (let x = 0; x < w; x += 2) if (!data[y * w + x]) ink++;
    prof.push(ink);
  }
  const sorted = [...prof].sort((a, b) => a - b);
  const t = Math.max(2, sorted[Math.floor(h * 0.25)] + (sorted[Math.floor(h * 0.9)] - sorted[Math.floor(h * 0.25)]) * 0.12);
  const runs: number[] = [];
  let start = -1;
  for (let y = 0; y <= h; y++) {
    if (y < h && prof[y] > t) {
      if (start < 0) start = y;
    } else if (start >= 0) {
      if (y - start >= 6) runs.push(y - start);
      start = -1;
    }
  }
  if (runs.length < 3) return null;
  runs.sort((a, b) => a - b);
  return runs[runs.length >> 1];
}

/** Resize (bilinear) by a factor. */
export function scale(img: Gray, k: number): Gray {
  const width = Math.max(1, Math.round(img.width * k));
  const height = Math.max(1, Math.round(img.height * k));
  const out = new Uint8ClampedArray(width * height);
  const { data, width: sw, height: sh } = img;
  for (let y = 0; y < height; y++) {
    const sy = Math.min(sh - 1.001, Math.max(0, (y + 0.5) / k - 0.5));
    const y0 = Math.floor(sy);
    const fy = sy - y0;
    for (let x = 0; x < width; x++) {
      const sx = Math.min(sw - 1.001, Math.max(0, (x + 0.5) / k - 0.5));
      const x0 = Math.floor(sx);
      const fx = sx - x0;
      const i = y0 * sw + x0;
      const top = data[i] + (data[i + 1] - data[i]) * fx;
      const bot = data[i + sw] + (data[i + sw + 1] - data[i + sw]) * fx;
      out[y * width + x] = top + (bot - top) * fy;
    }
  }
  return { data: out, width, height };
}
