# Verification — v2

**Everything is verified (2026-09-29). Nothing is open.** v2 is live on https://milijan-mosic.dev. What's
below is the record and the reference for future changes.

**Verified:** typecheck, Prettier, content validation, build + prerender, no secrets in `dist/client`,
heading hierarchy and landmarks, Lighthouse (locally and in production), the 404 page and contact form
(locally and in production), the production deploy, the CSP (delivered, enforced, no violations on page load
or through a real contact-form send), consent (denied by default, Accept sets `_ga`, a stored choice
survives a reload, Reject clears `_ga*`, "Cookie settings" reopens the banner), the visual comparison with
v1, the shader (colour, smoothness, crop-on-resize), and the feedback-round spacing and icon-size items.
`local.Caddyfile` has the one-line CSP change but hasn't been started since.

Run locally at <https://app.moss.local> (accept the self-signed certificate warning):

```bash
docker compose -f local.docker-compose.yaml up --build
```

This is the dev stack (`vite dev`, hot reload). It has no prerendered HTML, no cache rules and no
`handle_errors`, so the final CSP and Lighthouse numbers only mean something against the production build —
which in practice means the real deploy.

---

## Production

**Live on v2 since 2026-09-29.** Lighthouse against the real domain, after the CSP fix: desktop
100/100/100/100, mobile 99/100/100/100 (FCP 1.2 s, LCP 2.1 s under mobile throttling), no console errors,
all 17 requests 200.

**CSP is now delivered and enforced** (the fix was deployed 2026-09-29). Earlier, the multi-line value was
dropped over HTTP/2, so no policy had ever been enforced, v1 included. Lighthouse now reads the policy and
reports only the accepted `'unsafe-inline'` / host-allowlist / Trusted Types warnings. Page load and the
contact form are clean under it.

### VPS notes

- `server/Caddyfile` also serves `notes.milijan-mosic.dev` (SilverBullet from the separate `vps-notebook`
  compose project, reached over `caddy_shared`). The notes live in `/opt/silverbullet/space`, a host bind
  mount that nothing in this repo touches.
- The VPS had the apt `caddy` package running as a system service with its default `:80` config. It took
  port 80, so `mm_dev_server` failed with `bind: address already in use`. It's now
  `systemctl disable --now caddy`. If that error comes back, run `sudo ss -ltnp 'sport = :80'` first.

**Rollback:** `aa4201a` is the last commit whose compose file and Caddyfile run v1.

```bash
docker compose down
git checkout aa4201a -- docker-compose.yaml server/Caddyfile
docker compose up -d --build
# afterwards, restore the v2 files: git checkout HEAD -- docker-compose.yaml server/Caddyfile
```

---

## Known non-issues

Don't chase these:

- **Lighthouse "Minify JavaScript" / "Reduce unused JavaScript" (54 / 101 KiB)**: that code comes from a
  browser extension (`chrome-extension://eimadpbc…`, Dark Reader), not the site. Run Lighthouse in a
  private window for clean numbers.
- **Lighthouse "Use efficient cache lifetimes" (4 KiB)**: `gtag/js` is Google's file, and Google sets its
  cache headers.
- **Lighthouse "Improve image delivery" (6–11 KiB)**, **"Render-blocking requests"** (the 9 KiB CSS) and
  **"Network dependency tree"**: below the threshold, they cost no points.
- **`requestStorageAccess: Permission denied`** in the console after sending the contact form. It comes
  from reCAPTCHA's own iframe (`anchor?…&size=invisible`) asking Chrome for its third-party cookies, and
  Chrome refusing. It isn't a CSP block (those start with `Refused to…`), reCAPTCHA works without the
  cookies, and nothing on our side can change it.
- **Firefox: "preloaded with link preload was not used within a few seconds"** for the latin woff2. The
  preload's attributes match the `@font-face` rule, and Chrome fetches the font once. Firefox reports it
  on reloads served from cache. It only matters if the Network tab shows the file fetched twice on a first
  visit.
- **No `_ga` in Brave, Firefox private windows, or with an ad blocker.** They replace gtag.js with a
  do-nothing stand-in (tell-tales: `typeof google_tag_manager` is `undefined`, `dataLayer.push` is a
  `Proxy`, and `gtag/js` is ~3.7 KB over HTTP/1.1 instead of ~530 KB). Test GA in plain Chromium.
- **`certutil is not available`** in local Caddy logs — it can't install its CA into a browser trust store
  from inside the container.
- **`stapling OCSP`** warning locally — internally-issued certs have no OCSP responder.
