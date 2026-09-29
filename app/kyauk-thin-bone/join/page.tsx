import type { Metadata } from "next";
import JoinBoard from "@/components/scoreboard/JoinBoard";

export const metadata: Metadata = { title: "View scoreboard" };

export default function JoinPage() {
  return <JoinBoard />;
}
