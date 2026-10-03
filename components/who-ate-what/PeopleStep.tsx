"use client";

import { useEffect, useState } from "react";
import type { Action } from "@/lib/who-ate-what/state";
import { defaultName } from "@/lib/who-ate-what/state";
import type { Bill } from "@/lib/who-ate-what/types";
import { MAX_PEOPLE, MIN_PEOPLE } from "@/lib/who-ate-what/types";
import styles from "./WhoAteWhat.module.css";

const PRESETS = [2, 3, 4, 5, 6, 8, 10, 15, 20];

export default function PeopleStep({ bill, dispatch }: { bill: Bill; dispatch: (a: Action) => void }) {
  const count = bill.people.length;
  const [countText, setCountText] = useState(String(count));
  useEffect(() => setCountText(String(count)), [count]);

  const commitCount = () => {
    const n = Number(countText);
    if (Number.isFinite(n) && countText.trim() !== "") dispatch({ type: "setCount", count: n });
    else setCountText(String(count));
  };

  return (
    <div className={styles.stack}>
      <header className={styles.head}>
        <p className="monoLabel">Step 1 · People</p>
        <h1 className={`display ${styles.title}`}>Who&apos;s at the table?</h1>
        <p className={styles.desc}>
          Set how many of you ate, from {MIN_PEOPLE} to {MAX_PEOPLE}. Rename anyone, or leave the default names.
        </p>
      </header>

      <section className={styles.panel} aria-label="Number of people">
        <div className={styles.counter}>
          <div className={styles.countBox}>
            <button
              type="button"
              className={styles.countBtn}
              aria-label="One fewer person"
              disabled={count <= MIN_PEOPLE}
              onClick={() => dispatch({ type: "setCount", count: count - 1 })}
            >
              −
            </button>
            <input
              className={styles.countInput}
              inputMode="numeric"
              aria-label="Number of people"
              value={countText}
              onChange={(e) => setCountText(e.target.value.replace(/\D/g, "").slice(0, 2))}
              onBlur={commitCount}
              onKeyDown={(e) => e.key === "Enter" && commitCount()}
            />
            <button
              type="button"
              className={styles.countBtn}
              aria-label="One more person"
              disabled={count >= MAX_PEOPLE}
              onClick={() => dispatch({ type: "setCount", count: count + 1 })}
            >
              +
            </button>
          </div>
          <div className={styles.presets} role="group" aria-label="Quick pick">
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.preset} ${n === count ? styles.presetOn : ""}`}
                onClick={() => dispatch({ type: "setCount", count: n })}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Names">
        <div className={styles.sectionHead}>
          <p className="monoLabel">Names</p>
          <span className={styles.hint}>Lowering the number removes people from the end.</span>
        </div>
        <ul className={styles.peopleGrid}>
          {bill.people.map((p, i) => (
            <li key={p.id} className={styles.personRow}>
              <span className={styles.personNo} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <input
                className={styles.input}
                value={p.name}
                placeholder={defaultName(i + 1)}
                aria-label={`Name of person ${i + 1}`}
                maxLength={40}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => dispatch({ type: "renamePerson", id: p.id, name: e.target.value })}
                onBlur={(e) => {
                  if (!e.target.value.trim()) dispatch({ type: "renamePerson", id: p.id, name: defaultName(i + 1) });
                }}
              />
              <button
                type="button"
                className={styles.iconBtn}
                aria-label={`Remove ${p.name || defaultName(i + 1)}`}
                disabled={count <= MIN_PEOPLE}
                onClick={() => dispatch({ type: "removePerson", id: p.id })}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
