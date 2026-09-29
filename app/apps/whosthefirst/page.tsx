import type { Metadata } from "next";
import WhosTheFirst from "@/components/whosthefirst/WhosTheFirst";

export const metadata: Metadata = {
  title: "Who's the first",
  description: "Open a room, wait for GO, tap. Every player's reaction time ranked to the millisecond.",
};

export default function WhosTheFirstPage() {
  return <WhosTheFirst />;
}
