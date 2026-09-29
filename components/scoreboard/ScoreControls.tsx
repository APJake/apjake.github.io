"use client";

import { useState } from "react";
import { parseScore, signed } from "@/lib/scoreboard/format";
import styles from "./Scoreboard.module.css";

/**
 * Three preset groups: [−1 +1] [+step] [Custom].
 * `step` is the creator's quick-score value (settings → Preset button).
 */
export default function ScoreControls({
  step,
  onScore,
  label,
}: {
  step: number;
  onScore: (delta: number) => void;
  label: string;
}) {
  const [custom, setCustom] = useState<string | null>(null);
  const value = custom === null ? null : parseScore(custom);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === null || value === 0) return;
    onScore(value);
    setCustom(null);
  };

  if (custom !== null) {
    return (
      <form className={styles.customRow} onSubmit={submit}>
        {/* Phone number pads have no minus key, so the sign gets its own button. */}
        <button
          type="button"
          className={styles.btnGhost}
          aria-label="Flip sign"
          onClick={() => setCustom((c) => (c ?? "").trim().replace(/^[+\u2212-]?/, (m) => (m === "-" || m === "\u2212" ? "" : "-")))}
        >
          ±
        </button>
        <input
          className={styles.customInput}
          inputMode="numeric"
          autoFocus
          placeholder="e.g. 12 or -3"
          aria-label={`Custom score for ${label}`}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setCustom(null)}
        />
        <button type="submit" className={styles.btnAccent} disabled={value === null || value === 0}>
          {value ? signed(value) : "Add"}
        </button>
        <button type="button" className={styles.btnGhost} onClick={() => setCustom(null)} aria-label="Cancel">
          ✕
        </button>
      </form>
    );
  }

  return (
    <div className={styles.presets} role="group" aria-label={`Score ${label}`}>
      <div className={styles.presetGroup}>
        <button type="button" className={styles.preset} onClick={() => onScore(-1)} aria-label={`${label} minus 1`}>
          {signed(-1)}
        </button>
        <button type="button" className={styles.preset} onClick={() => onScore(1)} aria-label={`${label} plus 1`}>
          +1
        </button>
      </div>
      {step !== 0 && step !== 1 && step !== -1 && (
        <button
          type="button"
          className={`${styles.preset} ${styles.presetStep}`}
          onClick={() => onScore(step)}
          aria-label={`${label} ${signed(step)}`}
        >
          {signed(step)}
        </button>
      )}
      <button type="button" className={`${styles.preset} ${styles.presetCustom}`} onClick={() => setCustom("")}>
        Custom
      </button>
    </div>
  );
}
