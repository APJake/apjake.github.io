"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/scoreboard/board";
import ScoreInput from "./ScoreInput";
import styles from "./Scoreboard.module.css";

/**
 * Title, description, default score, preset button and the match-by-match
 * toggle. Used on the setup screen and, for live edits, on the creator screen.
 * Text fields report on blur so typing doesn't write every keystroke.
 */
export default function BoardSettings({
  value,
  onChange,
  idPrefix,
}: {
  value: Settings;
  onChange: (patch: Partial<Settings>) => void;
  idPrefix: string;
}) {
  const [title, setTitle] = useState(value.title);
  const [description, setDescription] = useState(value.description);
  useEffect(() => setTitle(value.title), [value.title]);
  useEffect(() => setDescription(value.description), [value.description]);

  const id = (k: string) => `${idPrefix}-${k}`;

  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label htmlFor={id("title")} className="monoLabel">
          Title <span className={styles.optional}>optional</span>
        </label>
        <input
          id={id("title")}
          className={styles.input}
          maxLength={80}
          placeholder="Friday night cards"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() !== value.title && onChange({ title: title.trim() })}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={id("desc")} className="monoLabel">
          Description <span className={styles.optional}>optional</span>
        </label>
        <textarea
          id={id("desc")}
          className={styles.input}
          rows={2}
          maxLength={280}
          placeholder="First to 100 wins"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => description.trim() !== value.description && onChange({ description: description.trim() })}
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor={id("default")} className="monoLabel">
            Default score
          </label>
          <ScoreInput
            id={id("default")}
            label="Default score"
            value={value.defaultScore}
            onCommit={(n) => onChange({ defaultScore: n })}
          />
          <p className={styles.hint}>Starting score for new players.</p>
        </div>
        <div className={styles.field}>
          <label htmlFor={id("step")} className="monoLabel">
            Preset button
          </label>
          <ScoreInput id={id("step")} label="Preset button" value={value.step} onCommit={(n) => onChange({ step: n })} />
          <p className={styles.hint}>The third quick button, next to −1 and +1.</p>
        </div>
      </div>

      <label className={styles.toggle}>
        <input
          type="checkbox"
          role="switch"
          checked={value.matchByMatch}
          onChange={(e) => onChange({ matchByMatch: e.target.checked })}
        />
        <span className={styles.toggleTrack} aria-hidden="true" />
        <span>
          <span className={styles.toggleLabel}>Match by match</span>
          <span className={styles.hint}>
            {value.matchByMatch
              ? "Buttons score the current match. Save Match adds it to the totals and keeps a history."
              : "Buttons change the total directly. No match history."}
          </span>
        </span>
      </label>
    </div>
  );
}
