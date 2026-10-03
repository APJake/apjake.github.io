"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { CURRENCIES, formatMoney } from "@/lib/who-ate-what/money";
import type { Quad } from "@/lib/who-ate-what/ocr/image";
import type { ScanKind, ScanResult } from "@/lib/who-ate-what/ocr/parse";
import type { OcrLang, OcrProgress, Photo } from "@/lib/who-ate-what/ocr/run";
import { OCR_LANGS } from "@/lib/who-ate-what/ocr/run";
import type { Action } from "@/lib/who-ate-what/state";
import type { Bill, CurrencyCode, Discount } from "@/lib/who-ate-what/types";
import CropStep from "./CropStep";
import { MoneyInput } from "./inputs";
import styles from "./WhoAteWhat.module.css";

const LANG_KEY = "who-ate-what:ocr-lang";

type NameMode = "local" | "alt" | "both";

type Row = {
  id: number;
  on: boolean;
  name: string;
  nameLocal: string;
  nameAlt: string | null;
  qty: number;
  price: number;
  kind: ScanKind;
  pct: number | null;
  amount: number;
  uncertain: boolean;
  fixed: boolean;
  /** A picture of this row cut from the slip, to compare against. */
  snippet: string | null;
};

type State =
  | { phase: "pick"; error?: string }
  | { phase: "load" }
  | { phase: "crop"; photo: Photo; quad: Quad }
  | { phase: "work"; photo: Photo; quad: Quad; progress: OcrProgress }
  | { phase: "review"; photo: Photo; quad: Quad; rows: Row[]; scan: ScanResult; currency: CurrencyCode; mode: NameMode };

const KIND_LABEL: Record<ScanKind, string> = {
  item: "Dish",
  subtotal: "Subtotal",
  total: "Total",
  tax: "Tax",
  service: "Service",
  discount: "Discount",
  other: "Not a dish",
};

const nameFor = (r: Pick<Row, "nameLocal" | "nameAlt">, mode: NameMode) =>
  !r.nameAlt ? r.nameLocal : mode === "local" ? r.nameLocal : mode === "alt" ? r.nameAlt : `${r.nameLocal} (${r.nameAlt})`;

/** Cut each line out of the flattened slip as a small picture. */
function snippets(image: HTMLCanvasElement, scan: ScanResult): (string | null)[] {
  return scan.lines.map((l) => {
    const pad = Math.round((l.bottom - l.top) * 0.15) + 4;
    const top = Math.max(0, l.top - pad);
    const h = Math.min(image.height, l.bottom + pad) - top;
    if (h <= 4) return null;
    const k = Math.min(1, 640 / image.width);
    const c = document.createElement("canvas");
    c.width = Math.round(image.width * k);
    c.height = Math.max(1, Math.round(h * k));
    c.getContext("2d")!.drawImage(image, 0, top, image.width, h, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  });
}

export default function ScanSheet({
  bill, dispatch, onClose,
}: {
  bill: Bill;
  dispatch: (a: Action) => void;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<OcrLang>("eng+vie");
  const [state, setState] = useState<State>({ phase: "pick" });
  const [replace, setReplace] = useState(false);
  const [extrasOn, setExtrasOn] = useState(true);
  const dialog = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const phase = useRef(state.phase);
  phase.current = state.phase;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as OcrLang | null;
      if (saved && OCR_LANGS.some((l) => l.id === saved)) setLang(saved);
    } catch {}
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      alive.current = false;
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (phase.current === "work") void import("@/lib/who-ate-what/ocr/run").then((m) => m.cancelScan());
    onClose();
  };

  const pickLang = (l: OcrLang) => {
    setLang(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
  };

  const open = async (file: File) => {
    setState({ phase: "load" });
    try {
      const { loadPhoto } = await import("@/lib/who-ate-what/ocr/run");
      const photo = await loadPhoto(file);
      if (alive.current) setState({ phase: "crop", photo, quad: photo.quad });
    } catch {
      if (alive.current) setState({ phase: "pick", error: "Couldn't open that photo. Try a JPEG or PNG." });
    }
  };

  const read = async (photo: Photo, quad: Quad) => {
    setState({ phase: "work", photo, quad, progress: { stage: "load", progress: 0 } });
    try {
      const { readSlip } = await import("@/lib/who-ate-what/ocr/run");
      const { result, image } = await readSlip(photo, quad, lang, bill.currency, (progress) => {
        if (alive.current) setState((s) => (s.phase === "work" ? { ...s, progress } : s));
      });
      if (!alive.current) return;
      const pics = snippets(image, result);
      const rows: Row[] = result.lines.map((l, id) => ({
        id,
        on: l.kind === "item",
        name: nameFor(l, "local"),
        nameLocal: l.nameLocal,
        nameAlt: l.nameAlt,
        qty: l.qty,
        price: l.price,
        kind: l.kind,
        pct: l.pct,
        amount: l.amount,
        uncertain: l.uncertain && !l.fixedFromTotal,
        fixed: l.fixedFromTotal,
        snippet: pics[id],
      }));
      track("waw_scan", {
        lang,
        lines: rows.length,
        dishes: rows.filter((r) => r.on).length,
        unsure: rows.filter((r) => r.on && (r.uncertain || r.fixed)).length,
      });
      setState({ phase: "review", photo, quad, rows, scan: result, currency: result.currency, mode: "local" });
    } catch {
      if (!alive.current) return;
      track("waw_scan_failed", { lang });
      setState({ phase: "crop", photo, quad });
      alert("Couldn't read that. Check the outline is on the slip and try again, or try another photo.");
    }
  };

  return (
    <div className={styles.sheetBackdrop} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="scan-title" tabIndex={-1} ref={dialog}>
        <div className={styles.sheetHead}>
          <h2 id="scan-title" className={`display ${styles.sheetTitle}`}>Scan bill slip</h2>
          <button type="button" className={styles.iconBtn} aria-label="Close" onClick={close}>
            ×
          </button>
        </div>

        {state.phase === "pick" && (
          <div className={styles.sheetBody}>
            <div className={styles.field}>
              <span>Slip language</span>
              <div className={styles.chips} role="group" aria-label="Slip language">
                {OCR_LANGS.map((l) => (
                  <button key={l.id} type="button" className={styles.chip} aria-pressed={lang === l.id} onClick={() => pickLang(l.id)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <label className={`${styles.btnPrimary} ${styles.fileBtn}`}>
              Take a photo or choose one
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void open(f);
                }}
              />
            </label>
            {state.error && <p className={styles.bad}>{state.error}</p>}
            <p className={styles.hint}>
              For the best result: the whole slip in the photo, as flat as you can, good light, no strong shadow.
              Reading happens on this device; the photo is never uploaded. The first scan downloads the reader (a few
              MB), after that it&apos;s cached.
            </p>
          </div>
        )}

        {state.phase === "load" && (
          <div className={styles.sheetBody}>
            <p className={styles.desc} aria-live="polite">Finding the slip…</p>
          </div>
        )}

        {state.phase === "crop" && (
          <CropStep
            preview={state.photo.preview}
            width={state.photo.rgba.width}
            height={state.photo.rgba.height}
            quad={state.quad}
            found={state.photo.found}
            onChange={(quad) => setState({ ...state, quad })}
            onScan={() => void read(state.photo, state.quad)}
            onBack={() => setState({ phase: "pick" })}
          />
        )}

        {state.phase === "work" && (
          <div className={styles.sheetBody}>
            <p className={styles.desc} aria-live="polite">
              {state.progress.stage === "load"
                ? "Getting the reader ready…"
                : state.progress.stage === "read"
                  ? "Reading the slip…"
                  : "The dishes didn't add up, double-checking…"}
            </p>
            <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={Math.round(overall(state.progress) * 100)}>
              <span style={{ width: `${Math.round(overall(state.progress) * 100)}%` }} />
            </div>
            <p className={styles.hint}>A long slip can take 10–20 seconds.</p>
            <button type="button" className={styles.btnGhost} onClick={close}>
              Cancel
            </button>
          </div>
        )}

        {state.phase === "review" && (
          <Review
            bill={bill}
            state={state}
            setState={setState}
            replace={replace}
            setReplace={setReplace}
            extrasOn={extrasOn}
            setExtrasOn={setExtrasOn}
            onRecrop={() => setState({ phase: "crop", photo: state.photo, quad: state.quad })}
            onImport={(payload) => {
              if (payload.currency !== bill.currency) dispatch({ type: "setCurrency", currency: payload.currency });
              dispatch({ type: "importItems", ...payload.action });
              track("waw_scan_import", { dishes: payload.action.items.length });
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

function overall(p: OcrProgress) {
  // Loading is the first ~30% of the bar, reading the next 50, re-checking the rest.
  return p.stage === "load" ? p.progress * 0.3 : p.stage === "read" ? 0.3 + p.progress * 0.5 : 0.8 + p.progress * 0.2;
}

type ImportAction = Omit<Extract<Action, { type: "importItems" }>, "type">;

function Review({
  bill, state, setState, replace, setReplace, extrasOn, setExtrasOn, onRecrop, onImport,
}: {
  bill: Bill;
  state: Extract<State, { phase: "review" }>;
  setState: (s: State) => void;
  replace: boolean;
  setReplace: (v: boolean) => void;
  extrasOn: boolean;
  setExtrasOn: (v: boolean) => void;
  onRecrop: () => void;
  onImport: (p: { currency: CurrencyCode; action: ImportAction }) => void;
}) {
  const { rows, scan, currency, mode } = state;
  const [showIgnored, setShowIgnored] = useState(false);
  const ignored = rows.filter((r) => r.kind === "other" && !r.on).length;
  const visible = showIgnored ? rows : rows.filter((r) => r.kind !== "other" || r.on);
  const money = (v: number) => formatMoney(v, currency);
  const update = (id: number, patch: Partial<Row>) =>
    setState({ ...state, rows: rows.map((r) => (r.id === id ? { ...r, ...patch, uncertain: false, fixed: false } : r)) });
  const bilingual = rows.some((r) => r.kind === "item" && r.nameAlt);

  const picked = rows.filter((r) => r.on && r.price > 0);
  const sum = picked.reduce((a, r) => a + r.price * r.qty, 0);
  const hasExtras = rows.some((r) => ["discount", "tax", "service"].includes(r.kind));
  const target = scan.subtotal ?? (hasExtras ? null : scan.total);
  const hasDishes = bill.items.some((it) => it.price > 0 || it.name.trim());
  const toCheck = rows.filter((r) => r.on && (r.uncertain || r.price === 0)).length;
  // One ticked line with no price and the slip's subtotal known: offer the gap
  // as its price (the user decides; it could also be a line the reader missed).
  const noPrice = rows.filter((r) => r.on && r.kind === "item" && r.price === 0);
  const gap =
    target !== null && sum < target && noPrice.length === 1 && (target - sum) % noPrice[0].qty === 0 ? noPrice[0] : null;

  // Charges and discounts we can carry over: only ones printed with a %, or a discount amount.
  const extras = useMemo(() => {
    const service = rows.find((r) => r.kind === "service" && r.pct !== null)?.pct ?? null;
    const tax = rows.find((r) => r.kind === "tax" && r.pct !== null)?.pct ?? null;
    const discounts: Discount[] = rows
      .filter((r) => r.kind === "discount")
      .map((r) => (r.pct !== null ? { kind: "percent" as const, value: r.pct } : { kind: "amount" as const, value: r.amount }));
    const labels = [
      ...discounts.map((d) => (d.kind === "percent" ? `discount ${d.value / 100}%` : `discount ${money(d.value)}`)),
      service !== null ? `service ${service / 100}%` : null,
      tax !== null ? `tax ${tax / 100}%` : null,
    ].filter(Boolean);
    return { service, tax, discounts, labels };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, currency]);

  const setMode = (m: NameMode) =>
    setState({ ...state, mode: m, rows: rows.map((r) => (r.nameAlt ? { ...r, name: nameFor(r, m) } : r)) });

  const addRow = () => {
    const id = Math.max(-1, ...rows.map((r) => r.id)) + 1;
    const row: Row = {
      id, on: true, name: "", nameLocal: "", nameAlt: null, qty: 1, price: 0, kind: "item",
      pct: null, amount: 0, uncertain: false, fixed: false, snippet: null,
    };
    setState({ ...state, rows: [...rows, row] });
  };

  if (rows.filter((r) => r.kind !== "other").length === 0) {
    return (
      <div className={styles.sheetBody}>
        <p className={styles.desc}>
          No prices found. Check the outline covers the slip, try the other language, or retake the photo flatter and
          closer.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.btnAccent} onClick={onRecrop}>
            Adjust the outline
          </button>
          <button type="button" className={styles.btnGhost} onClick={addRow}>
            Type the dishes instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sheetBody}>
      <div className={styles.reviewNote}>
        <p className={styles.desc}>
          Check each line against the picture of it. Ticked lines become dishes.
          {toCheck > 0 && (
            <>
              {" "}
              <strong className={styles.unsureTag}>
                {toCheck} line{toCheck === 1 ? "" : "s"} to check
              </strong>{" "}
              are outlined.
            </>
          )}
        </p>
        <div className={styles.segRow}>
          <label>
            Currency{" "}
            <select
              className={styles.select}
              value={currency}
              onChange={(e) => setState({ ...state, currency: e.target.value as CurrencyCode })}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.label})
                </option>
              ))}
            </select>
          </label>
          {bilingual && (
            <span className={styles.segs} role="group" aria-label="Dish names">
              {(
                [
                  ["local", "Tiếng Việt"],
                  ["alt", "English"],
                  ["both", "Both"],
                ] as const
              ).map(([m, label]) => (
                <button key={m} type="button" className={styles.seg} aria-pressed={mode === m} onClick={() => setMode(m)}>
                  {label}
                </button>
              ))}
            </span>
          )}
        </div>
      </div>

      <ul className={styles.scanRows}>
        {visible.map((r) => {
          const unsure = r.on && (r.uncertain || r.price === 0 || r.fixed);
          return (
            <li key={r.id} className={`${styles.scanRow} ${r.on ? "" : styles.scanOff} ${unsure ? styles.scanUnsure : ""}`}>
              <input
                type="checkbox"
                className={styles.check}
                checked={r.on}
                aria-label={`Import ${r.name || "line"}`}
                onChange={(e) => setState({ ...state, rows: rows.map((x) => (x.id === r.id ? { ...x, on: e.target.checked } : x)) })}
              />
              <div className={styles.scanMain}>
                {r.snippet && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.snippet} src={r.snippet} alt={`This line on the slip`} />
                )}
                <input
                  className={styles.input}
                  value={r.name}
                  placeholder="Dish name"
                  aria-label="Dish name"
                  onChange={(e) => update(r.id, { name: e.target.value })}
                />
                <div className={styles.scanNums}>
                  <input
                    className={`${styles.input} ${styles.scanQty}`}
                    inputMode="numeric"
                    aria-label="Quantity"
                    value={r.qty}
                    onChange={(e) => update(r.id, { qty: Math.min(999, Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1)) })}
                  />
                  <span className={styles.muted}>×</span>
                  <MoneyInput currency={currency} label="Price each" value={r.price} onChange={(v) => update(r.id, { price: v ?? 0 })} />
                  {r.kind !== "item" && <span className={styles.kindTag}>{KIND_LABEL[r.kind]}</span>}
                </div>
                {r.on && r.fixed && <span className={styles.unsureTag}>Price worked out from the slip&apos;s subtotal, check it</span>}
                {r.on && !r.fixed && r.price === 0 && <span className={styles.unsureTag}>Price not readable, type it in</span>}
                {r.on && !r.fixed && r.price > 0 && r.uncertain && <span className={styles.unsureTag}>Numbers didn&apos;t agree, check the price</span>}
              </div>
            </li>
          );
        })}
      </ul>

      <button type="button" className={styles.addRow} onClick={addRow}>
        + Add a line it missed
      </button>

      {ignored > 0 && (
        <button type="button" className={styles.toggleBreak} onClick={() => setShowIgnored((v) => !v)}>
          {showIgnored ? "Hide" : "Show"} {ignored} line{ignored === 1 ? "" : "s"} that aren&apos;t dishes (phone, cash, change…)
        </button>
      )}

      <details className={styles.rawText}>
        <summary>Show what the reader saw</summary>
        <pre>{scan.text}</pre>
      </details>

      {extras.labels.length > 0 && (
        <label className={styles.checkRow}>
          <input type="checkbox" className={styles.check} checked={extrasOn} onChange={(e) => setExtrasOn(e.target.checked)} />
          <span>Also add {extras.labels.join(", ")}</span>
        </label>
      )}
      {hasDishes && (
        <label className={styles.checkRow}>
          <input type="checkbox" className={styles.check} checked={replace} onChange={(e) => setReplace(e.target.checked)} />
          <span>Replace the dishes already entered (otherwise they&apos;re kept and these are added)</span>
        </label>
      )}

      <div className={styles.stickySum}>
        <div className={styles.sumRow}>
          <span>{picked.length} dishes ticked</span>
          <span className={styles.num}>{money(sum)}</span>
        </div>
        {target !== null &&
          (sum === target ? (
            <p className={styles.ok}>✓ Matches the slip&apos;s {scan.subtotal !== null ? "subtotal" : "total"}, {money(target)}</p>
          ) : (
            <p className={styles.bad}>
              Slip says {money(target)}: {sum < target ? "missing" : "over by"} {money(Math.abs(sum - target))}
              {gap && (
                <>
                  {" "}
                  <button
                    type="button"
                    className={`${styles.btnAccent} ${styles.btnSmall}`}
                    onClick={() => update(gap.id, { price: Math.round((target - sum) / gap.qty) })}
                  >
                    Use {money(target - sum)} for “{gap.name || "the empty line"}”
                  </button>
                </>
              )}
            </p>
          ))}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={picked.length === 0}
            onClick={() =>
              onImport({
                currency,
                action: {
                  items: picked.map((r) => ({ name: r.name.trim(), qty: r.qty, price: r.price })),
                  replace,
                  receiptTotal: scan.total,
                  servicePct: extrasOn ? extras.service : null,
                  taxPct: extrasOn ? extras.tax : null,
                  discounts: extrasOn ? extras.discounts : [],
                },
              })
            }
          >
            Add {picked.length} dish{picked.length === 1 ? "" : "es"}
          </button>
          <button type="button" className={styles.btnGhost} onClick={onRecrop}>
            Re-scan
          </button>
        </div>
      </div>
    </div>
  );
}
