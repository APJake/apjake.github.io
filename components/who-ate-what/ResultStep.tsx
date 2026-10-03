"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/who-ate-what/money";
import { receiptFileName, renderReceipt } from "@/lib/who-ate-what/receiptImage";
import type { PersonResult, SplitResult } from "@/lib/who-ate-what/split";
import type { Action } from "@/lib/who-ate-what/state";
import type { Bill } from "@/lib/who-ate-what/types";
import { ReceiptCheck } from "./DiscountsStep";
import styles from "./WhoAteWhat.module.css";

export default function ResultStep({
  bill, result, dispatch, onStartOver, onEditDishes,
}: {
  bill: Bill;
  result: SplitResult;
  dispatch: (a: Action) => void;
  onStartOver: () => void;
  onEditDishes: () => void;
}) {
  const money = (v: number) => formatMoney(v, bill.currency);
  const [busy, setBusy] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    track("waw_result_viewed", {
      people: bill.people.length,
      dishes: result.lines.length,
      discounts: bill.billDiscounts.length + bill.items.filter((it) => it.discount?.value).length,
    });
    try {
      const probe = new File([""], "x.png", { type: "image/png" });
      setCanShare(Boolean(navigator.canShare?.({ files: [probe] })));
    } catch {}
    // Once per visit to the result step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = async () => {
    setBusy(true);
    try {
      const blob = await renderReceipt(bill, result);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = receiptFileName();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      track("waw_download", { people: bill.people.length });
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      const blob = await renderReceipt(bill, result);
      const file = new File([blob], receiptFileName(), { type: "image/png" });
      await navigator.share({ files: [file], title: "Who Ate What" });
      track("waw_share", { people: bill.people.length });
    } catch {
      // Cancelled.
    } finally {
      setBusy(false);
    }
  };

  const print = () => {
    track("waw_print", { people: bill.people.length });
    window.print();
  };

  const nothing = result.lines.length === 0;

  return (
    <div className={styles.stack}>
      <header className={styles.head}>
        <p className="monoLabel">Step 4 · The split</p>
        <h1 className={`display ${styles.title}`}>Here&apos;s what everyone owes</h1>
        <p className={`${styles.hint} ${styles.printOnly}`}>
          {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
          {bill.people.length} people
        </p>
      </header>

      {result.unassigned.length > 0 && (
        <div className={`${styles.warn} ${styles.noPrint}`} role="alert">
          <span>
            {result.unassigned.length === 1 ? "1 dish has" : `${result.unassigned.length} dishes have`} nobody assigned
            ({result.unassigned.map((l) => l.item.name.trim() || "unnamed").join(", ")}). It&apos;s left out of the
            split.
          </span>
          <span className={styles.actions}>
            <button type="button" className={`${styles.btnGhost} ${styles.btnSmall}`} onClick={onEditDishes}>
              Edit dishes
            </button>
            <button
              type="button"
              className={`${styles.btnAccent} ${styles.btnSmall}`}
              onClick={() => dispatch({ type: "assignUnassignedToAll" })}
            >
              Split among everyone
            </button>
          </span>
        </div>
      )}

      {nothing ? (
        <div className={styles.panel}>
          <p className={styles.desc}>No dishes to split yet. Add a dish with a price and tap who had it.</p>
          <button type="button" className={styles.btnAccent} style={{ marginTop: 14 }} onClick={onEditDishes}>
            Go to dishes
          </button>
        </div>
      ) : (
        <>
          <section className={styles.panel} aria-label="Bill summary">
            <div className={styles.summary}>
              {result.itemDiscounts > 0 && (
                <>
                  <SumRow label="Dishes" value={money(result.gross)} />
                  <SumRow label="Dish discounts" value={`−${money(result.itemDiscounts)}`} neg />
                </>
              )}
              <SumRow label="Subtotal" value={money(result.subtotal)} sub={result.itemDiscounts > 0} />
              {result.billDiscounts
                .filter((d) => d.amount > 0)
                .map((d, i) => (
                  <SumRow
                    key={d.id}
                    label={d.label.trim() || `Bill discount${result.billDiscounts.length > 1 ? ` ${i + 1}` : ""}`}
                    value={`−${money(d.amount)}`}
                    neg
                  />
                ))}
              {result.service > 0 && (
                <SumRow label={`Service charge ${bill.servicePct / 100}%`} value={`+${money(result.service)}`} />
              )}
              {result.tax > 0 && <SumRow label={`Tax ${bill.taxPct / 100}%`} value={`+${money(result.tax)}`} />}
              <div className={`${styles.sumRow} ${styles.sumTotal}`}>
                <span>Total</span>
                <span className={styles.grand}>{money(result.grandTotal)}</span>
              </div>
            </div>
            <div className={styles.checks}>
              {result.balanced ? (
                <p className={styles.ok}>
                  ✓ All {bill.people.length} shares add up to {money(result.grandTotal)}
                </p>
              ) : (
                <p className={styles.bad}>The shares don&apos;t add up. Please report this bug.</p>
              )}
              <ReceiptCheck bill={bill} result={result} />
            </div>
          </section>

          <div className={`${styles.actions} ${styles.noPrint}`}>
            <button type="button" className={styles.btnPrimary} onClick={download} disabled={busy}>
              Download image
            </button>
            {canShare && (
              <button type="button" className={styles.btnAccent} onClick={share} disabled={busy}>
                Share
              </button>
            )}
            <button type="button" className={styles.btnGhost} onClick={print}>
              Print
            </button>
          </div>

          <section aria-label="Each person">
            <div className={styles.sectionHead}>
              <p className="monoLabel">Each person</p>
              <button type="button" className={`${styles.toggleBreak} ${styles.noPrint}`} onClick={() => setAllOpen((o) => !o)}>
                {allOpen ? "Hide all details" : "Show all details"}
              </button>
            </div>
            <ul className={styles.people}>
              {result.people.map((p) => (
                <PersonCard key={p.person.id} p={p} bill={bill} forceOpen={allOpen} />
              ))}
            </ul>
          </section>

          <div className={`${styles.actions} ${styles.noPrint}`} style={{ justifyContent: "flex-end" }}>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => {
                if (window.confirm("Clear this bill and start a new one?")) onStartOver();
              }}
            >
              Start over
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SumRow({ label, value, neg, sub }: { label: string; value: string; neg?: boolean; sub?: boolean }) {
  return (
    <div className={`${styles.sumRow} ${sub ? styles.sumSub : ""}`}>
      <span>{label}</span>
      <span className={`${styles.num} ${neg ? styles.neg : ""}`}>{value}</span>
    </div>
  );
}

function PersonCard({ p, bill, forceOpen }: { p: PersonResult; bill: Bill; forceOpen: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(forceOpen), [forceOpen]);
  const money = (v: number) => formatMoney(v, bill.currency);
  const id = `breakdown-${p.person.id}`;

  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>{p.person.name}</span>
        <span className={styles.cardTotal}>{money(p.total)}</span>
      </div>
      <button
        type="button"
        className={styles.toggleBreak}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {p.shares.length === 0 ? "Didn't eat anything" : `${p.shares.length} dish${p.shares.length === 1 ? "" : "es"}`} ·{" "}
        {open ? "hide" : "details"}
      </button>
      <div id={id} className={`${styles.breakdown} ${open ? styles.breakdownOpen : ""}`}>
        {p.shares.map((s) => (
          <div key={s.itemId} className={styles.bRow}>
            <span>
              {s.name.trim() || "Dish"}
              {s.of > 1 && <span className={styles.of}>1/{s.of}</span>}
            </span>
            <span className={styles.num}>{money(s.amount)}</span>
          </div>
        ))}
        {p.billDiscount > 0 && (
          <div className={styles.bRow}>
            <span>Bill discount</span>
            <span className={`${styles.num} ${styles.neg}`}>−{money(p.billDiscount)}</span>
          </div>
        )}
        {p.service > 0 && (
          <div className={styles.bRow}>
            <span>Service charge</span>
            <span className={styles.num}>+{money(p.service)}</span>
          </div>
        )}
        {p.tax > 0 && (
          <div className={styles.bRow}>
            <span>Tax</span>
            <span className={styles.num}>+{money(p.tax)}</span>
          </div>
        )}
      </div>
    </li>
  );
}
