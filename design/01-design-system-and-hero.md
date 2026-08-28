# Pencil Prompt 01 — Design System + Homepage Hero

Project: **JAKE** — personal portfolio for Aung Min Khant (apjake.github.io)
Scope of this pass: foundations + hero only. No project cards, no experience, no footer yet.

---

## Decisions locked (design log)

| Decision | Value |
|---|---|
| Visual direction | A+B+C blend — Apple/Linear restraint in grid & spacing, editorial oversized type, creative-dev interaction accents |
| Brand / wordmark | `JAKE` (full name "Aung Min Khant" appears in About + CV only) |
| Headline | `ANDROID ENGINEER WHO BUILDS USEFUL THINGS.` |
| Hero proof strip | `2M+ DOWNLOADS · 4 YRS · DA NANG, VN` |
| Portrait | Yes — duotone black→amber. Fallback variant specced without it |
| Theme | Dark only (no light toggle in v1) |
| Accent | Warm amber `#FFB020` |
| Type | Bricolage Grotesque (display) / Inter (body) / JetBrains Mono (meta) — all Google Fonts |
| Client work visuals | Real Play Store screenshots (public assets) — lands in prompt 02 |
| Framework target | Next.js, static export to GitHub Pages |

Still open: Jar Gyi material, Play Store URLs, writing section, CV download, custom domain.

---

## How to use this file

Three artboards. If Pencil takes one brief for the whole file, paste everything from
`=== BRIEF ===` down. If it takes one prompt per artboard, paste the FOUNDATIONS block
first, then each ARTBOARD block separately — each one restates the tokens it needs.

---

=== BRIEF ===

# FOUNDATIONS

Design a dark editorial portfolio for an Android engineer. The feel is a printed design
annual, not a SaaS landing page: near-black paper, warm off-white ink, one amber accent
used sparingly. Restrained grid and spacing discipline (Linear/Apple), oversized editorial
typography, and a small number of precise interactions. It should read as made by an
engineer with taste — never decorative for its own sake.

## Color tokens (dark only)

Surfaces
- `--bg-base`        #0B0B0C   page background, warm near-black
- `--bg-raised`      #131315   cards, panels
- `--bg-inset`       #080809   recessed wells, code blocks

Ink
- `--ink-primary`    #F2EFE9   warm off-white — headlines, body
- `--ink-secondary`  #A8A29A   warm gray — supporting copy
- `--ink-muted`      #6B675F   mono labels, timestamps

Accent
- `--amber`          #FFB020   primary accent
- `--amber-bright`   #FFC04D   hover / active
- `--amber-dim`      #B87A12   pressed, disabled
- `--amber-glow`     rgba(255,176,32,0.16)   radial glows, focus halos

Lines
- `--line-hair`      rgba(242,239,233,0.10)  1px section rules
- `--line-strong`    rgba(242,239,233,0.18)  emphasized dividers
- `--focus-ring`     #FFB020, 2px, 2px offset

Selection: amber background, `#0B0B0C` text.

Amber rules: accent only. Never body copy, never a large filled area. Permitted uses —
the headline's final full stop, small meta ticks, link underlines on hover, focus rings,
the portrait duotone highlights, one radial glow at ~6% opacity. If more than roughly 3%
of the viewport is amber, it is wrong.

Contrast: off-white on base ≈ 16:1. Amber on base ≈ 9.8:1. Both pass AAA for large text.

## Typography

Faces (Google Fonts)
- Display — **Bricolage Grotesque**, weight 800
- Body — **Inter**, weights 400 / 500
- Mono — **JetBrains Mono**, weight 500

Scale
| Token | Size | Face | LH | Tracking |
|---|---|---|---|---|
| `display-xl` | clamp(3.25rem, 11vw, 10.5rem) | Bricolage 800 | 0.88 | -0.04em |
| `display-l`  | clamp(2.5rem, 6vw, 5rem)       | Bricolage 800 | 0.95 | -0.03em |
| `display-m`  | clamp(2rem, 4vw, 3.5rem)       | Bricolage 800 | 1.0  | -0.02em |
| `body-l`     | 1.125rem                       | Inter 400     | 1.6  | 0        |
| `body`       | 1rem                           | Inter 400     | 1.65 | 0        |
| `mono-label` | 0.75rem UPPERCASE              | JetBrains 500 | 1.2  | 0.12em   |
| `mono-meta`  | 0.8125rem                      | JetBrains 500 | 1.4  | 0.06em   |

Display type is always tight and optically kerned. Body copy never exceeds 68 characters
per line. Mono is reserved for metadata, labels, and numbers — never for prose.

## Spacing, grid, geometry

- Spacing scale (4px base): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 200
- Grid: 12 columns, max content width 1440px
- Margins: 64px desktop / 32px tablet / 20px mobile
- Gutters: 24px desktop / 16px mobile
- Breakpoints: 480 / 768 / 1024 / 1280 / 1536
- Radius: 0 on editorial blocks and rules; 4px on chips and small controls; 12px only on
  device frames. The system is predominantly sharp-cornered.
- Elevation: no drop shadows. Depth comes from surface value and hairline rules only.
  The single exception is the amber radial glow behind the portrait.

## Motion

- Easing `--ease-editorial`: cubic-bezier(0.22, 1, 0.36, 1)
- Durations: 200ms (micro) / 400ms (element) / 700ms (entrance)
- Entrance pattern: text reveals by clip-path mask sweeping upward, 80ms stagger per line.
  No fades from opacity 0 alone, no slide-ins from off-screen, no bounce.
- All motion must respect `prefers-reduced-motion` — reveals become instant.

## Texture

- Film grain overlay across the whole page: monochrome noise, 3% opacity, non-interactive
- One radial amber glow (`--amber-glow`, ~6% peak) sitting behind the portrait
- No gradients anywhere else, no glassmorphism, no blur panels

---

# ARTBOARD 01 — Foundations specimen
Canvas 1440 × 2000, background `--bg-base`.

A reference sheet, laid out as an editorial spread rather than a Figma dump.
1. Color swatches — hard-edged rectangles, no rounding, each labeled in `mono-label` with
   token name and hex beneath.
2. Type specimen — each scale row shown at real size, with the token name in `mono-label`
   set in the left margin as a hanging label. Display rows use the actual headline words
   so the tracking is judged in context.
3. Spacing ruler — the 4px scale drawn as stacked amber ticks against hairline rules.
4. Grid overlay — 12 columns rendered at 8% amber over the base, showing margins and gutters.
5. Motion reference — three frames of the clip-path line reveal, annotated in `mono-meta`.

---

# ARTBOARD 02 — Hero, desktop
Canvas 1440 × 900, background `--bg-base`, grain overlay on.

## Navigation
Fixed to top, 88px tall, transparent over the hero, no border at rest.
- Left, at the 64px margin: `JAKE` — Bricolage 800, 20px, tracking -0.02em, `--ink-primary`
- Right, at the 64px margin: `WORK` and `ABOUT` — `mono-label`, `--ink-secondary`, 40px apart
- Hover on a nav item: color goes to `--ink-primary` and a 1px amber underline wipes in from
  the left over 200ms
- On scroll past 88px: a `--line-hair` bottom border fades in and the bar picks up a
  `rgba(11,11,12,0.72)` backdrop

## Layout
Asymmetric 12-column split. Content block occupies columns 1–7. Portrait occupies
columns 8–12 and bleeds off the right edge of the canvas. Vertical rhythm anchors the
headline's optical center slightly above the canvas midpoint.

## Headline — the focal point
Set in `display-xl`, `--ink-primary`, four hard-broken lines, left aligned, no hyphenation:

```
ANDROID
ENGINEER
WHO BUILDS
USEFUL THINGS.
```

The final full stop is `--amber`. Nothing else in the headline is colored.
Line breaks are authored, not wrapped — they must hold at every viewport.
Lines 1–3 sit flush left; the headline block's right edge is allowed to run under the
portrait's left edge by roughly 32px, so the two planes overlap. The portrait sits behind
the type. This overlap is the single most important compositional move on the page.

## Discipline line
32px below the headline, `mono-meta`, `--ink-secondary`:

```
KOTLIN · COMPOSE · FLUTTER
```

Middle dots are `--ink-muted`, not amber.

## Proof strip
Pinned to the bottom of the content column, 64px above the canvas floor, sitting on a
`--line-hair` rule that runs the full width of columns 1–7. Three items in `mono-label`,
`--ink-secondary`, evenly spaced along the rule, each preceded by a 4px amber square tick:

```
▪ 2M+ DOWNLOADS      ▪ 4 YRS      ▪ DA NANG, VN
```

## Portrait
- Hard-edged rectangle, no radius, no border. Aspect roughly 3:4, ~480px wide,
  bleeding off the right canvas edge and stopping ~120px above the canvas floor.
- Treatment: duotone. Shadows map to `#0B0B0C`, highlights map to `--amber`, with the
  midtones pulled toward `--ink-secondary` so the face stays readable rather than
  fully monochrome-amber. Contrast boosted, saturation of the original removed first.
- Behind it: a soft radial `--amber-glow` at ~6% peak, roughly 800px across, centered on
  the subject and clipped so it never reaches the headline.
- The portrait must never be the brightest element — the headline is.

## Scroll cue
Bottom right, at the 64px margin: `SCROLL` in `mono-label`, `--ink-muted`, above a 1px
vertical amber line 48px tall. The line's fill travels top-to-bottom on a 1.8s loop.

## Interactions
1. **Entrance** — the four headline lines reveal by upward clip-path mask, 700ms each,
   80ms stagger. The discipline line, proof strip, and nav follow at 400ms. The portrait
   fades its duotone in from pure black over 900ms, starting with the headline.
2. **Cursor proximity** — as the pointer nears the portrait, its amber highlight intensity
   lifts by ~15% over 400ms and the glow brightens fractionally. Nothing moves or scales.
3. Nothing else. The headline does not react to the cursor. No custom cursor, no
   magnetic buttons, no parallax. The restraint here buys the project cards their
   bigger interaction later.

## Variant B — no portrait
Same artboard, portrait and glow removed. Headline widens to columns 1–9 and grows one
step. The proof strip moves to the right of the canvas, set vertically along the right
margin in rotated `mono-label`. Include this variant so the layout survives if the
photography does not.

---

# ARTBOARD 03 — Hero, mobile
Canvas 390 × 844, background `--bg-base`, grain overlay on, 20px side margins.

Stacking order, top to bottom:
1. **Nav**, 64px tall — `JAKE` left; `WORK` and `ABOUT` right in `mono-label` at 11px,
   24px apart. No hamburger; two items do not need a menu.
2. **Headline**, starting 96px below the nav. Same four authored lines, `display-xl`
   resolving to ~3.25rem, tracking -0.04em, line-height 0.88. Amber full stop retained.
3. **Discipline line**, 24px below, `mono-meta` at 12px.
4. **Portrait**, 48px below, full-bleed edge to edge (breaking the 20px margins), 4:5
   crop, same duotone. A bottom-anchored scrim from transparent to `--bg-base` fades its
   lower third into the page.
5. **Proof strip**, overlaid on that scrim at the portrait's bottom edge. Stacks to two
   rows if 390px is tight: `2M+ DOWNLOADS` on the first, `4 YRS · DA NANG, VN` on the
   second. Amber ticks retained.

The headline leads on mobile — the portrait never appears above it. Entrance animation is
identical but stagger tightens to 60ms. No scroll cue on mobile.

=== END BRIEF ===

---

## Review checklist for the returned artboards

- [ ] Headline is unambiguously the brightest, largest thing on the page
- [ ] Amber covers well under ~3% of the viewport
- [ ] Headline breaks at the four authored points at every width
- [ ] Portrait sits behind the type, with real overlap — not beside it in a neat column
- [ ] Zero drop shadows; depth reads from surface value and hairlines only
- [ ] Mono appears only on labels, metrics and nav — never on prose
- [ ] Variant B (no portrait) stands on its own
- [ ] Mobile leads with the headline, not the face

## Next prompt (02) once this is approved

Selected Work — three project cards using real Play Store screenshots in device frames,
carrying the signature hover interaction. Blocked on the Play Store URLs and a decision
on whether Jar Gyi leads or CDG Zig / BKK Guide MM / Shwe Nar Sin do.
