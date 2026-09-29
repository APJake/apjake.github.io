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
| `lib/apps.ts` | The mini apps listed on `/apps/` |
| `design/` | Design brief and the source artboards behind the build |
| `public/` | Static assets copied verbatim into `out/` |

All copy lives in `lib/content.ts`. Edit it there rather than in the
components — the components carry no prose.

## Apps

Personal mini web apps live under `/apps/<slug>/`. They are deliberately not
linked from the homepage or the nav — `/apps/` lists them (title,
description, image, status) and that's the only way in. To add one, create
`app/apps/<slug>/page.tsx` and add an entry to `lib/apps.ts`.

### Who's the first (`/apps/whosthefirst/`)

A reaction game for 2–20 players on Firebase Realtime Database. There is no
server: clients drive the room state machine
(`idle → ready → started → result`) through RTDB transactions, and
`database.rules.json` guards the data. Code is in `lib/whosthefirst/` and
`components/whosthefirst/`.

- **Rooms** are stored at `rooms/{code}-{passcode}`, so reading one takes both.
  `codes/{code}` reserves the code so it stays unique.
- **Timing.** GO is scheduled for a shared server-time moment. Each device
  measures `tap − GO paint` with its own `performance.now()`, so network
  delay and clock skew don't affect the ranking.
- **Expiry.** Rooms expire 2 hours after their last activity (the rules stop
  serving them) and are deleted when the last player leaves.
- A 4-digit passcode keeps casual visitors out. It won't stop a determined
  attacker, which is fine for a party game.

**Firebase setup (one time):**

1. Create a Firebase project and add a Web app. Its config values are what the
   variables below take.
2. Authentication → Sign-in method → enable **Anonymous**.
3. Realtime Database → create a database.
4. Publish the database rules: Firebase console → **Realtime Database → Rules**,
   replace the contents with `database.rules.json` from this repo, then
   **Publish**. (Or `npx firebase-tools deploy --only database --project <id>`.)
   Repeat whenever `database.rules.json` changes.
5. GitHub → Settings → Secrets and variables → Actions → **Variables**: add
   `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
   `NEXT_PUBLIC_FIREBASE_DATABASE_URL`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and
   `NEXT_PUBLIC_FIREBASE_APP_ID`. For local dev, copy `.env.example` to
   `.env.local`.

Without these variables the site still builds, and the app shows a "not
connected" notice.

**Local testing with the emulator:** run
`npx firebase-tools emulators:start --only auth,database --project demo-wtf`,
then build with `NEXT_PUBLIC_FIREBASE_EMULATOR=1`,
`NEXT_PUBLIC_FIREBASE_API_KEY=demo-key`,
`NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-wtf` and
`NEXT_PUBLIC_FIREBASE_DATABASE_URL=http://127.0.0.1:9000?ns=demo-wtf-default-rtdb`.

### Kyauk Thin Bone (`/apps/kyauk-thin-bone/`)

A live scoreboard (ကျောက်သင်ပုန်း, "scoreboard") for 1–20 players, on the same
Firebase project, setup and emulator instructions as Who's the first. Code is
in `lib/scoreboard/` and `components/scoreboard/`.

| Route | What it is |
| --- | --- |
| `/apps/kyauk-thin-bone/` | Create / View, plus boards created on this device |
| `/apps/kyauk-thin-bone/create/` | Setup: codes, title, description, default score, preset button, match toggle, players |
| `/apps/kyauk-thin-bone/manage/?board=…` | Creator: scoring, settings, Save Match, history |
| `/apps/kyauk-thin-bone/join/` | Room code + passcode → viewer |
| `/apps/kyauk-thin-bone/view/?board=…` | Read-only viewer; this URL is the share link |

- **Data** lives under `scoreboard/` in the database. `rooms/{code}` reserves
  the 6-digit code and is never readable; `access/{code}/{passcode}` holds the
  board id and can only be read by someone who knows both;
  `boards/{id}` is readable by anyone with the 20-character id (the share
  link) and writable only by the uid that created it.
- **Creator identity** is an anonymous account in its own named Firebase app
  with local persistence, so it survives closing the tab (whosthefirst uses
  per-tab sessions on the default app). The creator can edit only from the
  browser that made the board.
- **Match by match** keeps unsaved points in each player's `current`. Save
  Match writes the match to history and moves `current` into `score` in one
  multi-path update using server-side `increment()`.

## Analytics

Firebase Analytics (GA4 underneath) runs on every page, `/apps/*` included,
but only after the visitor accepts the consent banner. Until then nothing
loads: the SDK is imported on demand, so visitors who decline never download
it. "Analytics settings" in the footer (and under the whosthefirst app)
reopens the banner; declining later turns collection off.

- `lib/analytics.ts` — consent, SDK loading, `track(name, params)`.
- `components/Analytics.tsx` — mounted in the root layout: page views, click
  tracking, section views and blog read depth.
- `components/ConsentBanner.tsx`, `components/ConsentSettings.tsx` — the UI.
- `lib/firebaseApp.ts` — the one Firebase app shared with the mini apps.

**Tracking a click** needs no client code. Add data attributes to any element:
`data-track="cta_click" data-track-cta="see_all_work"` sends `cta_click` with
`cta: "see_all_work"` (`data-track-content-id` becomes `content_id`). Client
components can also call `track()` directly.

**Never send personal data.** No names, room codes, passcodes or uids. The
`room` and `board` query params are stripped from `page_location` and
`page_referrer`.

| Event | Where | Params |
| --- | --- | --- |
| `page_view` | every route, including client-side navigation | page_path, page_title |
| `nav_click` | nav links, wordmark | label |
| `contact_click` | footer channels | channel |
| `select_content` | project names, blog cards, app cards | content_type (`project` / `blog_post` / `app`), content_id, placement |
| `cta_click` | See all work, All work, All posts, ← Apps | cta |
| `case_study_link`, `screenshot_open` | case study pages | case_study, label |
| `blog_language_switch` | blog language pills | blog_id, from, to |
| `section_view` | homepage sections | section |
| `blog_read_progress` | blog posts, at 25/50/75/100% | blog_id, language, percent |
| `wtf_connect_failed` | whosthefirst sign-in failed | — |
| `wtf_room_create`, `wtf_room_create_failed` | Create room | reason |
| `wtf_room_join`, `wtf_room_join_failed` | Enter room | via (`invite_link` / `manual`), reason |
| `wtf_invite_copy` | Copy invite | — |
| `wtf_ready` | Ready toggle | ready, players |
| `wtf_round_start` | GO shown (once per round) | round, players |
| `wtf_tap` | player's tap | round, reaction_ms, value |
| `wtf_round_result` | round ends (once per round) | round, players, place, tapped |
| `wtf_room_leave`, `wtf_room_ended` | Leave; room expired or join refused | rounds_played, reason |
| `wtf_error_boundary` | whosthefirst error screen | action, error_name |
| `ktb_board_create`, `ktb_board_create_failed` | Kyauk Thin Bone: Start scoring | players, match_by_match, reason |
| `ktb_board_join`, `ktb_board_join_failed` | Room code + passcode lookup | reason |
| `ktb_share` | Copy code / passcode / link, share sheet | what, method |
| `ktb_match_save` | Save match | match, players |

GA4 enhanced measurement adds outbound clicks and file downloads on its own.

**Setup (one time):**

1. Firebase console → Project settings → Integrations → enable **Google
   Analytics**, then copy the web app's `measurementId` (`G-…`).
2. Add it as the repository variable `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   next to the other `NEXT_PUBLIC_FIREBASE_*` variables. Analytics stays off
   until it and the API key, project ID and app ID are all set.
3. Google Analytics → Admin → Data streams → your web stream → Enhanced
   measurement → turn **off** "Page changes based on browser history events".
   The site sends `page_view` itself, so leaving it on double counts.
4. Optional: Admin → Custom definitions → register the params you want to
   report on (e.g. `content_id`, `channel`, `section`, `percent` as
   dimensions; `reaction_ms` as a metric in milliseconds).

**Testing locally:** put the config in `.env.local`, run `npm run dev`, accept
the banner, and watch Google Analytics → Admin → DebugView. In dev every
event is sent with `debug_mode` and also logged to the console as
`[analytics]`.

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
