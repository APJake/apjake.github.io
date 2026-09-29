"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { readConsent, startAnalytics, track, type EventParams } from "@/lib/analytics";

const READ_MARKS = [25, 50, 75, 100];

/** `data-track-content-type` → dataset `trackContentType` → `content_type`. */
function paramsFrom(el: HTMLElement): EventParams {
  const params: EventParams = {};
  for (const [key, value] of Object.entries(el.dataset)) {
    if (key === "track" || !key.startsWith("track")) continue;
    params[key.slice(5).replace(/[A-Z]/g, (c, i) => (i ? "_" : "") + c.toLowerCase())] = value;
  }
  return params;
}

/**
 * Site-wide tracking, mounted once in the root layout. Components opt in with
 * data attributes and stay server components:
 *
 * - `data-track="<event>"` plus `data-track-<param>="…"` → event on click
 * - `data-track-section="<name>"` → `section_view` once it scrolls into view
 * - `data-track-read="<blog id>"` → `blog_read_progress` at 25/50/75/100%
 */
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (readConsent() === "granted") startAnalytics();

    // Capture phase, so the event is queued before a link navigates away.
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      if (el instanceof HTMLElement && el.dataset.track) track(el.dataset.track, paramsFrom(el));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    // Wait a frame so document.title reflects the new route's metadata.
    const id = requestAnimationFrame(() =>
      track("page_view", { page_path: pathname, page_title: document.title }),
    );
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          track("section_view", { section: el.dataset.trackSection, page_path: pathname });
          io.unobserve(el);
        }
      },
      // Counts once the section's top reaches the upper 60% of the viewport.
      { rootMargin: "0px 0px -40% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-track-section]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const articles = Array.from(document.querySelectorAll<HTMLElement>("[data-track-read]"));
    if (articles.length === 0) return;
    const sent = new Map<HTMLElement, Set<number>>(articles.map((el) => [el, new Set()]));
    let frame = 0;

    const measure = () => {
      frame = 0;
      for (const el of articles) {
        const rect = el.getBoundingClientRect();
        const read = rect.height > 0 ? ((window.innerHeight - rect.top) / rect.height) * 100 : 0;
        const done = sent.get(el)!;
        for (const mark of READ_MARKS) {
          if (read < mark || done.has(mark)) continue;
          done.add(mark);
          track("blog_read_progress", {
            blog_id: el.dataset.trackRead,
            language: el.dataset.trackLanguage,
            percent: mark,
          });
        }
      }
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
