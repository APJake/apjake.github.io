import { apps, statusLabel } from "@/lib/apps";
import Reveal from "./Reveal";
import styles from "./AppsIndex.module.css";

export default function AppsIndex() {
  return (
    <section className={styles.section} aria-labelledby="apps-heading">
      <div className="shell">
        <header className={styles.head}>
          <p className={`monoLabel ${styles.kicker}`}>Apps</p>
          <h1 id="apps-heading" className={`display ${styles.title}`}>
            SMALL THINGS
            <br />
            I BUILD FOR FUN
          </h1>
          <p className={styles.note}>
            Mini web apps and experiments. Some are finished, some are still being built.
          </p>
        </header>

        <ul className={styles.grid}>
          {apps.map((app) => (
            <li key={app.slug}>
              <Reveal className={styles.card}>
                <a
                  className={styles.link}
                  href={app.href}
                  data-track="select_content"
                  data-track-content-type="app"
                  data-track-content-id={app.slug}
                >
                  <div className={styles.media}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={app.image} alt="" width={1200} height={750} loading="lazy" />
                  </div>
                  <div className={styles.body}>
                    <div className={styles.row}>
                      <h2 className={`display ${styles.name}`}>{app.title}</h2>
                      <span className={`monoLabel ${styles.status} ${styles[app.status]}`}>
                        {statusLabel[app.status]}
                      </span>
                    </div>
                    <p className={styles.description}>{app.description}</p>
                  </div>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
