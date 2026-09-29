import styles from "./WhosTheFirst.module.css";

type Props = {
  go: boolean;
  enabled: boolean;
  label: string;
  sub: string | null;
  onTap: (timeStamp: number) => void;
};

/**
 * Reacts on pointerdown, not click: click fires on release and adds the
 * press duration to the reaction time. Uses aria-disabled rather than
 * disabled so keyboard focus survives the switch to GO.
 */
export default function TapPad({ go, enabled, label, sub, onTap }: Props) {
  return (
    <button
      type="button"
      className={`${styles.pad} ${go ? styles.padGo : ""}`}
      aria-disabled={!enabled}
      aria-live="assertive"
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        onTap(e.timeStamp);
      }}
      onKeyDown={(e) => {
        if (e.repeat || (e.key !== " " && e.key !== "Enter")) return;
        e.preventDefault();
        onTap(e.timeStamp);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className={`display ${styles.padLabel}`}>{label}</span>
      {sub && <span className={`monoLabel ${styles.padSub}`}>{sub}</span>}
    </button>
  );
}
