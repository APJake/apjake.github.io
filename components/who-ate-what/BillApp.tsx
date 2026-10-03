"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import ConsentSettings from "@/components/ConsentSettings";
import { formatMoney } from "@/lib/who-ate-what/money";
import { split } from "@/lib/who-ate-what/split";
import { initialBill, reducer } from "@/lib/who-ate-what/state";
import { clearDraft, readDraft, writeDraft } from "@/lib/who-ate-what/storage";
import DiscountsStep from "./DiscountsStep";
import ItemsStep from "./ItemsStep";
import PeopleStep from "./PeopleStep";
import ResultStep from "./ResultStep";
import styles from "./WhoAteWhat.module.css";

const STEPS = ["People", "Dishes", "Discounts", "Split"];
const LAST = STEPS.length - 1;

export default function BillApp() {
  // Ids are random, so the bill is only created in the browser (no hydration mismatch).
  const [ready, setReady] = useState(false);
  const [bill, dispatch] = useReducer(reducer, null, () => ({ ...initialBill(), people: [], items: [] }));
  const [step, setStep] = useState(0);
  const result = useMemo(() => split(bill), [bill]);

  useEffect(() => {
    const draft = readDraft();
    dispatch({ type: "load", bill: draft?.bill ?? initialBill() });
    setStep(Math.min(LAST, Math.max(0, draft?.step ?? 0)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeDraft(bill, step);
  }, [bill, step, ready]);

  const go = (s: number) => {
    setStep(Math.min(LAST, Math.max(0, s)));
    window.scrollTo({ top: 0 });
  };

  const startOver = () => {
    clearDraft();
    dispatch({ type: "reset" });
    go(0);
  };

  const pending = result.unassigned.length;

  return (
    <div className={styles.app}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <a
            className={`monoLabel ${styles.barLink}`}
            href="/apps/"
            data-track="cta_click"
            data-track-cta="back_to_apps"
            data-track-app="who-ate-what"
          >
            ← Apps
          </a>
          <a className={styles.brand} href="/apps/who-ate-what/">
            <span className={styles.brandMark} aria-hidden="true" />
            <span className={styles.brandName}>Who Ate What</span>
          </a>
        </div>
      </header>

      <main id="main" className={styles.main}>
        {!ready ? (
          <p className={styles.loading}>Loading…</p>
        ) : (
          <>
            <nav aria-label="Steps">
              <ol className={styles.steps}>
                {STEPS.map((name, i) => (
                  <li key={name}>
                    <button
                      type="button"
                      className={`${styles.step} ${i < step ? styles.stepDone : ""} ${i === step ? styles.stepCurrent : ""}`}
                      aria-current={i === step ? "step" : undefined}
                      onClick={() => go(i)}
                    >
                      <span className={styles.stepNum}>0{i + 1}</span>
                      <span className={styles.stepName}>{name}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            {step === 0 && <PeopleStep bill={bill} dispatch={dispatch} />}
            {step === 1 && <ItemsStep bill={bill} dispatch={dispatch} />}
            {step === 2 && <DiscountsStep bill={bill} result={result} dispatch={dispatch} />}
            {step === 3 && (
              <ResultStep
                bill={bill}
                result={result}
                dispatch={dispatch}
                onStartOver={startOver}
                onEditDishes={() => go(1)}
              />
            )}

            {step < LAST && (
              <div className={styles.bottomBar}>
                <div className={styles.bottomInner}>
                  <div className={styles.bottomTotal}>
                    <span className="monoLabel">
                      {step === 0
                        ? `${bill.people.length} people`
                        : pending > 0
                          ? `Total · ${pending} unassigned`
                          : "Total so far"}
                    </span>
                    <span className={styles.bottomAmount}>{formatMoney(result.grandTotal, bill.currency)}</span>
                  </div>
                  <div className={styles.bottomBtns}>
                    {step > 0 && (
                      <button type="button" className={styles.btnGhost} onClick={() => go(step - 1)}>
                        Back
                      </button>
                    )}
                    <button type="button" className={styles.btnPrimary} onClick={() => go(step + 1)}>
                      {step === LAST - 1 ? "Split it" : "Next"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className={styles.foot}>
        <ConsentSettings />
      </footer>
    </div>
  );
}
