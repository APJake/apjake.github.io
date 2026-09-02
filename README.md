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
