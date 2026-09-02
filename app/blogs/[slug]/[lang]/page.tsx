import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Contact from "@/components/Contact";
import BlogDetail from "@/components/BlogDetail";
import { getBlogIndexEntry, getBlogPost, getNonDefaultBlogPaths, type Language } from "@/lib/blogs";
import { person } from "@/lib/content";

export async function generateStaticParams() {
  const paths = await getNonDefaultBlogPaths();
  return paths.map(({ slug, lang }) => ({ slug, lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}): Promise<Metadata> {
  const { slug, lang } = await params;
  const entry = await getBlogIndexEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.title} — ${person.name}`,
    description: entry.description,
  };
}

export default async function BlogLangPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;
  const entry = await getBlogIndexEntry(slug);
  if (!entry) notFound();
  // Only render if (slug, lang) is a real non-default pair; the canonical
  // default-language URL is owned by app/blogs/[slug]/page.tsx.
  if (!entry.languages.includes(lang as Language) || lang === entry.defaultLanguage) notFound();
  const post = await getBlogPost(slug, lang as Language);
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
