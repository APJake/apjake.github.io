"use client";

import { useEffect, useRef, useState } from "react";
import { currencyOf, formatAmount, formatPct, parseAmount, parsePct } from "@/lib/who-ate-what/money";
import type { CurrencyCode, DiscountKind } from "@/lib/who-ate-what/types";
import styles from "./WhoAteWhat.module.css";

type BaseProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  onEnter?: () => void;
  className?: string;
};

/**
 * A text box that keeps what the user is typing, reports a parsed number on
 * every keystroke and tidies the text up (12500 → 12,500) on blur.
 */
function NumberText({
  value, parse, format, onChange, suffix, id, label, placeholder, onEnter, className,
}: BaseProps & {
  value: number | null;
  parse: (t: string) => number | null;
  format: (v: number) => string;
  onChange: (v: number | null) => void;
  suffix: string;
}) {
  const show = (v: number | null) => (v === null || v === 0 ? "" : format(v));
  const [text, setText] = useState(show(value));
  const focused = useRef(false);

  // Follow outside changes (currency switch, reset) while not being edited.
  useEffect(() => {
    if (!focused.current) setText(show(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={styles.affix}>
      <input
        id={id}
        className={`${styles.input} ${styles.money} ${className ?? ""}`}
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint={onEnter ? "next" : "done"}
        aria-label={label}
        placeholder={placeholder ?? "0"}
        value={text}
        onFocus={(e) => {
          focused.current = true;
          e.currentTarget.select();
        }}
        onBlur={() => {
          focused.current = false;
          setText(show(parse(text)));
        }}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parse(e.target.value));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
      />
      <span className={styles.affixText} aria-hidden="true">
        {suffix}
      </span>
    </span>
  );
}

export function MoneyInput(props: BaseProps & { currency: CurrencyCode; value: number | null; onChange: (v: number | null) => void }) {
  const { currency, ...rest } = props;
  return (
    <NumberText
      {...rest}
      parse={(t) => parseAmount(t, currency)}
      format={(v) => formatAmount(v, currency)}
      suffix={currencyOf(currency).label}
    />
  );
}

export function PctInput(props: BaseProps & { value: number; onChange: (v: number) => void }) {
  const { onChange, ...rest } = props;
  return <NumberText {...rest} parse={parsePct} format={formatPct} onChange={(v) => onChange(v ?? 0)} suffix="%" />;
}

/** "%" | "Ks" switch followed by the matching input. */
export function DiscountInput({
  kind, value, currency, onChange, label,
}: {
  kind: DiscountKind;
  value: number;
  currency: CurrencyCode;
  label: string;
  onChange: (kind: DiscountKind, value: number) => void;
}) {
  return (
    <>
      <span className={styles.segs} role="group" aria-label={`${label}: type`}>
        <button type="button" className={styles.seg} aria-pressed={kind === "percent"} onClick={() => kind !== "percent" && onChange("percent", 0)}>
          %
        </button>
        <button type="button" className={styles.seg} aria-pressed={kind === "amount"} onClick={() => kind !== "amount" && onChange("amount", 0)}>
          {currencyOf(currency).label}
        </button>
      </span>
      {kind === "percent" ? (
        <PctInput label={label} value={value} onChange={(v) => onChange("percent", v)} />
      ) : (
        <MoneyInput label={label} currency={currency} value={value} onChange={(v) => onChange("amount", v ?? 0)} />
      )}
    </>
  );
}
