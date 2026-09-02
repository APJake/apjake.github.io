import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Contact from "@/components/Contact";
import BlogDetail from "@/components/BlogDetail";
import { getAllBlogIds, getBlogIndexEntry, getBlogPost } from "@/lib/blogs";
import { person } from "@/lib/content";

export async function generateStaticParams() {
  const ids = await getAllBlogIds();
  return ids.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getBlogIndexEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.title} — ${person.name}`,
    description: entry.description,
  };
}

export default async function BlogDefaultLangPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getBlogIndexEntry(slug);
  if (!entry) notFound();
  const post = await getBlogPost(slug, entry.defaultLanguage);
  if (!post) notFound();

  return (
    <>
      <Nav />
      <main id="main">
        <BlogDetail blog={entry} post={post} />
        <Contact />
      </main>
    </>
  );
}
