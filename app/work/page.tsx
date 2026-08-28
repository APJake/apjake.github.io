import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Contact from "@/components/Contact";
import WorkIndex from "@/components/WorkIndex";
import { person } from "@/lib/content";

export const metadata: Metadata = {
  title: `Work — ${person.name}`,
  description:
    "Every Android and Flutter product I have shipped, for clients and for myself.",
};

export default function WorkPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <WorkIndex />
        <Contact />
      </main>
    </>
  );
}
