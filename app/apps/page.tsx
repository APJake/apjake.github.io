import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Contact from "@/components/Contact";
import AppsIndex from "@/components/AppsIndex";
import { person } from "@/lib/content";

export const metadata: Metadata = {
  title: `Apps — ${person.name}`,
  description: "Small web apps and experiments I build for fun.",
};

export default function AppsPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <AppsIndex />
        <Contact />
      </main>
    </>
  );
}
