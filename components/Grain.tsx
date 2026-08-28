import styles from "./Grain.module.css";

/**
 * Full-viewport film grain. Decorative and non-interactive; the SVG noise is
 * inlined so it costs no request.
 */
export default function Grain() {
  return <div className={styles.grain} aria-hidden="true" />;
}
