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
4. Deploy the rules: `npx firebase-tools deploy --only database --project <id>`.
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
