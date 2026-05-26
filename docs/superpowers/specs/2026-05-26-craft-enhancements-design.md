# Layout-preserving craft enhancements — design spec

**Date:** 2026-05-26
**Site:** lucawetherall.co.uk (Astro static site, deployed via GitHub Pages)
**Scope:** Typography, spacing, accessibility, and micro-interaction enhancements that do not alter the existing layout (hero, two-column About / Recent Projects row, nav, footer).

---

## Goal

Elevate perceived craft and fix three concrete accessibility issues without changing the site's structure, sections, content, or minimalist CV-like design philosophy. Every change is additive or token-level: pages keep their current layout, nav, and content order.

## Non-goals

- No restructuring of pages or sections.
- No new pages or new content.
- No JavaScript framework changes (Astro stays as-is).
- No new images, illustrations, or icons.
- No change to the colour palette other than darkening one muted-text token.
- No change to font choice (Spectral + IBM Plex Sans).

## Background

The site replicates an earlier WordPress portfolio pixel-for-pixel. It uses a desktop hack — `body { zoom: 0.85 }` above 782px — to make the footer fit the viewport. Several typography and accessibility details that come "for free" with deliberate setting were left at framework defaults. The point of this pass is to tune them.

A first brainstorm produced 12 candidate enhancements. A second pass via UI Pro Max revised the list, dropped one decorative-only animation, and added four items the first pass missed (focus ring, view transitions, baseline rhythm, selection styling).

The user selected 13 enhancements, broken down by tier below.

---

## Selected enhancements

### Critical (accessibility & quality)

#### C1 — Remove the `zoom: 0.85` hack

The desktop block in `src/styles/global.css`:

```css
@media (min-width: 782px) {
  body {
    zoom: 0.85;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    overflow: hidden;
  }
}
```

`zoom` is a non-standard property, interacts unpredictably with browser zoom in Safari/Firefox, and is incompatible with WCAG 1.4.4 (text resizing). Replace by tuning the type scale, hero spacers (`--hero__top-spacer: 100px`, `--hero__bottom-spacer: 63px`), and `--block-gap` so the page fits the viewport naturally at 100%.

The flex column layout that keeps the footer at the bottom of tall viewports stays — only `zoom`, the `overflow: hidden`, and any other side-effects of the hack are removed.

**Verification:** at 1440×900 the page must show hero + About/Recent row + footer with no scroll, identical to the current rendering. Tested at 100%, 150%, and 200% browser zoom — content must reflow without horizontal scroll and without footer overlap.

#### C2 — Floor body text at 16px on mobile

Current `--fs-small` is `clamp(0.833rem, 0.833rem + ((1vw - 0.2rem) * 0.461), 1rem)` — at 375px viewport this resolves to ~13.3px. Raise the minimum to `1rem` (16px) so the floor is reading-comfortable and iOS doesn't auto-zoom inputs in the contact form.

Update tokens:

```css
--fs-small: clamp(1rem, 1rem + ((1vw - 0.2rem) * 0.461), 1.05rem);
```

(Adjust the desktop maximum if needed to preserve visual rhythm.)

Audit all callers of `--fs-small`, `--fs-x-small` to confirm no overflow or wrap regressions.

#### C3 — Darken muted text from `#757575` to `#5b5b5b`

`#757575` on `#fffbf4` is ~3.8:1 contrast — fails WCAG AA. `#5b5b5b` is ~5.4:1.

```css
--color-muted: #5b5b5b;
```

One token, all consumers update. Visually almost indistinguishable from the current shade.

#### C4 — Refined focus ring (offset halo)

Replace:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
```

With a two-layer box-shadow halo:

```css
:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-bg),
    0 0 0 4px var(--color-accent);
  border-radius: 2px;
}
```

The first ring matches background, creating a clean offset gap; the second is the accent. Works on links, buttons, and inputs without jaggies on rounded shapes. **Keyboard-focus only** (preserve via `:focus-visible`).

---

### High (craft typography)

#### H1 — Tighter, sharper hero H1

In `src/pages/index.astro`, on `.hero__name`:

```css
.hero__name {
  letter-spacing: -0.022em;
  font-feature-settings: "kern", "liga", "calt", "ss01";
}
```

Same size, properly typeset. `ss01` activates IBM Plex Sans's alternate `a` and `g`, which suit a serious editorial display use.

#### H2 — OpenType figures: old-style in prose, tabular in data

Set at the body level:

```css
body {
  font-feature-settings: "kern", "liga", "onum";
}
```

`onum` gives Spectral and Plex their old-style figures (numerals that sit partly below baseline like lowercase letters) — correct for prose. Anywhere data appears in columns or tables (currently none, but reserve for future), use a `.tabular` utility:

```css
.tabular { font-feature-settings: "kern", "liga", "tnum"; }
```

Audit "2025", "Air I", "Air II", "BBC Radio 3", any date or numeric ranges in body content to ensure they render with old-style figures.

#### H3 — Em-dash list markers on Recent Projects

In `src/pages/index.astro`, on `.row__list`:

```css
.row__list {
  list-style: none;
  padding-left: 0;
}
.row__list li {
  padding-left: 1.1em;
  text-indent: -1.1em;
}
.row__list li::before {
  content: "— ";
  color: var(--color-muted);
}
```

Reads like a programme note rather than a bulleted CMS list. Hanging indent ensures wrapped lines align under the project title, not under the dash.

Scope: only `.row__list` (Recent Projects on homepage). Other lists keep default bullets.

#### H4 — Small-caps section labels

`<p class="row__label"><strong>About:</strong></p>` becomes a small-caps mark:

```css
.row__label {
  font-family: var(--font-sans);
  font-variant-caps: all-small-caps;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--color-text);
  font-size: var(--fs-small);
}
```

Drop the colon. The `<strong>` wrapper around the label text is removed (small-caps + weight 600 carry the emphasis). HTML:

```astro
<p class="row__label">About</p>
<!-- and -->
<p class="row__label">Recent Projects</p>
```

#### H5 — Quieter link underline, accent on hover

Replace the current link styling:

```css
a {
  color: var(--color-text);
  font-family: var(--font-sans);
  text-decoration: underline;
  text-decoration-thickness: 0.5px;
  text-underline-offset: 0.3em;
  text-decoration-color: #a8a08a;
  transition: text-decoration-color 0.15s ease, color 0.15s ease;
}

p a:hover,
li a:hover {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}
```

Removes the green `--color-link-hover: #4c7b72` token (it conflicted with the purple accent and gave the accent two meanings). The accent now has one consistent job: "this is the link you just touched."

`--color-link-hover` token can be deleted; verify no other rules reference it.

---

### Medium (editorial flourishes)

#### M2 — Interpunct-separated tagline

The hero tagline currently reads:

> Conductor, bass, pianist, singing teacher, and arranger.

Change to:

> Conductor · bass · pianist · singing teacher · arranger

Markup change in `src/pages/index.astro`:

```astro
<p class="hero__line"><strong>Conductor</strong> · <strong>bass</strong> · <strong>pianist</strong> · <strong>singing teacher</strong> · <strong>arranger</strong></p>
```

Removes the trailing period (a billing-line doesn't terminate). The about page, teaching page, and footer/meta references to the discipline list are **not** changed in this pass — only the homepage hero line.

#### M5 — Astro view transitions (subtle crossfade)

Enable Astro's built-in view transitions in `src/layouts/BaseLayout.astro`:

```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<head>
  ...
  <ViewTransitions />
</head>
```

Header element (`Header.astro`) gets `transition:persist` so it doesn't blink between pages. Default crossfade is ~200ms. Honours `prefers-reduced-motion: reduce` automatically (Astro disables the transition).

**Verification:** click between Home / About / Teaching / Contact — the page body crossfades, header stays put, no layout jank. Compatible with GitHub Pages static deploy.

#### M6 — Baseline-grid vertical rhythm

Replace the ad-hoc `--space-*` scale with a tuned 8px-based scale aligned to a 24px line-height for body text:

```css
:root {
  /* Baseline = 8px */
  --space-1: 0.5rem;   /*  8px */
  --space-2: 1rem;     /* 16px */
  --space-3: 1.5rem;   /* 24px — one baseline */
  --space-4: 2rem;     /* 32px */
  --space-5: 3rem;     /* 48px — two baselines */
  --space-6: 4.5rem;   /* 72px — three baselines */
}
```

Keep the existing `--space-20…80` aliases pointing at the new scale for backwards compatibility during migration:

```css
:root {
  --space-20: var(--space-1);
  --space-30: var(--space-2);
  --space-40: var(--space-2);
  --space-50: var(--space-3);
  --space-60: var(--space-4);
  --space-70: var(--space-5);
  --space-80: var(--space-6);
}
```

Body line-height stays `1.5`, which against 16px body = 24px — one baseline. Margins between paragraphs, between section labels and their content, and between rows all land on the grid.

This is more disciplined than the current `0.44 / 0.75 / 1 / 1.5 / 2 / 3 / 4 rem` set, which mixes baseline-aligned and not-aligned values.

---

### Low (polish)

#### L2 — Softer `::selection` colour

Current:

```css
::selection {
  background: var(--color-accent);
  color: #ffffff;
}
```

Soften to an accent-tinted overlay (keep text colour as body default):

```css
::selection {
  background: rgba(93, 88, 142, 0.18);
  color: var(--color-text);
}
```

Highlights become a quiet wash rather than a full-contrast shout — in keeping with the rest of the page.

---

## Files touched

- `src/styles/global.css` — C1, C2, C3, C4, H2, H5, M6, L2 (token & selector changes)
- `src/pages/index.astro` — H1, H3, H4, M2 (component-scoped styles & markup tweaks)
- `src/layouts/BaseLayout.astro` — M5 (add `<ViewTransitions />`)
- `src/components/Header.astro` — M5 (`transition:persist` directive)

No new files. No new dependencies (view transitions ship with Astro core).

## Out of scope (deferred from the v2 menu)

- M1 drop-cap on About paragraph
- M3 marker-highlight hover (H5's accent-on-hover was chosen instead)
- M4 hairline portrait frame
- L1 print stylesheet

These can be picked up in a follow-up if desired.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| C1 (removing zoom) breaks the "footer fits at bottom of viewport" composition on some screen sizes | Tune `--page-padding-x` and hero spacers iteratively at 1280, 1440, 1920 widths. If a single viewport-aware sizing rule is needed, add `clamp()` on hero spacers instead of reintroducing `zoom`. |
| C2 (16px floor) causes hero text to wrap awkwardly on small phones | Test at 360px. The hero name uses a different clamp; only body text is affected. |
| H4 (small-caps) renders poorly if Spectral / Plex `font-variant-caps` isn't loaded yet | Both Google Fonts files include the OpenType `smcp` feature. Verify on the staging URL across Chrome / Safari / Firefox. |
| M5 (view transitions) flashes on the first navigation if `<head>` resources differ between pages | Audit `BaseLayout.astro` to ensure shared `<link>` and `<meta>` order is identical across pages. |
| M6 (baseline rhythm) reveals existing off-baseline margins | This is the point — fix them. The migration aliases keep old call sites working while the audit runs. |

## Verification plan

For each change:

1. **Visual diff** — compare deployed before/after at 375 / 768 / 1280 / 1920 widths.
2. **Accessibility audit** — run Lighthouse or axe on home, about, teaching, contact pages. Confirm:
   - Body text contrast ≥4.5:1 everywhere
   - Focus rings visible on every interactive element via Tab navigation
   - No horizontal scroll at 320px
   - Browser zoom to 200% reflows without content loss
3. **Browser matrix** — Safari (macOS, iOS), Chrome (desktop, Android), Firefox.
4. **Reduced-motion** — set `prefers-reduced-motion: reduce`; verify view transitions are disabled.
5. **Print preview** — confirm the page is still printable in a readable form even without L1 (which was not selected).

## Open questions

None — selections are locked.
