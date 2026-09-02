"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Stagger in ms, applied as a transition delay once the element enters. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
};

/**
 * Reveals children once they scroll into view. If IntersectionObserver is
 * missing or the visitor prefers reduced motion, everything is shown at once —
 * the hidden state is only ever applied by this component after mount.
 */
export default function Reveal({ children, delay = 0, className, as = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    setArmed(true);

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as React.ElementType;
  const classes = [armed ? "reveal" : "", shown ? "isIn" : "", className].filter(Boolean).join(" ");

  return (
    <Tag ref={ref} className={classes} style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
