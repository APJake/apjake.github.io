# apjake.github.io

Personal site for Aung Min Khant — Android engineer. Next.js, statically
exported, served by GitHub Pages.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export into out/
npm run typecheck
```

## Layout

| Path | What it is |
| --- | --- |
| `app/` | Route, root layout, design tokens (`globals.css`) |
| `components/` | One component + CSS module per section |
| `lib/content.ts` | Every string on the page, in one place |
| `design/` | Design brief and the source artboards behind the build |
| `public/` | Static assets copied verbatim into `out/` |

All copy lives in `lib/content.ts`. Edit it there rather than in the
components — the components carry no prose.

## Design system

Defined once as custom properties in `app/globals.css` and mirrored in
`design/01-design-system-and-hero.md`. Dark only; no light theme in v1.

- Background `#0b0b0c`, ink `#f2efe9`, one accent `#ffb020`
- Bricolage Grotesque (display) / Instrument Sans (body) / JetBrains Mono (meta)
- Depth comes from surface value and hairlines. There are no drop shadows.
- Amber is an accent: keep it under roughly 3% of any viewport.

`--ink-muted` is the lowest value allowed to carry copy (5.3:1). `--ink-faint`
is decorative only.

## Deploying

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

**One-time setup:** in the repository's Settings → Pages, set *Source* to
**GitHub Actions**. Until that is switched, Pages keeps serving the old
hand-written site from the branch root and the workflow's output is ignored.

### Note on the privacy policy

`policies/jar-gyi-privacy-policy.md` has a live Play Store listing pointing at
it, so a copy lives in `public/policies/` to keep the URL working after the
switch to Actions-based deploys. Both copies exist deliberately during the
transition — once Pages is serving from the workflow, the root `policies/`
directory (and the other legacy files: `index.html`, `page.html`, `test.html`,
`css/`, `js/`, `img/`) can be removed.

## Kyauk Thin Bone (`/kyauk-thin-bone/`)

A live scoreboard mini app (ကျောက်သင်ပုန်း, "scoreboard"). Firebase Realtime
Database for live data, Firebase anonymous auth to identify the creator.

| Route | What it is |
| --- | --- |
| `/kyauk-thin-bone/` | Landing: Create / View, plus boards created on this device |
| `/kyauk-thin-bone/create/` | Setup: codes, title, description, default score, preset button, match toggle, players |
| `/kyauk-thin-bone/manage/?id=…` | Creator screen: scoring, settings, Save Match, history |
| `/kyauk-thin-bone/join/` | Room code + passcode → viewer |
| `/kyauk-thin-bone/view/?id=…` | Read-only viewer; this URL is the public share link |

Code lives in `components/scoreboard/` and `lib/scoreboard/`. The board id is
in the query string because a static export can't have per-board routes.

**Access model** (`database.rules.json`): `rooms/{code}` claims a room code and
is never readable; `access/{code}/{passcode}` maps to the board id and can only
be read by someone who knows both; `boards/{id}` is readable by anyone holding
the 20-character id (the share link) and writable only by the anonymous uid
that created it. The creator can edit only from the browser that created the
board.

**One-time setup:**

1. Create a Firebase project; enable **Realtime Database** and
   **Authentication → Anonymous**.
2. Deploy the rules: `npx firebase-tools deploy --only database --project <id>`.
3. Add a web app and copy its config into repository variables (Settings →
   Secrets and variables → Actions → *Variables*) using the names in
   `.env.example`. For local dev, put them in `.env.local`.

Without the variables the site still builds; the app shows a "not configured"
notice. To run against local emulators:
`npx firebase-tools emulators:start --only database,auth --project demo-ktb`
with `NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1`.
