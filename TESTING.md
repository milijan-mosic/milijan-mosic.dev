# Remaining verification — v2

What's left before v2 can be considered done. v2 is live, so section 2 applies to the real site.

**Already verified — don't redo:** typecheck, Prettier, content validation, build + prerender, no secrets in
`dist/client`, heading hierarchy and landmarks, Lighthouse (locally and in production), the 404 page and
contact form (locally and in production), the production deploy, the visual comparison with v1, the shader
(colour, smoothness, crop-on-resize), and the feedback-round spacing and icon-size items. Both Caddyfiles passed
`caddy validate` before the one-line CSP change; the Caddy container logs will show if the new version
doesn't parse.

Run locally at <https://app.moss.local> (accept the self-signed certificate warning):

```bash
docker compose -f local.docker-compose.yaml up --build
```

This is the dev stack (`vite dev`, hot reload). It has no prerendered HTML, no cache rules and no
`handle_errors`, so the final CSP and Lighthouse numbers only mean something against the production build —
which in practice means the real deploy.

---

## 1. Functional

### [ ] DevTools console — CSP

**Until the header fix in section 2, no policy reached the browser at all, so earlier passes don't count.**
A CSP block fails **silently**, and the v2 policy differs a lot from v1: `require-trusted-types-for`
removed, `'unsafe-inline'` in `script-src` and `style-src`, Google origins added for gtag and reCAPTCHA.

Load the page with the console open, then click into the contact form (that's when reCAPTCHA loads).
Look for `Refused to load…` or `Refused to execute…`.

One gap to watch: `www.gstatic.com` is in `script-src` but not in `img-src` or `style-src`. reCAPTCHA's
assets _should_ load inside its own iframe, where our policy doesn't apply. If gstatic shows up blocked,
it's a one-line fix in both Caddyfiles.

**Pass:** no CSP violations, before or after focusing the form.

### [ ] Consent / Consent Mode v2

Use a fresh profile or a private window, since a stored choice hides the banner.

- [ ] Banner appears on first visit
- [ ] **No `_ga` cookie** before choosing (DevTools ▸ Application ▸ Cookies)
- [ ] `dataLayer` in the console contains `consent default` with `analytics_storage: denied`
- [ ] **Accept** → `consent update` fires, `_ga` appears, choice survives a reload
- [ ] **Reject** → no `_ga`, banner stays dismissed
- [ ] Footer "Cookie settings" reopens the banner

---

## 2. Production

**Live on v2 since 2026-09-29.** Lighthouse against the real domain (reports in the repo root): desktop
100/100/100/100, mobile 99/100/100/100 (FCP 1.3 s, LCP 2.0 s under mobile throttling), no console errors.

### [ ] CSP header fix: fixed in both Caddyfiles, not yet deployed

Confirmed 2026-09-29: the header arrived over `--http1.1` and was missing over `--http2`. The policy was
written across several lines, and Go's HTTP/2 and HTTP/3 servers drop a header value that contains a
newline. Both Caddyfiles now have it on one line, with a comment saying why.

**This policy has never been enforced anywhere.** The local stack uses HTTP/2 as well, so every earlier
check (contact form, reCAPTCHA, GA, consent) ran without a CSP. Test locally before deploying:

```bash
docker compose -f local.docker-compose.yaml up -d --force-recreate mm_dev_server
curl -skI https://app.moss.local/ | grep -i content-security   # must print the policy
```

Then run section 1 there: the CSP console check, one test message through the contact form, and the
consent flow.

Deploy on the VPS. `--force-recreate` matters: `git pull` replaces the Caddyfile with a new file, and a
single-file bind mount keeps pointing at the old one.

```bash
git pull && docker compose up -d --force-recreate mm_dev_server
curl -sI --http2 https://milijan-mosic.dev/ | grep -i content-security   # must print the policy now
```

### [ ] Still to check in production

- [ ] CSP console check (section 1) once the header fix is live, plus one contact-form message with the
      policy enforced. The 2026-09-29 contact-form and 404 passes may have run before the fix.

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
- **`certutil is not available`** in local Caddy logs — it can't install its CA into a browser trust store
  from inside the container.
- **`stapling OCSP`** warning locally — internally-issued certs have no OCSP responder.
