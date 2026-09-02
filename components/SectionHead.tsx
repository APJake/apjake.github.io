import styles from "./SectionHead.module.css";

export default function SectionHead({
  kicker,
  title,
  note,
}: {
  kicker: string;
  title: React.ReactNode;
  note?: string;
}) {
  return (
    <header className={styles.head}>
      <p className={`monoLabel ${styles.kicker}`}>{kicker}</p>
      <h2 className={`display ${styles.title}`}>{title}</h2>
      {note && <p className={styles.note}>{note}</p>}
    </header>
  );
}
