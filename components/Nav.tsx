"use client";

import { useEffect, useState } from "react";
import { person } from "@/lib/content";
import styles from "./Nav.module.css";

// Absolute so the nav works from /work/ and /blogs/ as well as the homepage.
const links = [
  { href: "/blogs/", label: "Blog" },
  { href: "/work/", label: "Work" },
  { href: "/#experience", label: "About" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 88);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`shell ${styles.inner}`}>
          <a className={styles.wordmark} href="/" aria-label={`${person.name} — home`}>
            {person.wordmark}
          </a>
          <nav className={styles.links} aria-label="Sections">
            {links.map((l) => (
              <a key={l.href} className={`monoLabel ${styles.link}`} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
