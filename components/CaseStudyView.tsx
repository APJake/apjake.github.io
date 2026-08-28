import type { CaseStudy } from "@/lib/content";
import Reveal from "./Reveal";
import styles from "./CaseStudyView.module.css";

export default function CaseStudyView({ study }: { study: CaseStudy }) {
  return (
    <article className={styles.article}>
      <div className="shell">
        <header className={styles.head}>
          <p className={`monoLabel ${styles.kicker}`}>Case study</p>
          <h1 className={`display ${styles.title}`}>{study.name}</h1>
          <p className={styles.tagline}>{study.tagline}</p>

          <dl className={styles.facts}>
            {study.facts.map((f) => (
              <div key={f.label} className={styles.fact}>
                <dt className={`monoLabel ${styles.factLabel}`}>{f.label}</dt>
                <dd className={`mono ${styles.factValue}`}>{f.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <hr className="rule" />

        <Reveal>
          <section className={styles.intro} aria-label="Overview">
            <p className={styles.introText}>{study.intro}</p>
            <ul className={styles.owns}>
              {study.owns.map((o) => (
                <li key={o} className={styles.own}>
                  <span className={styles.tick} aria-hidden="true" />
                  <span className="monoLabel">{o}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <section aria-label="What changed">
          <ol className={styles.moves}>
            {study.moves.map((m, i) => (
              <li key={m.title} className={styles.move}>
                <Reveal className={styles.moveInner}>
                  <p className={`mono ${styles.moveIndex}`} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div className={styles.moveMetric}>
                    {/* The number is the headline; the sentence is the evidence. */}
                    <p className={`display ${styles.metric}`}>{m.metric}</p>
                    <p className={`monoLabel ${styles.metricNote}`}>{m.metricNote}</p>
                  </div>
                  <div className={styles.moveText}>
                    <h2 className={styles.moveTitle}>{m.title}</h2>
                    <p className={styles.moveBody}>{m.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        <Reveal>
          <aside className={styles.beyond}>
            <p className={styles.beyondText}>{study.beyond}</p>
          </aside>
        </Reveal>

        <section className={styles.stackSection} aria-label="Stack">
          <h2 className={`monoLabel ${styles.stackHeading}`}>Stack</h2>
          <ul className={styles.stack}>
            {study.stack.map((s) => (
              <li key={s.title} className={styles.stackGroup}>
                <h3 className={`monoLabel ${styles.stackTitle}`}>{s.title}</h3>
                <ul className={styles.tags}>
                  {s.items.map((item) => (
                    <li key={item} className={styles.tag}>
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <p className={styles.back}>
          <a className={styles.backLink} href="/work/">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.arrow}>
              <path d="M17 10H4M9 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
            </svg>
            <span className={`monoLabel ${styles.backText}`}>All work</span>
          </a>
        </p>
      </div>
    </article>
  );
}
