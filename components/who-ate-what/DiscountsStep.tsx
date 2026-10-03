"use client";

import { formatMoney } from "@/lib/who-ate-what/money";
import type { SplitResult } from "@/lib/who-ate-what/split";
import type { Action } from "@/lib/who-ate-what/state";
import { newId } from "@/lib/who-ate-what/state";
import type { Bill } from "@/lib/who-ate-what/types";
import { DiscountInput, MoneyInput, PctInput } from "./inputs";
import styles from "./WhoAteWhat.module.css";

export default function DiscountsStep({
  bill, result, dispatch,
}: {
  bill: Bill;
  result: SplitResult;
  dispatch: (a: Action) => void;
}) {
  const money = (v: number) => formatMoney(v, bill.currency);
  const dishes = bill.items.filter((it) => it.price > 0);
  const lineFor = (id: string) => result.lines.find((l) => l.item.id === id);

  return (
    <div className={styles.stack}>
      <header className={styles.head}>
        <p className="monoLabel">Step 3 · Discounts &amp; extras</p>
        <h1 className={`display ${styles.title}`}>Any deals?</h1>
        <p className={styles.desc}>
          All optional. A dish discount only lowers the price of that dish for the people who shared it. A bill
          discount is shared in proportion to what each person ate.
        </p>
      </header>

      <section className={styles.panel} aria-labelledby="dish-disc">
        <div className={styles.sectionHead}>
          <p id="dish-disc" className="monoLabel">On specific dishes</p>
          {result.itemDiscounts > 0 && <span className={`${styles.num} ${styles.neg}`}>−{money(result.itemDiscounts)}</span>}
        </div>
        {dishes.length === 0 ? (
          <p className={styles.hint}>Add dishes with a price first.</p>
        ) : (
          <ul className={styles.rows}>
            {dishes.map((it) => {
              const label = it.name.trim() || `Dish ${bill.items.indexOf(it) + 1}`;
              const line = lineFor(it.id);
              const gross = it.price * it.qty;
              return (
                <li key={it.id} className={styles.discRow}>
                  <span className={styles.discName}>
                    <span>{label}</span>
                    <span className={`${styles.num} ${styles.hint}`}>
                      {money(gross)}
                      {line && line.discount > 0 && <> → {money(line.net)}</>}
                    </span>
                  </span>
                  <DiscountInput
                    label={`Discount on ${label}`}
                    currency={bill.currency}
                    kind={it.discount?.kind ?? "percent"}
                    value={it.discount?.value ?? 0}
                    onChange={(kind, value) =>
                      dispatch({ type: "setItemDiscount", id: it.id, discount: { kind, value } })
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="bill-disc">
        <div className={styles.sectionHead}>
          <p id="bill-disc" className="monoLabel">On the whole bill</p>
          {result.billDiscountTotal > 0 && (
            <span className={`${styles.num} ${styles.neg}`}>−{money(result.billDiscountTotal)}</span>
          )}
        </div>
        {bill.billDiscounts.length > 0 && (
          <ul className={styles.rows}>
            {bill.billDiscounts.map((d, i) => (
              <li key={d.id} className={styles.billDisc}>
                <input
                  className={styles.input}
                  value={d.label}
                  placeholder={`Discount ${i + 1}, e.g. Member card`}
                  aria-label={`Name of bill discount ${i + 1}`}
                  maxLength={40}
                  onChange={(e) => dispatch({ type: "updateBillDiscount", id: d.id, patch: { label: e.target.value } })}
                />
                <DiscountInput
                  label={`Bill discount ${i + 1}`}
                  currency={bill.currency}
                  kind={d.kind}
                  value={d.value}
                  onChange={(kind, value) => dispatch({ type: "updateBillDiscount", id: d.id, patch: { kind, value } })}
                />
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={`Remove bill discount ${i + 1}`}
                  onClick={() => dispatch({ type: "removeBillDiscount", id: d.id })}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className={styles.addRow}
          style={{ marginTop: bill.billDiscounts.length ? 12 : 0 }}
          onClick={() => dispatch({ type: "addBillDiscount", id: newId() })}
        >
          + Add bill discount
        </button>
        {bill.billDiscounts.length > 1 && (
          <p className={styles.hint} style={{ marginTop: 10 }}>
            Discounts apply one after another, top to bottom.
          </p>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="extras">
        <div className={styles.sectionHead}>
          <p id="extras" className="monoLabel">Service charge &amp; tax</p>
          {result.service + result.tax > 0 && <span className={styles.num}>+{money(result.service + result.tax)}</span>}
        </div>
        <div className={styles.extras}>
          <label className={styles.field}>
            <span>Service charge</span>
            <PctInput value={bill.servicePct} onChange={(v) => dispatch({ type: "setPct", field: "servicePct", value: v })} />
          </label>
          <label className={styles.field}>
            <span>Tax</span>
            <PctInput value={bill.taxPct} onChange={(v) => dispatch({ type: "setPct", field: "taxPct", value: v })} />
          </label>
        </div>
        <p className={styles.hint} style={{ marginTop: 10 }}>
          Both are worked out after discounts. Tax also includes the service charge.
        </p>
      </section>

      <section className={styles.panel} aria-labelledby="receipt">
        <div className={styles.sectionHead}>
          <p id="receipt" className="monoLabel">Double-check</p>
        </div>
        <label className={styles.field}>
          <span>Total printed on the receipt (optional)</span>
          <MoneyInput
            currency={bill.currency}
            value={bill.receiptTotal}
            placeholder="Leave empty to skip"
            onChange={(v) => dispatch({ type: "setReceiptTotal", value: v && v > 0 ? v : null })}
          />
        </label>
        <ReceiptCheck bill={bill} result={result} />
      </section>
    </div>
  );
}

export function ReceiptCheck({ bill, result }: { bill: Bill; result: SplitResult }) {
  if (bill.receiptTotal === null) return null;
  const diff = result.grandTotal - bill.receiptTotal;
  const money = (v: number) => formatMoney(v, bill.currency);
  return diff === 0 ? (
    <p className={styles.ok} style={{ marginTop: 10 }}>
      ✓ Matches the receipt: {money(bill.receiptTotal)}
    </p>
  ) : (
    <p className={styles.bad} style={{ marginTop: 10 }}>
      Receipt says {money(bill.receiptTotal)}, but the dishes add up to {money(result.grandTotal)} ({diff > 0 ? "+" : "−"}
      {money(Math.abs(diff))}). Check for a missed dish, a wrong price, or someone unassigned.
    </p>
  );
}
