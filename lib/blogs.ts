/**
 * Build-time loader for the Blogs section.
 *
 * Content lives in `contents/blogs/` (NOT in `public/`) and is read directly
 * from disk at build time. We resolve the directory relative to this module
 * (NOT `process.cwd()`) because Next.js's static-export workers do not
 * always have the project root as cwd.
 *
 * The `README.md` frontmatter is the index — every entry is enriched at
 * build time by scanning the directory for `blog-N-LL.md` files, so the
 * list of languages and the default language are derived, not duplicated.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

export type Language = "en" | "mm" | "th";

export type BlogIndexEntry = {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  date: string;
  defaultLanguage: Language;
  languages: Language[];
};

export type BlogPost = {
  id: string;
  language: Language;
  html: string;
  date: string;
  updatedAt?: string;
};

type ReadmeFrontmatter = {
  blogs?: Array<{
    id: string;
    title: string;
    description: string;
    coverImageUrl: string;
    date: string;
  }>;
};

type PostFrontmatter = {
  id: string;
  language: Language;
  default?: boolean;
  date: string;
  updatedAt?: string;
};

// Resolve the content dir relative to this module file, then walk up to
// the project root. Works regardless of `process.cwd()` in workers.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.resolve(__dirname, "..", "contents", "blogs");

// In-memory caches. Each route handler in a build process sees the same
// module instance, so re-reading the same file is a no-op after the first
// call.
const indexCache: { value?: BlogIndexEntry[] } = {};
const postCache = new Map<string, BlogPost>();

const ALL_LANGS = new Set<string>(["en", "mm", "th"]);

const renderer = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify);

async function readIndexFile(): Promise<NonNullable<ReadmeFrontmatter["blogs"]>> {
  const raw = await fs.readFile(path.join(CONTENT_DIR, "README.md"), "utf8");
  const parsed = matter(raw);
  const data = parsed.data as ReadmeFrontmatter;
  // gray-matter parses YAML dates into Date objects; serialise to YYYY-MM-DD
  // so downstream code can treat `date` as a plain string everywhere.
  return (data.blogs ?? []).map((b) => ({
    ...b,
    date: toIsoDate(b.date),
  }));
}

function toIsoDate(d: unknown): string {
  if (!d) return "";
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d);
}

async function readPostFile(id: string, language: Language): Promise<BlogPost | undefined> {
  const filename = `${id}-${language}.md`;
  const full = path.join(CONTENT_DIR, filename);
  let raw: string;
  try {
    raw = await fs.readFile(full, "utf8");
  } catch {
    return undefined;
  }
  const parsed = matter(raw);
  const fm = parsed.data as PostFrontmatter;
  const html = String(await renderer.process(parsed.content));
  return {
    id: fm.id ?? id,
    language: fm.language ?? language,
    html,
    date: toIsoDate(fm.date),
    updatedAt: toIsoDate(fm.updatedAt),
  };
}

/**
 * Discover the available languages for a blog by listing matching files on
 * disk. We use the filesystem as the source of truth so a post with no
 * `default: true` flag still surfaces in the index.
 */
async function discoverLanguages(id: string): Promise<Language[]> {
  const entries = await fs.readdir(CONTENT_DIR);
  const prefix = `${id}-`;
  const langs: Language[] = [];
  for (const e of entries) {
    if (!e.startsWith(prefix) || !e.endsWith(".md")) continue;
    const lang = e.slice(prefix.length, e.length - 3);
    if (ALL_LANGS.has(lang)) langs.push(lang as Language);
  }
  return langs.sort();
}

async function discoverDefaultLanguage(id: string, languages: Language[]): Promise<Language> {
  for (const lang of languages) {
    const raw = await fs.readFile(path.join(CONTENT_DIR, `${id}-${lang}.md`), "utf8");
    const parsed = matter(raw);
    if ((parsed.data as PostFrontmatter).default === true) return lang;
  }
  // Fall back to English if no file claims default, then to whatever exists.
  if (languages.includes("en")) return "en";
  return languages[0]!;
}

async function buildIndex(): Promise<BlogIndexEntry[]> {
  const entries = await readIndexFile();
  const enriched: BlogIndexEntry[] = [];
  for (const e of entries) {
    const languages = await discoverLanguages(e.id);
    if (languages.length === 0) continue;
    const defaultLanguage = await discoverDefaultLanguage(e.id, languages);
    enriched.push({
      id: e.id,
      title: e.title,
      description: e.description,
      coverImageUrl: e.coverImageUrl,
      date: e.date,
      defaultLanguage,
      languages,
    });
  }
  // Newest first. The YAML preserves author order, so this is a real sort.
  enriched.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return enriched;
}

export async function getAllBlogs(): Promise<BlogIndexEntry[]> {
  if (!indexCache.value) indexCache.value = await buildIndex();
  return indexCache.value;
}

export async function getBlogIndexEntry(id: string): Promise<BlogIndexEntry | undefined> {
  const all = await getAllBlogs();
  return all.find((b) => b.id === id);
}

export async function getBlogPost(id: string, language: Language): Promise<BlogPost | undefined> {
  if (!ALL_LANGS.has(language)) return undefined;
  const key = `${id}/${language}`;
  const cached = postCache.get(key);
  if (cached) return cached;
  const post = await readPostFile(id, language);
  if (post) postCache.set(key, post);
  return post;
}

export async function getAllBlogIds(): Promise<string[]> {
  const all = await getAllBlogs();
  return all.map((b) => b.id);
}

export async function getNonDefaultBlogPaths(): Promise<Array<{ slug: string; lang: Language }>> {
  const all = await getAllBlogs();
  const paths: Array<{ slug: string; lang: Language }> = [];
  for (const b of all) {
    for (const lang of b.languages) {
      if (lang !== b.defaultLanguage) paths.push({ slug: b.id, lang });
    }
  }
  return paths;
}
