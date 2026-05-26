# WordPress → Astro / GitHub Pages migration

## Source-of-truth: what WordPress currently publishes

Pulled from `http://lucawetherall.co.uk/page-sitemap.xml` and `/wp-json/wp/v2/pages`.

| WP URL | WP page ID | Last modified | Maps to (new Astro) | Action |
|---|---|---|---|---|
| `http://lucawetherall.co.uk/` | 4 | 2025-11-15 | `https://lucawetherall.co.uk/` | HTTP→HTTPS only |
| `http://lucawetherall.co.uk/about` | 309 | 2026-01-13 | `https://lucawetherall.co.uk/about/` | 301 |
| `http://lucawetherall.co.uk/contact` | 41 | 2025-05-22 | `https://lucawetherall.co.uk/contact/` | 301 |
| `http://lucawetherall.co.uk/teaching` | 195 | 2025-05-22 | `https://lucawetherall.co.uk/teaching/` | 301 |
| `http://lucawetherall.co.uk/my-account` | 190 | 2023-10-23 | (gone) | **410 Gone** via Worker |

## Critical pre-migration facts (discovered)

- **Live WP site is HTTP only** (no HTTPS). Google may have indexed both `http://` and (less likely) `https://` versions. Cloudflare's "Always Use HTTPS" setting handles this after cutover.
- **WP URLs have NO trailing slash** (`/about` not `/about/`). New Astro site is now configured with `trailingSlash: 'always'` so every old URL needs one 301 to add the slash.
- **Yoast SEO + W3 Total Cache** are the active SEO/perf plugins. Both go away with the migration.
- **Stale meta descriptions on WP**: every page has the same Yoast description ("Liverpool based pianist, singer, guitarist and trombonist… Grade 8+ musician") — completely outdated relative to the user's current positioning. The new Astro site has fresh, accurate metadata.
- **AMP variants exist** (`?amp` query param appears on every WP page). These are unlikely to be indexed but a query-string-stripping rule is cheap insurance.
- **Stale WP head links** include `xmlrpc.php`, `wp-json/oembed`, `wp-content/uploads/*` images, RSS feeds. None of these will exist on the new site. Anything indexed will 404 — acceptable, none are ranking content.

## /my-account handling

**Decision: 410 Gone** (WooCommerce decommissioned, fastest deindex signal).

Cloudflare Bulk Redirects can only return 3xx status codes, and GitHub Pages is static. So `/my-account` is handled by a Cloudflare Worker — see [`gone-worker.js`](gone-worker.js).

Deploy steps:
1. Cloudflare dashboard → Workers & Pages → Create Worker
2. Paste `gone-worker.js` contents, deploy
3. Workers → Triggers → Add route: `lucawetherall.co.uk/my-account*`

## Redirect implementation

Once domain is on Cloudflare:

1. **Cloudflare → SSL/TLS → Edge Certificates → "Always Use HTTPS": ON.** Handles every `http://` → `https://` upgrade with no rules needed.
2. **Cloudflare → Rules → Redirect Rules** (or Bulk Redirects), load `redirects.csv` (sibling file).
3. **Cloudflare → Rules → Configuration Rules**: optionally strip `?amp` query param.

GitHub Pages itself, when serving a static site built with `trailingSlash: 'always'` + `build.format: 'directory'`, will 301 `/about` → `/about/` natively. The Cloudflare rule is belt-and-braces — guarantees a single hop with no dependency on GH Pages behavior.

## Cutover sequence

1. Domain transfer 1&1 → Cloudflare (5–7 days, kick off early)
2. While transferring: drop 1&1 DNS TTL to 300s
3. Once on Cloudflare: nameservers swap, DNS still points at 1&1 IPs — site behaves identically
4. Enable Cloudflare proxy (orange cloud), turn on Always Use HTTPS — at this point Cloudflare serves `https://` for the old WP site, which will return 200s (WP doesn't care which protocol Cloudflare uses to fetch)
5. In Cloudflare DNS: switch A record `lucawetherall.co.uk` from `217.160.0.141` → GitHub Pages IPs (`185.199.108.153`, `.154`, `.155`, `.156`), CNAME `www` → `lucawetherall.github.io`
6. Wait for GH Pages to issue Let's Encrypt cert on the apex domain (~15min)
7. Load redirect rules in Cloudflare
8. Resubmit `https://lucawetherall.co.uk/sitemap-index.xml` in GSC
9. Request indexing on the 4 surviving URLs in GSC

## Post-cutover validation checklist

- [ ] `curl -I http://lucawetherall.co.uk/about` → 301 to `https://lucawetherall.co.uk/about/` (single hop ideally)
- [ ] `curl -I https://lucawetherall.co.uk/about` → 301 to `https://lucawetherall.co.uk/about/`
- [ ] `curl -I https://lucawetherall.co.uk/about/` → 200
- [ ] `curl -I https://lucawetherall.co.uk/my-account` → 410 Gone
- [ ] `curl https://lucawetherall.co.uk/sitemap-index.xml` returns the new sitemap
- [ ] `curl https://lucawetherall.co.uk/robots.txt` references new sitemap
- [ ] GSC: sitemap submitted, no coverage errors after 7 days
- [ ] Top-traffic pages from GSC still rank within ±5 positions after 30 days
