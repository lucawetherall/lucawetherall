# Craft Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply 13 layout-preserving craft enhancements (4 accessibility, 6 typography, 2 editorial, 1 polish) to lucawetherall.co.uk per `docs/superpowers/specs/2026-05-26-craft-enhancements-design.md`.

**Architecture:** Token-level CSS changes in `src/styles/global.css`, component-scoped styles in `src/pages/index.astro` and `src/components/Header.astro`, and one new Astro feature (view transitions) in `src/layouts/BaseLayout.astro`. No new dependencies. The site has no automated test suite; each task is verified by `npm run dev` + browser observation + targeted accessibility checks.

**Tech Stack:** Astro 5, vanilla CSS with custom properties, IBM Plex Sans + Spectral via `@fontsource`. Deployed to GitHub Pages as static HTML.

---

## File Structure

- `src/styles/global.css` — design tokens + global element styles (touched by most tasks)
- `src/pages/index.astro` — homepage hero + About / Recent Projects (touched by H1, H3, H4, M2)
- `src/layouts/BaseLayout.astro` — `<head>` + body wrapper (touched by M5 only)
- `src/components/Header.astro` — site header + nav (touched by M5 only)

No new files. No file structure changes.

## Task ordering rationale

1. **Foundational token changes first** — they're low-risk and used by later tasks.
2. **Critical accessibility fixes early but not first** — they're safer once tokens are stable.
3. **Component-scoped style changes in the middle** — easy to roll back individually.
4. **View transitions late** — needs all visible styling already in place to assess crossfade quality.
5. **Remove the `zoom: 0.85` hack LAST** — highest blast radius. Doing it last means every other change is visually validated under the current (zoomed) rendering first, and only the final commit needs full multi-viewport regression testing.

---

## Setup

### Task 0: Verify the dev server runs and snapshot baseline

**Files:** none

- [ ] **Step 1: Install deps (if not already)**

Run: `npm install`
Expected: completes without error.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`
Expected: Astro reports `Local: http://localhost:4321/` (or similar). Leave running for subsequent tasks.

- [ ] **Step 3: Snapshot the baseline in the browser**

Open http://localhost:4321 in Chrome/Safari at 1440×900. Confirm:
- Hero (headshot + name) renders above the fold
- About / Recent Projects two-column row visible
- Footer at the bottom
- No console errors

Take a manual screenshot or note the layout for visual diffing. We'll re-check the same viewport after each task.

- [ ] **Step 4: Confirm a clean git status**

Run: `git status`
Expected: working tree clean (or only this plan file present).

---

## Foundational tokens

### Task 1: M6 — Baseline rhythm tokens

**Files:**
- Modify: `src/styles/global.css` (the `:root` block around lines 31-39)

Add a tuned 8px-based scale aligned to a 24px line-height. Keep the existing `--space-20…80` aliases working by re-pointing them at the new scale.

- [ ] **Step 1: Edit the `:root` spacing scale**

Find this block in `src/styles/global.css`:

```css
  /* Spacing scale */
  --space-20: 0.44rem;
  --space-30: 0.75rem;
  --space-40: 1rem;
  --space-50: 1.5rem;
  --space-60: 2rem;
  --space-70: 3rem;
  --space-80: 4rem;
  --block-gap: var(--space-40);
```

Replace it with:

```css
  /* Baseline rhythm — 8px base, 24px line for body (= 1 baseline) */
  --space-1: 0.5rem;   /*  8px */
  --space-2: 1rem;     /* 16px */
  --space-3: 1.5rem;   /* 24px — one baseline */
  --space-4: 2rem;     /* 32px */
  --space-5: 3rem;     /* 48px — two baselines */
  --space-6: 4.5rem;   /* 72px — three baselines */

  /* Back-compat aliases for existing call sites — keep until migration done */
  --space-20: var(--space-1);
  --space-30: var(--space-2);
  --space-40: var(--space-2);
  --space-50: var(--space-3);
  --space-60: var(--space-4);
  --space-70: var(--space-5);
  --space-80: var(--space-6);
  --block-gap: var(--space-2);
```

- [ ] **Step 2: Reload http://localhost:4321 and check the home and About pages**

Expected: vertical spacing tightens slightly in some places (e.g. paragraph-to-paragraph margins go from 0.75rem to 1rem, hero spacers from 1rem to 1rem so unchanged). No visual breakage. Both pages still readable, no overlapping text, no footer collision.

If anything looks broken, note where and adjust the alias mapping. The most likely needed override is `--space-30` → `var(--space-1)` (8px) if 16px feels too loose for inline paragraph rhythm.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "tokens: introduce 8px baseline spacing scale with back-compat aliases"
```

---

### Task 2: C3 — Darken muted text token

**Files:**
- Modify: `src/styles/global.css` (the `:root` palette block, around line 11)

- [ ] **Step 1: Edit the muted color token**

Find:

```css
  --color-muted: #757575;
```

Replace with:

```css
  --color-muted: #5b5b5b;
```

- [ ] **Step 2: Verify contrast in the browser**

Reload. Any place using `--color-muted` (currently used minimally — check via `grep -n "color-muted" src/styles/global.css src/pages src/components src/layouts` first) should look near-identical, just slightly darker.

Run a Lighthouse Accessibility audit on `http://localhost:4321/`:
Expected: no new contrast warnings; previous `#757575`-related warnings (if any) cleared.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "a11y: darken muted text to #5b5b5b for WCAG AA 4.5:1 contrast"
```

---

### Task 3: L2 — Softer ::selection colour

**Files:**
- Modify: `src/styles/global.css` (the `::selection` block, around lines 208-211)

- [ ] **Step 1: Edit the selection styling**

Find:

```css
::selection {
  background: var(--color-accent);
  color: #ffffff;
}
```

Replace with:

```css
::selection {
  background: rgba(93, 88, 142, 0.18);
  color: var(--color-text);
}
```

- [ ] **Step 2: Verify in browser**

Reload. Select any body text on the homepage. Expected: a quiet purple-tinted wash, dark text remains readable, no contrast loss.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "polish: soften ::selection to accent-tinted wash"
```

---

### Task 4: H2 — OpenType old-style figures in body

**Files:**
- Modify: `src/styles/global.css` (the `body` block, around lines 54-62)

- [ ] **Step 1: Add `font-feature-settings` to body**

Find:

```css
body {
  font-family: var(--font-serif);
  font-size: var(--fs-small);
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Replace with:

```css
body {
  font-family: var(--font-serif);
  font-size: var(--fs-small);
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-bg);
  font-feature-settings: "kern", "liga", "onum";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 2: Add `.tabular` utility for future data-column use**

Append below the body block (above the heading rules):

```css
/* Tabular figures for data columns, prices, timers */
.tabular {
  font-feature-settings: "kern", "liga", "tnum";
}
```

- [ ] **Step 3: Verify in browser**

Reload http://localhost:4321. In Recent Projects, the "2025" in "Barnes Community Choir / Barnes Concert Band 2025" should now sit partly below the baseline like lowercase letters. The "I" / "II" in "Air I" / "Air II" are Roman numerals (unaffected).

If old-style figures don't render (some Spectral builds vary), confirm Spectral is loading the variant with OpenType `onum` support — `@fontsource/spectral` ships standard OTF features. If still missing, add `font-variant-numeric: oldstyle-nums;` as a fallback line.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "type: enable old-style figures in prose, add .tabular utility"
```

---

### Task 5: C4 — Refined focus ring

**Files:**
- Modify: `src/styles/global.css` (the `:focus-visible` block, around lines 203-206)

- [ ] **Step 1: Replace the focus-visible style**

Find:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
```

Replace with:

```css
:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-bg),
    0 0 0 4px var(--color-accent);
  border-radius: 2px;
}
```

- [ ] **Step 2: Verify by tabbing through the page**

Reload http://localhost:4321. Press Tab repeatedly. Expected: each interactive element (skip link, header brand link, nav links, body links) shows a clean cream-gap-then-purple ring. No jagged corners on text links. No focus ring on mouse click (still `:focus-visible` only).

- [ ] **Step 3: Special-case test — the contact form**

Visit http://localhost:4321/contact. Tab into the form. Each input and the submit button should show the new ring. The submit button is a dark filled button — verify the cream-gap-then-purple still reads as a halo (it will, because the gap colour is `--color-bg` cream, not the button colour).

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "a11y: refine focus-visible ring to a 2-layer box-shadow halo"
```

---

### Task 6: C2 — Floor body text at 16px on mobile

**Files:**
- Modify: `src/styles/global.css` (the type scale around lines 19-24)

- [ ] **Step 1: Edit the small font-size clamps**

Find:

```css
  --fs-x-small: clamp(0.833rem, 0.833rem + ((1vw - 0.2rem) * 1), 0.833rem);
  --fs-small: clamp(0.833rem, 0.833rem + ((1vw - 0.2rem) * 0.461), 1rem);
  --fs-medium: clamp(1rem, 1rem + ((1vw - 0.2rem) * 0.552), 1.2rem);
```

Replace with:

```css
  --fs-x-small: clamp(0.875rem, 0.875rem + ((1vw - 0.2rem) * 0.4), 0.95rem);
  --fs-small: clamp(1rem, 1rem + ((1vw - 0.2rem) * 0.3), 1.1rem);
  --fs-medium: clamp(1.1rem, 1.1rem + ((1vw - 0.2rem) * 0.4), 1.25rem);
```

Rationale: `--fs-small` now floors at 16px (1rem); `--fs-x-small` at 14px (still readable but small enough for de-emphasised labels); `--fs-medium` lifted slightly to keep the scale's relative steps.

- [ ] **Step 2: Verify at multiple viewports in browser DevTools**

Open Chrome DevTools, switch to responsive mode. Test at 360px, 414px, 768px, 1280px:
- Body text minimum legible (≥16px on phones)
- No new horizontal scroll
- Hero name still fits on one line at 360px (this is constrained by its own clamp in `src/pages/index.astro` line ~241, unaffected here)
- Nav links don't wrap awkwardly in the mobile hamburger panel

- [ ] **Step 3: Check the contact form on iOS sizing**

In DevTools mobile, focus an input. Confirm it doesn't auto-zoom (font-size ≥16px prevents this on iOS Safari).

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "a11y: floor body text at 16px on mobile to prevent iOS zoom and improve readability"
```

---

### Task 7: H5 — Quieter link underline, accent on hover

**Files:**
- Modify: `src/styles/global.css` (the `:root` palette + the `a` and link-hover rules)

- [ ] **Step 1: Remove the `--color-link-hover` token**

Find in `:root`:

```css
  --color-link-hover: #4c7b72;
```

Delete this line.

- [ ] **Step 2: Confirm no other rule references the deleted token**

Run: `grep -rn "color-link-hover" src/`
Expected: only matches inside `src/styles/global.css` that you're about to edit (or no matches if already cleaned).

If any other file uses it, replace the reference with `var(--color-accent)`.

- [ ] **Step 3: Edit the `a` and hover rules**

Find:

```css
a {
  color: var(--color-text);
  font-family: var(--font-sans);
  text-decoration: underline;
  text-decoration-thickness: 0.0625em;
  text-underline-offset: 0.3em;
}

p a:hover,
li a:hover {
  color: var(--color-link-hover);
  text-decoration: none;
}
```

Replace with:

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

- [ ] **Step 4: Verify in browser**

Reload. Body links (the parish names in the About paragraph) should now have a softer warm-grey underline. Hover one: text and underline shift smoothly to the purple accent.

Tab to a link (without hovering): focus ring shows (Task 5), underline stays muted. This confirms hover and focus are independent.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "type: quieter link underlines, single-purpose accent on hover"
```

---

## Homepage component changes

### Task 8: H1 — Tighter hero H1

**Files:**
- Modify: `src/pages/index.astro` (`.hero__name` rule in the `<style>` block, around lines 157-162)

- [ ] **Step 1: Edit `.hero__name`**

Find:

```css
  .hero__name {
    font-family: var(--font-sans);
    font-size: clamp(40.809px, 2.551rem + ((1vw - 3.2px) * 6.24), 77px);
    line-height: 0.8;
    font-weight: 700;
  }
```

Replace with:

```css
  .hero__name {
    font-family: var(--font-sans);
    font-size: clamp(40.809px, 2.551rem + ((1vw - 3.2px) * 6.24), 77px);
    line-height: 0.8;
    font-weight: 700;
    letter-spacing: -0.022em;
    font-feature-settings: "kern", "liga", "calt", "ss01";
  }
```

- [ ] **Step 2: Verify in browser**

Reload http://localhost:4321. The "Luca Wetherall" headline should look fractionally tighter — the negative tracking pulls the letters together, kerning improves the "Lu", "ch", "th" pairs, and `ss01` may swap the `a`/`g` to alternate shapes (subtle).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "type: tighten hero H1 with negative tracking and OpenType features"
```

---

### Task 9: H3 — Em-dash markers on Recent Projects list

**Files:**
- Modify: `src/pages/index.astro` (`.row__list` rules in the `<style>` block, around lines 195-202)

- [ ] **Step 1: Edit the list styles**

Find:

```css
  .row__list {
    padding-left: var(--block-gap);
  }
  .row__list li {
    font-size: clamp(0.875rem, 0.875rem + ((1vw - 0.2rem) * 0.759), 1.15rem);
    line-height: 1.3;
  }
  .row__list li + li { margin-top: var(--space-20); }
```

Replace with:

```css
  .row__list {
    list-style: none;
    padding-left: 0;
  }
  .row__list li {
    font-size: clamp(0.875rem, 0.875rem + ((1vw - 0.2rem) * 0.759), 1.15rem);
    line-height: 1.3;
    padding-left: 1.1em;
    text-indent: -1.1em;
  }
  .row__list li::before {
    content: "— ";
    color: var(--color-muted);
  }
  .row__list li + li { margin-top: var(--space-20); }
```

- [ ] **Step 2: Verify in browser**

Reload. Recent Projects items should each begin with an em-dash + space, hanging indent so wrapped lines align under the project description (not under the dash).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "type: replace bullet list markers with em-dashes on Recent Projects"
```

---

### Task 10: H4 — Small-caps section labels

**Files:**
- Modify: `src/pages/index.astro` (markup around lines 82, 93 + `.row__label` style around lines 186-189)

- [ ] **Step 1: Edit the label markup**

Find:

```astro
        <p class="row__label"><strong>About:</strong></p>
```

Replace with:

```astro
        <p class="row__label">About</p>
```

And find:

```astro
        <p class="row__label"><strong>Recent Projects:</strong></p>
```

Replace with:

```astro
        <p class="row__label">Recent Projects</p>
```

- [ ] **Step 2: Edit `.row__label` style**

Find:

```css
  .row__label {
    font-size: clamp(0.929rem, 0.929rem + ((1vw - 0.2rem) * 1.299), 1.4rem);
    font-family: var(--font-serif);
  }
```

Replace with:

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

- [ ] **Step 3: Verify in browser**

Reload. "ABOUT" and "RECENT PROJECTS" (rendered in small-caps with letter-spacing) sit above their respective columns. No colon. Visually quieter than the previous bold serif.

If small-caps look like fake all-caps (browser not honoring `font-variant-caps`), confirm `font-variant-caps: all-small-caps;` is supported in your test browser — all modern browsers support it. Fallback: it degrades to regular caps which is acceptable.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "type: small-caps section labels in place of bold serif headings"
```

---

### Task 11: M2 — Interpunct-separated tagline

**Files:**
- Modify: `src/pages/index.astro` (hero text markup around line 73)

- [ ] **Step 1: Edit the first hero line**

Find:

```astro
        <p class="hero__line"><strong>Conductor, bass, pianist, singing teacher, and arranger.</strong></p>
```

Replace with:

```astro
        <p class="hero__line"><strong>Conductor</strong> · <strong>bass</strong> · <strong>pianist</strong> · <strong>singing teacher</strong> · <strong>arranger</strong></p>
```

Note: trailing period removed (a billing-line doesn't terminate); the other two `.hero__line` paragraphs are unchanged.

- [ ] **Step 2: Verify in browser**

Reload. The hero discipline line now reads as a credit/billing line with interpuncts between each role. At small viewports, the line wraps — the wrap point may differ from before (commas vs interpuncts have similar width).

Check at 360px viewport: confirm the line wraps cleanly without orphaning a single word on its own line. If it does orphan, no action needed (the line was always going to wrap on phones; this is the same visual outcome).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "copy: interpunct-separated hero tagline reads as a credit line"
```

---

## View transitions

### Task 12: M5 — Astro view transitions with persistent header

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Add the `ViewTransitions` import and tag**

Edit `src/layouts/BaseLayout.astro`. In the frontmatter (the `---` block at the top), add the import after the existing font imports:

```astro
import { ViewTransitions } from 'astro:transitions';
```

In the `<head>` block, add `<ViewTransitions />` just before the closing `</head>` (after the JSON-LD block):

```astro
    {jsonLd && (
      <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
    )}

    <ViewTransitions />
  </head>
```

- [ ] **Step 2: Persist the header across navigation**

Edit `src/components/Header.astro`. On the `<header>` element (line 15), add a `transition:persist` directive:

```astro
<header class:list={['header', { 'header--mobile-only': showOnMobileOnly }]} transition:persist>
```

- [ ] **Step 3: Verify in browser**

Reload http://localhost:4321. Click About / Teaching / Contact in the header nav. Expected:
- A subtle crossfade between page bodies (~200ms default)
- The header itself does not flicker — it remains visually present throughout the transition
- No layout shift on either page edge
- Browser back/forward also transitions

If using Safari, view transitions degrade gracefully (instant nav) — that's acceptable per the spec.

- [ ] **Step 4: Verify with `prefers-reduced-motion: reduce`**

In Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". Reload and navigate again. Expected: instant page change, no animation. (Astro disables view transitions under reduced-motion automatically.)

- [ ] **Step 5: Confirm the build still produces static HTML**

Run: `npm run build`
Expected: Astro completes the build to `dist/` without error. View transitions ship in core, no runtime requirement for the static deploy.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/Header.astro
git commit -m "motion: Astro view transitions with persistent header"
```

---

## Remove the zoom hack (highest blast radius — done last)

### Task 13: C1 — Remove `zoom: 0.85` and re-tune hero spacing

**Files:**
- Modify: `src/styles/global.css` (the `@media (min-width: 782px)` block around lines 66-80)
- Modify: `src/pages/index.astro` (hero spacer heights around lines 146-147)

- [ ] **Step 1: Take a "before" screenshot**

In Chrome at 1440×900, take a full-page screenshot of http://localhost:4321/. Save as `/tmp/home-before-c1.png`. This is the reference for visual diffing.

- [ ] **Step 2: Remove the zoom rule but keep the flex column footer-anchor**

Find:

```css
@media (min-width: 782px) {
  body {
    zoom: 0.85;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    overflow: hidden;
  }
  main {
    flex: 1 0 auto;
  }
  footer {
    flex-shrink: 0;
  }
}
```

Replace with:

```css
@media (min-width: 782px) {
  body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  main {
    flex: 1 0 auto;
  }
  footer {
    flex-shrink: 0;
  }
}
```

(Removed `zoom: 0.85` and `overflow: hidden` — the footer-at-bottom flex anchor stays.)

- [ ] **Step 3: Re-tune hero spacers to compensate for the lost 0.85× scale**

The original spacers (`100px` top, `63px` bottom) were sized assuming a 0.85× zoom — so visually they were ~85px and ~54px. Without zoom, they will look ~17% too tall.

Edit `src/pages/index.astro`. Find:

```css
  .hero__top-spacer { height: 100px; }
  .hero__bottom-spacer { height: 63px; }
```

Replace with:

```css
  .hero__top-spacer { height: 72px; }
  .hero__bottom-spacer { height: 48px; }
```

(72px and 48px hit baseline-rhythm multiples from Task 1 — 3 baselines and 2 baselines — and approximate the previously-zoomed visual heights.)

- [ ] **Step 4: Reload and compare at 1440×900**

Reload http://localhost:4321/. Take a new full-page screenshot, save as `/tmp/home-after-c1.png`. Compare against `/tmp/home-before-c1.png`.

Expected differences:
- The page renders ~17% larger overall (no longer scaled down)
- Hero spacing visually similar (compensated by the new spacer heights)
- The footer is still near the bottom of the viewport (flex column intact)
- Type is now at its declared sizes (the `clamp()` maxima now actually apply)

Acceptable: small overflows that cause a scrollbar to appear on shorter viewports. The `overflow: hidden` was masking these — they were always there.

Not acceptable: text breaking out of containers, columns colliding, headshot stretched.

- [ ] **Step 5: Test at multiple viewports**

Use Chrome DevTools responsive mode. Confirm at 1280×800, 1440×900, 1920×1080, 768×1024, 360×640:
- No horizontal scroll
- Hero readable, headshot proportional
- About / Recent Projects columns not colliding
- Footer not pushed off-screen, no awkward gap above it
- Nav links not wrapping or overlapping

- [ ] **Step 6: Test browser zoom**

At 1440×900, press Cmd/Ctrl + several times to zoom to 200%. Expected: page reflows, no content cut off, no horizontal scroll required to read body copy. (This was previously fighting against the `zoom: 0.85` rule.)

- [ ] **Step 7: Run a final Lighthouse audit**

In Chrome DevTools → Lighthouse → Run on http://localhost:4321/. Expected:
- Accessibility ≥ previous baseline (no regressions)
- Best Practices ≥ previous baseline
- No new errors

- [ ] **Step 8: Confirm production build**

Run: `npm run build && npm run preview`
Open the preview URL. Confirm the static build renders identically to the dev server.

- [ ] **Step 9: Commit**

```bash
git add src/styles/global.css src/pages/index.astro
git commit -m "a11y: remove zoom:0.85 hack, re-tune hero spacers to baseline rhythm"
```

---

## Final verification

### Task 14: End-to-end audit

**Files:** none modified — verification only.

- [ ] **Step 1: Full browser matrix walkthrough**

Open each of the following in a real browser (not just DevTools emulation) and visit Home, About, Teaching, Contact:

- Chrome desktop
- Safari desktop
- Firefox desktop
- iOS Safari (or DevTools iOS emulation at 390×844)
- Android Chrome (or DevTools Android emulation at 412×915)

Check on each:
- Page renders without layout breakage
- Tab navigation shows the new focus ring
- Hover on body links transitions to accent
- View transitions work (Chrome/Firefox) or degrade cleanly (Safari)
- No console errors

- [ ] **Step 2: Accessibility scan**

Run Lighthouse → Accessibility on each of the four pages. Confirm score ≥ 95 with no critical errors.

Run axe DevTools (browser extension) on the homepage. Confirm no contrast or focus-order violations.

- [ ] **Step 3: Reduced-motion verification**

In Chrome DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Reload and navigate. Confirm:
- View transitions are skipped (instant page change)
- Hover transitions on links still work (these are sub-300ms and acceptable under reduced-motion; we're not animating layout)

- [ ] **Step 4: Print preview**

In Chrome → Print → Preview the homepage. The page should print legibly — not pretty (we deferred L1), but no content cut off, links visible.

- [ ] **Step 5: Production build & deploy preview**

Run: `npm run build`
Expected: clean build, no warnings.

Run: `npm run preview` and walk through the four pages one more time on the static preview.

- [ ] **Step 6: Final commit (only if any tuning was needed during this pass)**

If steps 1-5 surfaced any small issues that needed fixing, commit them with a message like:

```bash
git add <files>
git commit -m "polish: final-audit tuning after craft-enhancements pass"
```

If no further changes were needed, skip this step.

- [ ] **Step 7: Push the branch**

Run: `git push -u origin HEAD`
Expected: branch pushed. Open a PR against `main` summarising the 13 enhancements.

---

## Roll-back strategy

Each task is a single commit. To roll back any individual enhancement:

```bash
git log --oneline    # find the commit hash
git revert <hash>    # creates an inverse commit
```

For Task 13 (zoom removal) specifically, if regressions are found post-deploy that can't be fixed quickly, revert just that commit — the other 12 enhancements are independent and remain in place.
