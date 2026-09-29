"use client";

import { useEffect, useState } from "react";
import { MATCHES_PER_PAGE, type Match, type PlayerRow } from "@/lib/scoreboard/board";
import { signed } from "@/lib/scoreboard/format";
import styles from "./Scoreboard.module.css";

/** Saved matches, newest first, 20 per page. Columns follow `players`. */
export default function MatchHistory({ matches, players }: { matches: Match[]; players: PlayerRow[] }) {
  const pages = Math.max(1, Math.ceil(matches.length / MATCHES_PER_PAGE));
  const [page, setPage] = useState(0);
  useEffect(() => setPage((p) => Math.min(p, pages - 1)), [pages]);

  const rows = matches.slice(page * MATCHES_PER_PAGE, (page + 1) * MATCHES_PER_PAGE);

  return (
    <section className={styles.history} aria-labelledby="history-title">
      <div className={styles.sectionHead}>
        <h2 id="history-title" className="monoLabel">
          Match history
        </h2>
        <span className={styles.meta}>
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </span>
      </div>

      {matches.length === 0 ? (
        <p className={styles.empty}>No matches saved yet.</p>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Match</th>
                  {players.map((p) => (
                    <th scope="col" key={p.id}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.n}>
                    <th scope="row">#{m.n}</th>
                    {players.map((p) => {
                      const v = m.scores?.[p.id];
                      return (
                        <td key={p.id} className={v && v < 0 ? styles.neg : v ? styles.pos : undefined}>
                          {v === undefined ? "—" : signed(v)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <nav className={styles.pager} aria-label="Match history pages">
              <button type="button" className={styles.btnGhost} disabled={page === 0} onClick={() => setPage(page - 1)}>
                ← Newer
              </button>
              <span className={styles.meta}>
                Page {page + 1} of {pages}
              </span>
              <button
                type="button"
                className={styles.btnGhost}
                disabled={page >= pages - 1}
                onClick={() => setPage(page + 1)}
              >
                Older →
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
