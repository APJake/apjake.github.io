import Image from "next/image";
import { hero, person } from "@/lib/content";
import portrait from "@/public/portrait.jpg";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading" data-track-section="hero">
      <div className={styles.glow} aria-hidden="true" />

      <figure className={styles.portrait}>
        <Image
          src={portrait}
          alt={`${person.name}, ${person.role}`}
          placeholder="blur"
          priority
          sizes="(max-width: 1024px) 100vw, 480px"
          className={styles.portraitImg}
        />
        <span className={styles.tone} aria-hidden="true" />
        <span className={styles.warm} aria-hidden="true" />
      </figure>

      <div className={`shell ${styles.content}`}>
        {/* Line breaks are authored, never wrapped. The last line splits into
            two on narrow screens so the display size can stay large. */}
        <h1 id="hero-heading" className={styles.headline}>
          <span className={styles.line} style={{ animationDelay: "0ms" }}>
            {hero.lines[0]}
          </span>
          <span className={styles.line} style={{ animationDelay: "80ms" }}>
            {hero.lines[1]}
          </span>
          <span className={styles.line} style={{ animationDelay: "160ms" }}>
            {hero.lines[2]}
          </span>
          <span className={`${styles.line} ${styles.lineLast}`} style={{ animationDelay: "240ms" }}>
            <span className={styles.word}>USEFUL</span>{" "}
            <span className={styles.word}>
              THINGS<span className={styles.dot}>.</span>
            </span>
          </span>
        </h1>

        <p className={`mono ${styles.disciplines}`}>
          {hero.disciplines.map((d, i) => (
            <span key={d}>
              {i > 0 && <span className={styles.mid}> · </span>}
              {d}
            </span>
          ))}
        </p>
      </div>

      <div className={`shell ${styles.proofShell}`}>
        <div className={styles.proof}>
          <hr className="rule" />
          <ul className={styles.proofRow}>
            {hero.proof.map((p) => (
              <li key={p} className={styles.proofItem}>
                <span className={styles.tick} aria-hidden="true" />
                <span className="monoLabel">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.cue} aria-hidden="true">
          <span className="monoLabel">Scroll</span>
          <span className={styles.cueTrack}>
            <span className={styles.cueFill} />
          </span>
        </div>
      </div>
    </section>
  );
}
