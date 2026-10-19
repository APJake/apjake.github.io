---
blogs:
  - id: blog-4
    title: "Shipping one Android app in English, Myanmar and Thai"
    description: "Practical notes on strings, plurals, per-app language switching, fonts and testing when one app has to speak three languages."
    coverImageUrl: /blogs/blog-4/cover.jpg
    date: 2026-10-19
    category: android
  - id: blog-2
    title: "A debt tracker that works offline (မြန်မာ)"
    description: "Building Jar Gyi with Kotlin and Room for the Myanmar market — no account, no network, and every entry stays on the device."
    coverImageUrl: /blogs/blog-2/cover.jpg
    date: 2026-05-02
    category: product
  - id: blog-3
    title: "Notes from ICPC Yangon 2019"
    description: "What I learned competing in the regional round, and what competitive programming actually teaches you about shipping software."
    coverImageUrl: /blogs/blog-3/cover.jpg
    date: 2026-01-10
    category: career
---

# Blogs

Long-form notes on Android, Compose, Flutter, and shipping software from
Da Nang. Each post lives in its own `blog-N-LL.md` file (one file per
language). A post can have a Myanmar, English and Thai version — the
default language is the one with `default: true` in its frontmatter.

Each entry's `category` is one of:

| id | Shown as |
| --- | --- |
| `android` | Android & Kotlin |
| `flutter` | Flutter |
| `product` | Building Products |
| `career` | Career & Competitions |

A post with no category (or one not in this list) is listed under "Other".
Non-tech stories don't go here — they live in `contents/life/`.
