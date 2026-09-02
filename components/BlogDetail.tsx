import Link from "next/link";
import type { BlogIndexEntry, BlogPost } from "@/lib/blogs";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./BlogDetail.module.css";

export default function BlogDetail({ blog, post }: { blog: BlogIndexEntry; post: BlogPost }) {
  // Burmese content is rendered with the Noto Sans Myanmar font (registered
  // on <html> in app/layout.tsx). The CSS class adds it on top of the body
  // font so the latin/numeric glyphs keep their normal weight.
  const proseClass = `${styles.prose} ${post.language === "mm" ? styles.mm : ""}`.trim();

  return (
    <article className={styles.section} aria-labelledby="blog-title">
      <div className="shell">
        <header className={styles.head}>
          <p className={`monoLabel ${styles.kicker}`}>Blog</p>
          <h1 id="blog-title" className={`display ${styles.title}`}>
            {blog.title}
          </h1>
          <p className={`monoLabel ${styles.meta}`}>
            <span>{post.date}</span>
            {post.updatedAt && post.updatedAt !== post.date ? (
              <>
                <span aria-hidden="true" className={styles.metaDot} />
                <span>Updated {post.updatedAt}</span>
              </>
            ) : null}
          </p>
          <p className={styles.desc}>{blog.description}</p>
          {blog.languages.length > 1 ? (
            <div className={styles.switcherWrap}>
              <LanguageSwitcher blog={blog} current={post.language} />
            </div>
          ) : null}
        </header>

        <hr className="rule" />

        <div className={proseClass} dangerouslySetInnerHTML={{ __html: post.html }} />

        <p className={styles.back}>
          <Link href="/blogs/" className={styles.backLink}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className={styles.backArrow}
            >
              <path
                d="M17 10H4M9 5l-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="square"
              />
            </svg>
            <span className={`monoLabel ${styles.backText}`}>All posts</span>
          </Link>
        </p>
      </div>
    </article>
  );
}
