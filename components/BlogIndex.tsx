import Link from "next/link";
import type { BlogIndexEntry } from "@/lib/blogs";
import Reveal from "./Reveal";
import styles from "./BlogIndex.module.css";

function formatDate(iso: string) {
  if (!iso) return "";
  // Render as-is (the README is the only place dates are authored; we keep
  // them as YYYY-MM-DD for now). Showing them raw keeps the visual rhythm
  // honest and avoids implicit locale assumptions.
  return iso;
}

export default function BlogIndex({ blogs }: { blogs: BlogIndexEntry[] }) {
  return (
    <section className={styles.section} aria-labelledby="blog-index-heading">
      <div className="shell">
        <header className={styles.head}>
          <p className={`monoLabel ${styles.kicker}`}>Blog</p>
          <h1 id="blog-index-heading" className={`display ${styles.title}`}>
            NOTES
            <br />
            I&apos;VE WRITTEN
          </h1>
          <p className={styles.note}>
            Long-form writing on Android, Compose, Flutter, and shipping
            software from Da Nang. Some posts are written in English, Myanmar
            and Thai.
          </p>
        </header>

        <hr className="rule" />

        {blogs.length === 0 ? (
          <p className={styles.empty}>No posts yet.</p>
        ) : (
          <ul className={styles.list}>
            {blogs.map((b) => (
              <li key={b.id} className={styles.item}>
                <Reveal className={styles.entry}>
                  <Link
                    href={`/blogs/${b.id}/`}
                    className={styles.coverWrap}
                    aria-label={b.title}
                    data-track="select_content"
                    data-track-content-type="blog_post"
                    data-track-content-id={b.id}
                    data-track-placement="cover"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.coverImageUrl} alt="" className={styles.cover} />
                  </Link>
                  <div className={styles.text}>
                    <p className={`monoLabel ${styles.meta}`}>
                      <span>{formatDate(b.date)}</span>
                      <span aria-hidden="true" className={styles.metaDot} />
                      <span>
                        {b.languages.length} {b.languages.length === 1 ? "language" : "languages"}
                      </span>
                    </p>
                    <h2 className={`display ${styles.name}`}>
                      <Link
                        href={`/blogs/${b.id}/`}
                        className={styles.nameLink}
                        data-track="select_content"
                        data-track-content-type="blog_post"
                        data-track-content-id={b.id}
                        data-track-placement="title"
                      >
                        {b.title}
                      </Link>
                    </h2>
                    <p className={styles.desc}>{b.description}</p>
                    <p className={styles.cta}>
                      <Link
                        href={`/blogs/${b.id}/`}
                        className={styles.ctaLink}
                        data-track="select_content"
                        data-track-content-type="blog_post"
                        data-track-content-id={b.id}
                        data-track-placement="read_post"
                      >
                        <span className={`monoLabel ${styles.ctaText}`}>Read post</span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                          aria-hidden="true"
                          className={styles.arrow}
                        >
                          <path
                            d="M3 10h13M11 5l5 5-5 5"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="square"
                          />
                        </svg>
                      </Link>
                    </p>
                  </div>
                </Reveal>
                <hr className="rule" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
