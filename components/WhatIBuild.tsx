import { capabilities, library } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import styles from "./WhatIBuild.module.css";

export default function WhatIBuild() {
  return (
    <section id="build" className={styles.section} aria-labelledby="build-heading" data-track-section="what_i_build">
      <div className="shell">
        <div id="build-heading">
          <SectionHead kicker="What I build" title="THE WORK ITSELF" />
        </div>

        {/* The library gets a block of its own. On the CV it is a bullet; it is
            the clearest evidence that the work outlives the assignment. */}
        <Reveal>
          <article className={styles.feature}>
            <p className={`monoLabel ${styles.featureLabel}`}>{library.label}</p>
            <h3 className={`display ${styles.featureTitle}`}>{library.title}</h3>
            <p className={styles.featureText}>{library.text}</p>
          </article>
        </Reveal>

        <ul className={styles.grid}>
          {capabilities.map((c, i) => (
            <li key={c.title}>
              <Reveal delay={i * 60}>
                <div className={styles.card}>
                  <h3 className={`monoLabel ${styles.cardTitle}`}>{c.title}</h3>
                  <ul className={styles.tags}>
                    {c.items.map((item) => (
                      <li key={item} className={styles.tag}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
