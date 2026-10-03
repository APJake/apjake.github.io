"use client";

import { useEffect, useState } from "react";
import { CURRENCIES, formatMoney } from "@/lib/who-ate-what/money";
import type { Action } from "@/lib/who-ate-what/state";
import { newId } from "@/lib/who-ate-what/state";
import type { Bill, CurrencyCode, Item } from "@/lib/who-ate-what/types";
import { MoneyInput } from "./inputs";
import styles from "./WhoAteWhat.module.css";

const focusEl = (id: string) => document.getElementById(id)?.focus();

export default function ItemsStep({ bill, dispatch }: { bill: Bill; dispatch: (a: Action) => void }) {
  const [focusNext, setFocusNext] = useState<string | null>(null);

  useEffect(() => {
    if (!focusNext) return;
    focusEl(`dish-name-${focusNext}`);
    setFocusNext(null);
  }, [focusNext, bill.items.length]);

  const addItem = () => {
    const id = newId();
    dispatch({ type: "addItem", id });
    setFocusNext(id);
  };

  return (
    <div className={styles.stack}>
      <header className={styles.head}>
        <p className="monoLabel">Step 2 · Dishes</p>
        <h1 className={`display ${styles.title}`}>Who ate what?</h1>
        <p className={styles.desc}>
          Copy each line from the receipt and tap the people who shared it. A dish is split evenly between the people
          who had it.
        </p>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.hint}>
          Currency{" "}
          <select
            className={styles.select}
            value={bill.currency}
            onChange={(e) => dispatch({ type: "setCurrency", currency: e.target.value as CurrencyCode })}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.label})
              </option>
            ))}
          </select>
        </label>
        <span className={styles.hint}>Tip: press Enter in a price box to add the next dish.</span>
      </div>

      <ul className={styles.items}>
        {bill.items.map((item, i) => (
          <ItemCard
            key={item.id}
            item={item}
            index={i}
            bill={bill}
            dispatch={dispatch}
            onEnterPrice={() => (i === bill.items.length - 1 ? addItem() : focusEl(`dish-name-${bill.items[i + 1].id}`))}
          />
        ))}
      </ul>

      <button type="button" className={styles.addRow} onClick={addItem}>
        + Add dish
      </button>
    </div>
  );
}

function ItemCard({
  item, index, bill, dispatch, onEnterPrice,
}: {
  item: Item;
  index: number;
  bill: Bill;
  dispatch: (a: Action) => void;
  onEnterPrice: () => void;
}) {
  const update = (patch: Partial<Omit<Item, "id">>) => dispatch({ type: "updateItem", id: item.id, patch });
  const all = bill.people.map((p) => p.id);
  const gross = item.price * item.qty;
  const n = item.eaters.length;
  const flagged = gross > 0 && n === 0;
  const label = item.name.trim() || `Dish ${index + 1}`;

  return (
    <li className={`${styles.item} ${flagged ? styles.itemFlag : ""}`}>
      <div className={styles.itemTop}>
        <label className={styles.field}>
          <span className={styles.miniLabel}>Dish {index + 1}</span>
          <input
            id={`dish-name-${item.id}`}
            className={styles.input}
            value={item.name}
            placeholder="e.g. Mala hotpot"
            maxLength={60}
            enterKeyHint="next"
            onChange={(e) => update({ name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                focusEl(`dish-price-${item.id}`);
              }
            }}
          />
        </label>
        <div className={styles.field}>
          <span className={styles.miniLabel}>Qty</span>
          <div className={styles.qty}>
            <button
              type="button"
              className={styles.qtyBtn}
              aria-label={`Fewer ${label}`}
              disabled={item.qty <= 1}
              onClick={() => update({ qty: Math.max(1, item.qty - 1) })}
            >
              −
            </button>
            <input
              className={styles.qtyVal}
              inputMode="numeric"
              aria-label={`Quantity of ${label}`}
              value={item.qty}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => update({ qty: Math.min(999, Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1)) })}
            />
            <button
              type="button"
              className={styles.qtyBtn}
              aria-label={`More ${label}`}
              onClick={() => update({ qty: Math.min(999, item.qty + 1) })}
            >
              +
            </button>
          </div>
        </div>
        <div className={styles.field}>
          <span className={styles.miniLabel}>{item.qty > 1 ? "Price each" : "Price"}</span>
          <MoneyInput
            id={`dish-price-${item.id}`}
            label={`Price of ${label}`}
            currency={bill.currency}
            value={item.price}
            onChange={(v) => update({ price: v ?? 0 })}
            onEnter={onEnterPrice}
          />
        </div>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={`Remove ${label}`}
          onClick={() => dispatch({ type: "removeItem", id: item.id })}
        >
          ×
        </button>
      </div>

      <div>
        <div className={styles.eatersHead}>
          <span className="monoLabel">Who had it</span>
          <div className={styles.eatersActions}>
            <button
              type="button"
              className={`${styles.btnGhost} ${styles.btnSmall}`}
              aria-pressed={n === all.length}
              onClick={() => dispatch({ type: "setEaters", itemId: item.id, eaters: all })}
            >
              Everyone
            </button>
            <button
              type="button"
              className={`${styles.btnGhost} ${styles.btnSmall}`}
              disabled={n === 0}
              onClick={() => dispatch({ type: "setEaters", itemId: item.id, eaters: [] })}
            >
              Clear
            </button>
          </div>
        </div>
        <div className={styles.chips} role="group" aria-label={`Who had ${label}`} style={{ marginTop: 10 }}>
          {bill.people.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.chip}
              aria-pressed={item.eaters.includes(p.id)}
              onClick={() => dispatch({ type: "toggleEater", itemId: item.id, personId: p.id })}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.itemFoot}>
        <span className={styles.num}>
          {item.qty > 1 && gross > 0 ? `${item.qty} × ${formatMoney(item.price, bill.currency)} = ` : ""}
          <strong>{formatMoney(gross, bill.currency)}</strong>
        </span>
        <span>
          {flagged ? (
            <span style={{ color: "var(--amber)" }}>Tap who had it</span>
          ) : n === 0 ? (
            "Nobody yet"
          ) : n === all.length && n > 1 ? (
            <>Everyone · {each(gross, n, bill.currency)}</>
          ) : n === 1 ? (
            bill.people.find((p) => p.id === item.eaters[0])?.name
          ) : (
            <>
              {n} people · {each(gross, n, bill.currency)}
            </>
          )}
        </span>
      </div>
    </li>
  );
}

function each(amount: number, n: number, currency: CurrencyCode) {
  const base = Math.floor(amount / n);
  return `${amount % n === 0 ? "" : "≈"}${formatMoney(base, currency)} each`;
}
