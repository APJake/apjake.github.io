import Link from "next/link";
import type { BlogIndexEntry, Language } from "@/lib/blogs";
import styles from "./LanguageSwitcher.module.css";

const LABELS: Record<Language, string> = {
  en: "EN",
  mm: "MM",
  th: "TH",
};
const FULL: Record<Language, string> = {
  en: "English",
  mm: "မြန်မာ",
  th: "ไทย",
};

export default function LanguageSwitcher({
  blog,
  current,
}: {
  blog: BlogIndexEntry;
  current: Language;
}) {
  return (
    <ul className={`monoLabel ${styles.list}`} aria-label="Language">
      {blog.languages.map((lang) => {
        const href = lang === blog.defaultLanguage ? `/blogs/${blog.id}/` : `/blogs/${blog.id}/${lang}/`;
        const active = lang === current;
        return (
          <li key={lang}>
            <Link
              href={href}
              className={`${styles.pill} ${active ? styles.active : ""}`}
              aria-current={active ? "true" : undefined}
              aria-label={FULL[lang]}
            >
              {LABELS[lang]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
