import type { BoardState } from "@/lib/scoreboard/hooks";
import { APP_PATH } from "@/lib/scoreboard/config";
import styles from "./Scoreboard.module.css";

/** Loading / not-found / error states shared by the viewer and the creator screens. */
export function BoardMessage({ state }: { state: Exclude<BoardState, { status: "ready" }> }) {
  if (state.status === "loading") {
    return (
      <p className={styles.loading} role="status">
        Loading scoreboard…
      </p>
    );
  }
  return (
    <div className={styles.notice} role="alert">
      <p className="monoLabel">{state.status === "missing" ? "Not found" : "Something went wrong"}</p>
      <p>
        {state.status === "missing"
          ? "This scoreboard doesn't exist, or the link is incomplete."
          : state.message}
      </p>
      <p>
        <a href={`${APP_PATH}join/`}>Enter a room code instead →</a>
      </p>
    </div>
  );
}
