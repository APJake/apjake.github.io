"use client";

import { useEffect, useState } from "react";
import { num, parseScore } from "@/lib/scoreboard/format";
import styles from "./Scoreboard.module.css";

/**
 * Integer field that keeps its own text while typing and only reports a value
 * on blur/Enter, so a half-typed "-" never reaches the database.
 */
export default function ScoreInput({
  value,
  onCommit,
  label,
  id,
}: {
  value: number;
  onCommit: (n: number) => void;
  label: string;
  id?: string;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = () => {
    const n = parseScore(text);
    if (n === null) setText(String(value));
    else if (n !== value) onCommit(n);
  };

  return (
    <input
      id={id}
      className={styles.numInput}
      // Full keyboard rather than a number pad: starting scores can be negative.
      inputMode="text"
      autoComplete="off"
      aria-label={label}
      placeholder={num(0)}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}
