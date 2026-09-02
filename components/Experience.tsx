import { recognition, roles } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import styles from "./Experience.module.css";

export default function Experience() {
  return (
    <section id="experience" className={styles.section} aria-labelledby="exp-heading">
      <div className="shell">
        <div id="exp-heading">
          <SectionHead
            kicker="Experience"
            title="WHERE I'VE BUILT"
            note="Four years full time, freelance since 2019. Mostly owning the Android side of a product end to end — architecture, features, testing and releases."
          />
        </div>

        <hr className="rule" />

        <ol className={styles.list}>
          {roles.map((r) => (
            <li key={r.company} className={styles.item}>
              <Reveal className={styles.row}>
                <div className={styles.years}>
                  <p className={`mono ${styles.yearMain}`}>{r.years}</p>
                  <p className={`mono ${styles.yearNote}`}>{r.yearsNote}</p>
                </div>

                <div className={styles.body}>
                  <h3 className={`display ${styles.company}`}>{r.company}</h3>
                  <p className={styles.role}>{r.role}</p>
                  <p className={`monoLabel ${styles.place}`}>{r.place}</p>

                  {r.detail && <p className={styles.detail}>{r.detail}</p>}

                  {r.products && (
                    <ul className={styles.products}>
                      {r.products.map((prod) => (
                        <li key={prod.name} className={styles.product}>
                          <div className={styles.productHead}>
                            <p className={`monoLabel ${styles.productName}`}>{prod.name}</p>
                            <p className={`mono ${styles.productYears}`}>{prod.years}</p>
                          </div>
                          <p className={styles.productText}>{prod.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
              <hr className="rule" />
            </li>
          ))}
        </ol>

        <ul className={styles.recognition}>
          {recognition.map((r) => (
            <li key={r} className={styles.recogItem}>
              <span className={styles.tick} aria-hidden="true" />
              <span className="monoLabel">{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
