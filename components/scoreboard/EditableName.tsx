"use client";

import { useState } from "react";
import styles from "./Scoreboard.module.css";

/** A name that becomes a text field when tapped. Empty input reverts. */
export default function EditableName({ value, onSave }: { value: string; onSave: (name: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    const next = (draft ?? "").trim().slice(0, 40);
    if (next && next !== value) onSave(next);
    setDraft(null);
  };

  if (draft === null) {
    return (
      <button type="button" className={styles.name} onClick={() => setDraft(value)} title="Tap to rename">
        {value}
      </button>
    );
  }

  return (
    <input
      className={styles.nameInput}
      autoFocus
      maxLength={40}
      aria-label="Player name"
      value={draft}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") setDraft(null);
      }}
    />
  );
}
