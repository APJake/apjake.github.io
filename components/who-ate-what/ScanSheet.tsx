"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { CURRENCIES, formatMoney } from "@/lib/who-ate-what/money";
import type { ScanKind, ScanResult } from "@/lib/who-ate-what/ocr/parse";
import { parseReceipt } from "@/lib/who-ate-what/ocr/parse";
import type { OcrLang, OcrProgress } from "@/lib/who-ate-what/ocr/run";
import { OCR_LANGS } from "@/lib/who-ate-what/ocr/run";
import type { Action } from "@/lib/who-ate-what/state";
import type { Bill, CurrencyCode, Discount } from "@/lib/who-ate-what/types";
import { MoneyInput } from "./inputs";
import styles from "./WhoAteWhat.module.css";

const LANG_KEY = "who-ate-what:ocr-lang";

type Row = { id: number; on: boolean; name: string; qty: number; price: number; kind: ScanKind; pct: number | null; amount: number };

type State =
  | { phase: "pick"; error?: string }
  | { phase: "work"; progress: OcrProgress }
  | { phase: "review"; rows: Row[]; scan: ScanResult; currency: CurrencyCode };

const KIND_LABEL: Record<ScanKind, string> = {
  item: "Dish",
  subtotal: "Subtotal",
  total: "Total",
  tax: "Tax",
  service: "Service",
  discount: "Discount",
  other: "Not a dish",
};

export default function ScanSheet({
  bill, dispatch, onClose,
}: {
  bill: Bill;
  dispatch: (a: Action) => void;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<OcrLang>("eng+vie");
  const [state, setState] = useState<State>({ phase: "pick" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [replace, setReplace] = useState(false);
  const [extrasOn, setExtrasOn] = useState(true);
  const dialog = useRef<HTMLDivElement>(null);
  const alive = useRef(true);

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

  useEffect(() => () => void (photo && URL.revokeObjectURL(photo)), [photo]);

  const close = () => {
    if (state.phase === "work") void import("@/lib/who-ate-what/ocr/run").then((m) => m.cancelScan());
    onClose();
  };

  const pickLang = (l: OcrLang) => {
    setLang(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
  };

  const scan = async (file: File) => {
    setPhoto(URL.createObjectURL(file));
    setState({ phase: "work", progress: { stage: "load", progress: 0 } });
    try {
      const { readSlip } = await import("@/lib/who-ate-what/ocr/run");
      const text = await readSlip(file, lang, (progress) => alive.current && setState({ phase: "work", progress }));
      if (!alive.current) return;
      const result = parseReceipt(text, bill.currency);
      const rows: Row[] = result.lines.map((l, id) => ({
        id, on: l.kind === "item", name: l.name, qty: l.qty, price: l.price, kind: l.kind, pct: l.pct, amount: l.amount,
      }));
      track("waw_scan", { lang, lines: rows.length, dishes: rows.filter((r) => r.on).length });
      setState({ phase: "review", rows, scan: result, currency: result.currency });
    } catch {
      if (!alive.current) return;
      track("waw_scan_failed", { lang });
      setState({ phase: "pick", error: "Couldn't read that photo. Try again with the slip flat, in good light and filling the frame." });
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
                  if (f) void scan(f);
                }}
              />
            </label>
            {state.error && <p className={styles.bad}>{state.error}</p>}
            <p className={styles.hint}>
              Lay the slip flat, fill the frame and avoid shadows. Reading happens on this device: the photo is never
              uploaded. The first scan downloads the reader (a few MB); after that it&apos;s cached.
            </p>
          </div>
        )}

        {state.phase === "work" && (
          <div className={styles.sheetBody}>
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.scanThumb} src={photo} alt="Your bill slip" />
            )}
            <p className={styles.desc} aria-live="polite">
              {state.progress.stage === "load" ? "Getting the reader ready…" : "Reading the slip…"}
            </p>
            <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={Math.round(overall(state.progress) * 100)}>
              <span style={{ width: `${Math.round(overall(state.progress) * 100)}%` }} />
            </div>
            <button type="button" className={styles.btnGhost} onClick={close}>
              Cancel
            </button>
          </div>
        )}

        {state.phase === "review" && (
          <Review
            bill={bill}
            photo={photo}
            state={state}
            setState={setState}
            replace={replace}
            setReplace={setReplace}
            extrasOn={extrasOn}
            setExtrasOn={setExtrasOn}
            onRetry={() => setState({ phase: "pick" })}
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
  // Loading is the first ~40% of the bar, reading the rest.
  return p.stage === "load" ? p.progress * 0.4 : 0.4 + p.progress * 0.6;
}

type ImportAction = Omit<Extract<Action, { type: "importItems" }>, "type">;

function Review({
  bill, photo, state, setState, replace, setReplace, extrasOn, setExtrasOn, onRetry, onImport,
}: {
  bill: Bill;
  photo: string | null;
  state: Extract<State, { phase: "review" }>;
  setState: (s: State) => void;
  replace: boolean;
  setReplace: (v: boolean) => void;
  extrasOn: boolean;
  setExtrasOn: (v: boolean) => void;
  onRetry: () => void;
  onImport: (p: { currency: CurrencyCode; action: ImportAction }) => void;
}) {
  const { rows, scan, currency } = state;
  const [showIgnored, setShowIgnored] = useState(false);
  const ignored = rows.filter((r) => r.kind === "other" && !r.on).length;
  const visible = showIgnored ? rows : rows.filter((r) => r.kind !== "other" || r.on);
  const money = (v: number) => formatMoney(v, currency);
  const update = (id: number, patch: Partial<Row>) =>
    setState({ ...state, rows: rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  const picked = rows.filter((r) => r.on && r.price > 0);
  const sum = picked.reduce((a, r) => a + r.price * r.qty, 0);
  const target = scan.subtotal ?? scan.total;
  const hasDishes = bill.items.some((it) => it.price > 0 || it.name.trim());

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

  if (rows.length === 0) {
    return (
      <div className={styles.sheetBody}>
        <p className={styles.desc}>No prices found on this photo. Try again closer up, flat and in good light, or pick the other language.</p>
        <button type="button" className={styles.btnAccent} onClick={onRetry}>
          Scan again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.sheetBody}>
      <div className={styles.reviewTop}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <a href={photo} target="_blank" rel="noopener" className={styles.scanThumbLink}>
            <img className={styles.scanThumb} src={photo} alt="Your bill slip (opens full size)" />
          </a>
        )}
        <div className={styles.reviewNote}>
          <p className={styles.desc}>Check what was read. Ticked lines become dishes; fix any name or price first.</p>
          <label className={styles.hint}>
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
        </div>
      </div>

      <ul className={styles.scanRows}>
        {visible.map((r) => (
          <li key={r.id} className={`${styles.scanRow} ${r.on ? "" : styles.scanOff}`}>
            <input
              type="checkbox"
              className={styles.check}
              checked={r.on}
              aria-label={`Import ${r.name || "line"}`}
              onChange={(e) => update(r.id, { on: e.target.checked })}
            />
            <div className={styles.scanMain}>
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
            </div>
          </li>
        ))}
      </ul>

      {ignored > 0 && (
        <button type="button" className={styles.toggleBreak} onClick={() => setShowIgnored((v) => !v)}>
          {showIgnored ? "Hide" : "Show"} {ignored} line{ignored === 1 ? "" : "s"} that aren&apos;t dishes (phone, cash, change…)
        </button>
      )}

      <div className={styles.scanSummary}>
        <div className={styles.sumRow}>
          <span>{picked.length} dishes ticked</span>
          <span className={styles.num}>{money(sum)}</span>
        </div>
        {target !== null && (
          <div className={styles.sumRow}>
            <span>{scan.subtotal !== null ? "Slip subtotal" : "Slip total"}</span>
            <span className={styles.num}>{money(target)}</span>
          </div>
        )}
        {target !== null &&
          (sum === target ? (
            <p className={styles.ok}>✓ Dishes match the slip</p>
          ) : (
            <p className={styles.bad}>
              Off by {money(Math.abs(sum - target))}. Compare with the photo for a misread price or a missed line.
            </p>
          ))}
      </div>

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
        <button type="button" className={styles.btnGhost} onClick={onRetry}>
          Scan again
        </button>
      </div>
    </div>
  );
}
