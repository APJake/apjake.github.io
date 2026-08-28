import { projects } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import styles from "./SelectedWork.module.css";

/**
 * Screenshot slot. Deliberately a marked placeholder rather than invented UI —
 * real Play Store captures drop in at the same 1080x1920 ratio with no relayout.
 */
function Shot({ src, name }: { src: string | null; name: string }) {
  return (
    <div className={styles.device}>
      <div className={styles.screen}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`${name} on Android`} className={styles.shot} />
        ) : (
          <>
            <span className={`${styles.bracket} ${styles.tl}`} />
            <span className={`${styles.bracket} ${styles.tr}`} />
            <span className={`${styles.bracket} ${styles.bl}`} />
            <span className={`${styles.bracket} ${styles.br}`} />
            <span className={styles.glow} />
            <p className={`monoLabel ${styles.slotLabel}`}>
              Play Store
              <br />
              screenshot
            </p>
            <p className={`mono ${styles.slotDim}`}>1080 × 1920</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SelectedWork() {
  return (
    <section id="work" className={styles.section} aria-labelledby="work-heading">
      <div className="shell">
        <div id="work-heading">
          <SectionHead
            kicker="Work"
            title="SELECTED WORK"
            note="Three of the things I have shipped. The rest — insurance, HR, eSports, a hiking notebook — live on the work page."
          />
        </div>

        <hr className="rule" />

        <ul className={styles.list}>
          {projects.map((p, i) => (
            <li key={p.name} className={styles.item}>
              <Reveal className={`${styles.entry} ${i % 2 === 1 ? styles.flip : ""}`}>
                <div className={styles.text}>
                  <p className={styles.index}>
                    <span className={`mono ${styles.indexNum}`}>{p.index}</span>
                    <span className={styles.indexLine} aria-hidden="true" />
                  </p>
                  <h3 className={`display ${styles.name}`}>
                    {p.href ? (
                      <a href={p.href} className={styles.nameLink} target="_blank" rel="noreferrer">
                        {p.name}
                      </a>
                    ) : (
                      p.name
                    )}
                  </h3>
                  <p className={styles.desc}>{p.description}</p>
                  <p className={styles.detail}>{p.detail}</p>
                  <ul className={styles.meta}>
                    {p.meta.map((m) => (
                      <li key={m} className={styles.metaRow}>
                        <span className={styles.tick} aria-hidden="true" />
                        <span className="monoLabel">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.deviceWrap}>
                  <Shot src={p.shot} name={p.name} />
                </div>
              </Reveal>
              <hr className="rule" />
            </li>
          ))}
        </ul>

        <p className={styles.allWork}>
          <a className={styles.allWorkLink} href="/work/">
            <span className={`monoLabel ${styles.allWorkText}`}>See all work</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.arrow}>
              <path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
            </svg>
          </a>
        </p>
      </div>
    </section>
  );
}
