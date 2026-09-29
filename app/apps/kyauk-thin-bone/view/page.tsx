import { Suspense } from "react";
import type { Metadata } from "next";
import BoardView from "@/components/scoreboard/BoardView";
import { BoardMessage } from "@/components/scoreboard/BoardMessage";

export const metadata: Metadata = { title: "Scoreboard" };

// The board id is in ?board=, which a static export only knows in the browser,
// so the view renders client-side inside this boundary.
export default function ViewPage() {
  return (
    <Suspense fallback={<BoardMessage state={{ status: "loading" }} />}>
      <BoardView />
    </Suspense>
  );
}
