---
blogs:
  - id: life-1
    title: "How to play Exploding Kittens"
    description: "The rules in five minutes: what every card does, how a turn works, and a few tips so you're not the first one to explode."
    coverImageUrl: /life/blogs/life-1/cover.svg
    date: 2026-10-19
    category: games
---

# Life

Off-work stories, shown at `/life/blogs/` on the site. That page is
deliberately not linked from the homepage or the nav, so these posts stay
separate from the tech writing in `contents/blogs/`.

Posts work exactly like the tech blogs: one `life-N-LL.md` file per language
(`en`, `mm`, `th`), `default: true` on the default one, and the cover in
`public/life/blogs/life-N/`.

Each entry's `category` is one of:

| id | Shown as |
| --- | --- |
| `games` | Games & Play |
| `food` | Food |
| `travel` | Travel |
| `life` | Life & Notes |

A post with no category (or one not in this list) is listed under "Other".
