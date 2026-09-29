import type { Metadata } from "next";
import CreateBoard from "@/components/scoreboard/CreateBoard";

export const metadata: Metadata = { title: "Create scoreboard" };

export default function CreatePage() {
  return <CreateBoard />;
}
