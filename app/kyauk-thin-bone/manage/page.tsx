import { Suspense } from "react";
import type { Metadata } from "next";
import BoardManage from "@/components/scoreboard/BoardManage";
import { BoardMessage } from "@/components/scoreboard/BoardMessage";

export const metadata: Metadata = { title: "Scoring", robots: { index: false } };

// See view/page.tsx: ?id= is only known client-side.
export default function ManagePage() {
  return (
    <Suspense fallback={<BoardMessage state={{ status: "loading" }} />}>
      <BoardManage />
    </Suspense>
  );
}
