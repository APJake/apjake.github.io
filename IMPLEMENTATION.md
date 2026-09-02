# JAKE — Portfolio Implementation Plan

Personal site for **Aung Min Khant**, Android engineer, at `apjake.github.io`.
This is the master document: every design decision, the reasoning behind it, the
content model, the build and deploy path, and what is still open.

Companion documents:

- `design/01-design-system-and-hero.md` — the original design brief for the
  foundations and hero, kept because it records the first pass verbatim.
- `design/canvas/*.dc.html` — the source artboards behind the build.
- Published design canvas — https://claude.ai/code/artifact/a1ac64ca-c7cc-4701-8fcd-dc23c887df79

---

## 1. What this is

A portfolio, not an online résumé. The distinction drives everything below: the
site is organised around **things that were built and shipped**, with the
employment history supporting that story rather than leading it.

**Positioning:** `ANDROID ENGINEER WHO BUILDS USEFUL THINGS.`

**Primary audience:** recruiters and hiring engineers, in that order. Recruiters
scan for scale and recency; engineers read for judgement. The layout serves the
first in the top fold and the second everywhere below it.

**Brand name:** `JAKE`. Short, memorable, and consistent with the existing
handles (`apjake.github.io`, `github.com/apjake`, `@AP_Jake`). The full legal
name appears in the footer, the About copy and the CV — anywhere a recruiter
would cross-reference against LinkedIn.

---

## 2. Status at a glance

| Area | State |
| --- | --- |
| Design system | Locked, implemented, documented |
| Homepage | Built, verified in browser |
| `/work` index | Built, verified |
| `/work/cdg-zig` case study | Built, verified |
| Further case studies | Route exists; each is a data entry |
| 404 page | **Not designed** — still Next.js stock |
| Play Store screenshots | **Blocked** — placeholders in place |
| Deployment | Workflow written; **Pages source not yet switched** |
| Git push | **Blocked** — GitHub App lacks access to the repo |

---

## 3. Source of truth

Two CVs supplied at the start of the project, used as the only factual source
for every claim on the site:

- `Aung_Min_Khant__Senior_Android_Developer_Resume__v6.0.pdf`
- `Aung_Min_Khant__Mobile_Developer_Resume__v6.0.pdf`

**Rule applied throughout: nothing is invented.** Where a CV hedges a figure
("about 30% faster"), the site keeps the hedge rather than hardening it into a
precise-sounding number. Where no material exists — Jar Gyi, until its privacy
policy was found in this repo — the item was left out rather than written around.

Established facts the site is built on:

- 4 years full time, freelance since 2019
- 2M+ combined Google Play downloads
- Currently Senior Android Developer at Codigo, remote from Da Nang, Vietnam
- Open to roles in Vietnam, Thailand, or remote

---

## 4. Decision log

Every locked decision, with the reason. Reopen any of these by changing the
row and the corresponding token or component.

| # | Decision | Chosen | Why |
| --- | --- | --- | --- |
| 1 | Visual direction | A+B+C blend | Apple/Linear restraint in grid and spacing, editorial oversized type, creative-developer interaction accents. Polished enough for recruiters, opinionated enough to read as engineer-made. |
| 2 | Wordmark | `JAKE` | Matches existing handles; sets as a one-word display mark. Full name in footer and CV. |
| 3 | Headline | `ANDROID ENGINEER WHO BUILDS USEFUL THINGS.` | A claim the CV actually backs, rather than an aspirational line. |
| 4 | Hero proof strip | `2M+ DOWNLOADS · 4 YRS · DA NANG, VN` | The strongest single fact, in the place recruiters scan first. |
| 5 | Portrait | Included, duotone black→amber | With a fully-realised no-portrait variant as insurance. |
| 6 | Theme | Dark only | No light toggle in v1. A toggle roughly doubles token work for no audience benefit here. |
| 7 | Accent | Warm amber `#ffb020` | Premium and Android-adjacent. A hotter orange (`#ff5a1f`) was the louder alternative. |
| 8 | Display face | Bricolage Grotesque 800 | Characterful, tight, holds at 120px. |
| 9 | Body face | Instrument Sans | **Changed from Inter mid-project.** Inter is the most overused interface face on the web and undercuts a site whose premise is engineer-with-taste. Same metrics class, so nothing else moved. |
| 10 | Mono face | JetBrains Mono 500 | Metadata, labels and numbers only — never prose. |
| 11 | Client work visuals | Real Play Store screenshots | Public assets, so no NDA exposure. Slots are placeholders until the URLs arrive. |
| 12 | Framework | Next.js, static export | App Router, TypeScript, no CSS framework. |
| 13 | Styling | CSS Modules + one token file | The design is bespoke; a utility framework would add a vocabulary that fights the tokens. |
| 14 | Homepage project count | Three | Breadth lives on `/work`. A homepage listing everything reads as a résumé. |
| 15 | Homepage lead projects | CDG Zig, BKK Guide MM, Shwe Nar Sin | Biggest professional case, then the product owned end to end including its backend, then the other million-download app. |
| 16 | Writing section | **Cut from v1** | No posts exist. An empty section is worse than no section. The slot went to the internal library instead. |
| 17 | Phone number | **Omitted from the site** | It is on the CV, but a public page is a different exposure than a PDF handed to a named recruiter. |

---

## 5. Design system

Defined once as custom properties in `app/globals.css`. These values are
authoritative; the artboards mirror them.

### 5.1 Colour

```
--bg-base       #0b0b0c    page background, warm near-black
--bg-raised     #131315    cards, device frames
--bg-inset      #080809    recessed wells, screens

--ink-primary   #f2efe9    16.0:1  headlines, body
--ink-secondary #a8a29a     8.0:1  supporting copy
--ink-muted     #8b867d     5.3:1  lowest value allowed to carry copy
--ink-faint     #6b675f     3.4:1  decorative only — middots, slot dimensions

--amber         #ffb020    primary accent
--amber-bright  #ffc04d    hover / active
--amber-dim     #b87a12    pressed, disabled
--amber-glow    rgba(255,176,32,0.16)

--line-hair     rgba(242,239,233,0.10)   1px section rules
--line-strong   rgba(242,239,233,0.18)   emphasised dividers
```

**Amber discipline.** Accent only. Never body copy, never a large filled area.
Permitted uses: the headline's full stop, small meta ticks, link underlines on
hover, focus rings, the portrait duotone, case-study metrics, one radial glow.
**If more than roughly 3% of the viewport is amber, it is wrong.**

**Contrast rule.** `--ink-muted` (5.3:1) is the floor for anything carrying
words. `--ink-faint` is for marks that are not read as text. This was corrected
during implementation — see §11.

### 5.2 Typography

| Token | Size | Face | Line height | Tracking |
| --- | --- | --- | --- | --- |
| `display-xl` | `clamp(3.5rem, 8.4vw, 7.5rem)` | Bricolage 800 | 0.88 | −0.04em |
| `display-l` | `clamp(2.5rem, 5vw, 4.5rem)` | Bricolage 800 | 0.95 | −0.03em |
| `display-m` | `clamp(2rem, 3.4vw, 3rem)` | Bricolage 800 | 1.0 | −0.025em |
| `body-l` | 1.125rem | Instrument Sans 400 | 1.6 | 0 |
| `body` | 1rem | Instrument Sans 400 | 1.65 | 0 |
| `mono-label` | 0.75rem uppercase | JetBrains Mono 500 | 1.2 | 0.12em |
| `mono-meta` | 0.8125rem | JetBrains Mono 500 | 1.4 | 0.06em |

Body copy never exceeds ~68 characters per line. Display type is always tight.
Mono is reserved for metadata, labels and numbers.

Fonts load through `next/font/google`, which self-hosts them at build time —
no runtime request to Google, no layout shift, no third-party dependency at
serve time.

### 5.3 Spacing, grid, geometry

- Spacing scale, 4px base: `4 8 12 16 24 32 48 64 96 128 160 200`
- Grid: 12 columns, max content width 1440px, column 87.33px
- Margins: 64 desktop / 32 tablet / 20 mobile (`--margin`)
- Gutters: 24 desktop / 16 mobile
- Breakpoints: 480 / 600 / 640 / 1024 / 1280
- Radius: 0 on editorial blocks; 4px on chips; 12px only on device frames
- **No drop shadows anywhere.** Depth comes from surface value and hairlines.
  The single exception is the amber radial glow behind the hero portrait and
  in the contact footer.

### 5.4 Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease`)
- Durations: 200ms micro / 400ms element / 700ms entrance
- Hero entrance: headline lines reveal by upward `clip-path` mask, 80ms stagger
- Scroll reveal: `IntersectionObserver`, translate + fade, 700ms
- No opacity-only fades, no slide-ins from off-screen, no bounce
- Everything collapses to instant under `prefers-reduced-motion`

**Interaction budget.** The hero is deliberately quiet — entrance reveal and a
portrait tint shift, nothing else. The payoff is spent on the Selected Work
rows, where hover lifts the device frame, warms its border to amber, extends
the index rule and raises a glow: four things on one gesture, one curve.

### 5.5 Texture

- Film grain across the viewport: inlined SVG noise, 3.5% opacity, `overlay`
  blend, `position: fixed`, non-interactive
- No gradients beyond the two accent glows and the portrait fades
- No glassmorphism except the nav's scrolled backdrop blur

### 5.6 Accessibility rules

- Colour contrast per §5.1; `--ink-muted` is the floor for text
- Focus ring: 2px amber, 2px offset, on `:focus-visible`
- Skip link to `#main` as the first focusable element
- Touch targets ≥44px in interactive mobile contexts
- Authored headline breaks use real elements, so the accessible name reads as
  one continuous sentence regardless of how it is visually broken
- `prefers-reduced-motion` honoured globally
- Scroll-reveal hidden state is applied **only after mount**, so the page is
  fully readable with JavaScript disabled

---

## 6. Information architecture

```
/                     Homepage
  Hero
  Selected Work       3 projects → /work
  Experience          timeline spine + recognition
  What I Build        internal library feature + capability grid
  Contact             footer

/work                 Full index, 9 products, 2 groups
/work/[slug]          Case study — currently cdg-zig
/404                  NOT YET DESIGNED
```

Navigation is two items: **Work** → `/work/`, **About** → `/#experience`.
Absolute hrefs, so they resolve from any route.

---

## 7. Page specifications

### 7.1 Hero

The one compositional move: **the headline overlaps the portrait, and the
portrait sits behind it.** Content occupies columns 1–7, the portrait 8–12
bleeding off the right edge, and the last headline line runs roughly 44px under
the portrait's left edge. A gradient on the portrait's left keeps the type
readable. That overlap is what separates editorial from two-column template.

- Nav 88px, transparent at rest, hairline border and backdrop blur on scroll
- Headline in four authored lines; the full stop is the only amber
- Discipline line: `KOTLIN · COMPOSE · FLUTTER` in mono
- Proof strip on a hairline rule, pinned 64px off the floor
- Scroll cue bottom right, 1px amber travelling line
- Portrait: duotone, shadows to `#0b0b0c`, highlights to amber, midtones held
  back so the face stays readable rather than flat monochrome

**Below 1024px** the portrait stops being a right-hand plane and becomes a
full-bleed band beneath the headline, with the proof strip overlaid on its
scrim. The headline always leads; the portrait never appears above it.

**Below 600px** the last headline line splits in two (`USEFUL` / `THINGS.`) —
see §10.

**Variant B** (`design/canvas/HeroNoPortrait.dc.html`) is the fallback if the
photography is not strong enough: headline steps up to 132px, proof strip
rotates onto the right margin, scroll cue goes horizontal. Designed, not built.

### 7.2 Selected Work

Three entries on alternating sides, separated by hairline rules. Alternating
rather than a card grid: three cards in a row reads as a template, alternating
bands read as edited.

Each entry: index + extending rule, project name (uppercase display), a
description, a detail line, and a mono metric list. Device frame at 288×576
with a screenshot slot at Play Store dimensions.

**The screenshot slots are deliberate placeholders**, with registration
brackets and the label `PLAY STORE SCREENSHOT / 1080 × 1920`. Inventing
plausible CDG Zig UI would put fiction in the portfolio. Slot geometry is
final, so real captures drop in with no relayout.

### 7.3 Experience

A **spine, not a list**. CDG Zig and FWD SG nest *under* Codigo behind a
hairline with an amber tick at the join, because that is what they actually
are — two products inside one job. Listed as peers they make one four-year
tenure read as three short ones.

Years in a left column, company as uppercase display, role, place, then either
a detail paragraph or nested products. A recognition strip closes the section
(ICPC 2019, Hackathon Yangon 2018, UCSY) — personality without an Awards
section taking over the page.

### 7.4 What I Build

Opens with the **internal Android library** in a bordered block of its own. On
the CV it is the fourth bullet under CDG Zig; it is the one item that says this
person's work outlives their own tickets, so it gets a heading and a paragraph.

Below it, five capability cards — Android, Cross-platform, Architecture &
quality, Ship & monitor, Backend. Each card is outlined with a `box-shadow`
rather than the grid painting hairlines through its own background, which is
correct at any column count (see §11).

### 7.5 Contact

Large display headline, a line on availability, four channels (Email, GitHub,
LinkedIn, Telegram) in a responsive grid, then a colophon rule with the
wordmark and full name. An amber glow sits low behind the headline.

### 7.6 `/work`

The full index: nine products, numbered unbroken across two groups —
*Products I run*, then *Client & company work*. **Type-led with no device
frames**: the homepage owns the imagery, this page is an index and should read
denser rather than repeat it.

### 7.7 `/work/[slug]` case study

Built around **three moves**, each led by its figure in amber display type with
the paragraph beneath as evidence. This inverts the CV, where the numbers are
buried at the ends of bullets.

Structure: header with facts bar → intro and ownership list → the three moves →
a "beyond the code" note → stack → back link.

`generateStaticParams` drives the route, so a further case study is a data
entry in `lib/content.ts`, not a new page.

---

## 8. Content model

**All copy lives in `lib/content.ts`.** Components carry no prose. Edit content
there; edit presentation in the components.

```ts
person       // wordmark, name, role, location, email, social URLs
hero         // headline lines (desktop + mobile), disciplines, proof strip
projects     // Project[]   — the three on the homepage
workGroups   // WorkGroup[] — all nine, grouped, for /work
roles        // Role[]      — employment, with nested products
recognition  // string[]
library      // the featured internal-library block
capabilities // capability cards
contact      // footer headline and note
caseStudies  // CaseStudy[] + getCaseStudy(slug)
```

Two fields are placeholders pending information:

```ts
href: string | null   // Play Store URL, or an internal case-study path
shot: string | null   // real screenshot; null renders the marked slot
```

---

## 9. Code architecture

```
app/
  globals.css          design tokens + shared primitives (.shell .display .mono .rule .reveal)
  layout.tsx           fonts, metadata, viewport, Grain
  icon.svg             favicon
  page.tsx             homepage composition
  work/page.tsx        work index
  work/[slug]/page.tsx case study route
components/            one component + one CSS module per section
  Nav Hero SelectedWork Experience WhatIBuild Contact
  WorkIndex CaseStudyView
  SectionHead Reveal Grain
lib/content.ts         every string
public/                portrait.jpg, policies/, .nojekyll
design/                brief + artboards
.github/workflows/     deploy.yml
```

**Conventions**

- Server components by default. Only `Nav` and `Reveal` are client components,
  because only they need browser state.
- Layout uses flex/grid with `gap`. No margin-based spacing between siblings.
- Colours, spacing and easing come from tokens. No literal hex in a component.
- CSS Modules are scoped; the four global primitives are the only shared classes.

**Dependencies** — deliberately minimal.

| Package | Version |
| --- | --- |
| next | ^16.3.3 |
| react / react-dom | 19.0.0 |
| typescript | ^5.7.3 |
| playwright | ^1.62.1 (dev, verification only) |

Next was installed at 15.1.6 and immediately upgraded — that release carries a
published CVE. `npm audit` is clean at 16.3.3.

---

## 10. Deviations from the original brief

Recorded because the brief and the build must not silently diverge.

| # | Brief said | Built as | Why |
| --- | --- | --- | --- |
| 1 | Body face Inter | Instrument Sans | Inter is the most overused UI face on the web. Same metrics class. |
| 2 | Mobile hero: four authored lines | Five (`USEFUL` / `THINGS.`) | Holding four breaks at 390px forces the display size to ~42px, which undersells the hero on the device most recruiters use. Splitting buys 56px. |
| 3 | Jar Gyi as homepage project 01 | Omitted from homepage, listed on `/work` | No material existed beyond a privacy policy. It is described on `/work` from that policy alone. |
| 4 | A Writing section on the homepage | Cut | No posts exist. The slot went to the internal library. |
| 5 | Portrait: a fresh photograph | A crop from `img/my_pic_2_500.png` | Both existing images are circular avatar crops. A 450×600 rectangle fits entirely inside the mask, so no white corners; the duotone neutralises the busy background. Near its resolution ceiling at 800px source. |

---

## 11. Defects found during implementation

Three real problems the artboards could not surface. Recorded so they are not
reintroduced.

**Contrast failure carrying real copy.** `--ink-muted` at `#6b675f` is 3.4:1 on
the page background — below AA — and was styling project detail lines and place
labels. `--ink-faint` at `#46433d` was 1.9:1. The whole ramp moved up a step;
the floor for text is now 5.3:1 and `--ink-faint` is demoted to decoration.
Artboards do not get contrast-audited, so this was invisible on the canvas.

**Capability grid rendered a grey slab.** The grid used its own background
showing through a 1px gap as the hairlines — elegant until the final row is
incomplete, at which point the empty cells paint as a solid block. Each card is
now outlined with `box-shadow: 0 0 0 1px`, which merges into clean rules and
draws nothing where there is no card. Correct at any column count.

**Hero portrait broke the mobile fold.** `next/image` contributed intrinsic
height, so the hero grew past `100svh` and pushed the proof strip below the
viewport. The image is absolutely positioned now, so the figure is sized by its
container rather than by the photo.

Two smaller corrections: the hero's vertical rhythm (headline started 12px under
the nav with dead space above the proof strip) and the duotone strength, which
read sepia at 0.5 tint and was reduced to 0.38.

---

## 12. Build, verification and deployment

### Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export into out/
npm run typecheck
```

### Verification method

Every pass is checked in real Chromium via Playwright at **390 / 820 / 1440**,
scrolling the full page so `IntersectionObserver` actually fires, asserting:

- no horizontal overflow (`scrollWidth <= clientWidth`)
- no page errors and no console errors
- no HTTP ≥400 responses
- no element left stuck at `opacity: 0` after scroll

All four routes currently pass all four checks.

### Deployment

`.github/workflows/deploy.yml` builds and publishes on every push to `main`:
checkout → Node 22 → `npm ci` → `npm run build` → `upload-pages-artifact` →
`deploy-pages`.

**One-time setup, not yet done:** repository **Settings → Pages → Source →
GitHub Actions**. Until that is switched, Pages keeps serving the old
hand-written site from the branch root and the workflow output is ignored.

**Legacy files.** `index.html`, `page.html`, `test.html`, `css/`, `js/`, `img/`
and `policies/` are still in the repo root, deliberately. They are what Pages is
serving right now; deleting them before the switch would take the live site
down. Remove them once Actions is publishing.

**Privacy policy.** `policies/jar-gyi-privacy-policy.md` has a live Play Store
listing pointing at it. A copy lives in `public/policies/` so the URL survives
the switch. Both copies exist deliberately during the transition.

**`.nojekyll`** is in `public/` so `_next/` is never stripped by Jekyll.

---

## 13. Open items and blockers

**Blocked on you**

1. **Git push returns 403.** The Claude GitHub App has no access to
   `APJake/apjake.github.io`, so every commit is local to the working container.
   Fix: install the app at `github.com/apps/claude/installations/select_target`,
   or reconnect GitHub in claude.ai settings.
2. **Play Store URLs** for all nine apps. Blocks the screenshot slots, the
   project links, and any real imagery on the site.
3. **Pages source → GitHub Actions** (§12).
4. **Jar Gyi facts.** Currently described from its privacy policy alone. Is it
   live? Downloads? Why was it built?
5. **A better portrait.** The current one is salvaged from a circular avatar and
   is near its resolution ceiling.
6. **CV download** — offer it, and if so which version (Android, Mobile, or both)?

**Notes on the CVs, not the site**

- Both list Better HR as Jun–Dec 2022 and Codigo as Oct 2022 – Present. Those
  **overlap by three months.** The site shows years only so it does not surface,
  but a recruiter reading the PDF will notice.
- The phone number is on both CVs and deliberately not on the site (§4).

---

## 14. Backlog

In the order worth doing:

1. **404 page** — currently Next.js stock, looks nothing like the site.
2. **Second case study** — BKK Guide MM is the strongest candidate: it is the
   one product where the backend is also yours.
3. Real screenshots into the slots, once URLs arrive.
4. Open Graph image, so shared links render as something.
5. `sitemap.xml` and `robots.txt`.
6. Custom domain, if wanted, instead of `apjake.github.io`.
7. Writing section — only once two or three real posts exist.
8. Remove the legacy site files after the Pages switch.

---

## Appendix A — Content inventory

**Products run personally**

| Product | Platforms | Stack | Period |
| --- | --- | --- | --- |
| BKK Guide MM | Android, iOS, Web | Flutter, Ktor, MongoDB | 2023 — Now |
| Jar Gyi | Android | Kotlin, Room, offline only | 2025 — Now |

**Client and company work**

| Product | Scale | Stack | Context |
| --- | --- | --- | --- |
| CDG Zig | 1M+ downloads | Kotlin, Compose, Maps SDK | Codigo, 2023 — Now |
| FWD SG | 100K+, 4.7★ | Kotlin | Codigo, 2022 — 2023 |
| Better HR | 100K+ | Kotlin | Better HR, 2022 |
| Shwe Nar Sin | 1M+, 4.4★ | Android, Kotlin | Freelance |
| AiO eSports | — | Android, Kotlin | Freelance |
| AiO Partner | — | Android, Kotlin | Freelance |
| Hiking | — | Flutter, Hive | Freelance, 2023 |

**Employment**

| Period | Company | Role |
| --- | --- | --- |
| 2022 — Now | Codigo | Senior Android Developer |
| 2022 | Better HR | Mid-Senior Android Developer |
| Since 2019 | Freelance | Android & Flutter |

**Recognition**

- Champion, ICPC 2019 — regional and national
- People's Choice, Hackathon Yangon 2018
- Computer Science, UCS Yangon

**Contact surfaced on the site**

`apjake.me@gmail.com` · `github.com/apjake` · `linkedin.com/in/apjake` · `@AP_Jake`
