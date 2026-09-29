import { totals, workGroups } from "@/lib/content";
import Reveal from "./Reveal";
import styles from "./WorkIndex.module.css";

export default function WorkIndex() {
  // Numbering runs unbroken across both groups, so the index reads as one list.
  let n = 0;

  return (
    <section className={styles.section} aria-labelledby="work-index-heading">
      <div className="shell">
        <header className={styles.head}>
          <p className={`monoLabel ${styles.kicker}`}>Work</p>
          <h1 id="work-index-heading" className={`display ${styles.title}`}>
            EVERYTHING
            <br />
            I&apos;VE SHIPPED
          </h1>
          <p className={styles.note}>
            {totals.products} products across Android and Flutter, for a Singapore studio, for clients in
            Myanmar and Thailand, and for myself. Together they have passed {totals.downloads}{" "}
            downloads on Google Play.
          </p>
        </header>

        {workGroups.map((group) => (
          <div key={group.title} className={styles.group}>
            <div className={styles.groupHead}>
              <h2 className={`monoLabel ${styles.groupTitle}`}>{group.title}</h2>
              <p className={styles.groupNote}>{group.note}</p>
            </div>

            <ol className={styles.list}>
              {group.entries.map((e) => {
                n += 1;
                const num = String(n).padStart(2, "0");
                return (
                  <li key={e.name} className={styles.item}>
                    <Reveal className={styles.entry}>
                      <p className={`mono ${styles.index}`} aria-hidden="true">
                        {num}
                      </p>
                      <div className={styles.text}>
                        <h3 className={`display ${styles.name}`}>
                          {e.href ? (
                            <a
                              className={styles.nameLink}
                              href={e.href}
                              data-track="select_content"
                              data-track-content-type="project"
                              data-track-content-id={e.name}
                              {...(e.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                            >
                              {e.name}
                            </a>
                          ) : (
                            e.name
                          )}
                        </h3>
                        <p className={styles.line}>{e.line}</p>
                        <ul className={styles.meta}>
                          {e.meta.map((m) => (
                            <li key={m} className={styles.metaItem}>
                              <span className={styles.tick} aria-hidden="true" />
                              <span className="monoLabel">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
