import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Contact from "@/components/Contact";
import BlogIndex from "@/components/BlogIndex";
import { getAllBlogs } from "@/lib/blogs";
import { person } from "@/lib/content";

export const metadata: Metadata = {
  title: `Blog — ${person.name}`,
  description:
    "Long-form notes on Android, Compose, Flutter, and shipping software from Da Nang. Some posts are written in English, Myanmar and Thai.",
};

export default async function BlogsPage() {
  const blogs = await getAllBlogs();
  return (
    <>
      <Nav />
      <main id="main">
        <BlogIndex blogs={blogs} />
        <Contact />
      </main>
    </>
  );
}
