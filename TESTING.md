# Remaining verification — v2

What's left before v2 can be considered done. Section 3 is the one with live consequences.

**Already verified — don't redo:** typecheck, Prettier, content validation, build + prerender, no secrets in
`dist/client`, heading hierarchy and landmarks, Lighthouse 100×4 (desktop and mobile), the 404 page, the
contact form, the visual comparison with v1, the shader (colour, smoothness, crop-on-resize), and the
feedback-round spacing and icon-size items. Both Caddyfiles pass `caddy validate`.

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

## 2. Content workflow

The point of the JSON content layer, never exercised end to end.

- [ ] **Edit** a string in `v2/content/projects.json`, rebuild, confirm it appears with no code change
- [ ] **Break** it — set a `"name"` to `""` — and confirm the build fails at the `prebuild` step instead
      of shipping a broken page

```bash
cd v2 && npm run build     # prebuild runs validate-content automatically
```

---

## 3. Production deploy

⚠️ **`docker compose up` with `docker-compose.yaml` switches the live site to v2.**

- [ ] `v2/.env` on the VPS with all six keys
- [ ] `docker-buildx` installed on the VPS — the prod build passes `.env` in as a BuildKit secret
- [ ] Ports 80 and 443 open and DNS pointing at the VPS. Caddy gets and renews the certificate itself
      into the `caddy_data` volume; `certs/` is no longer used
- [ ] `caddy_shared` network exists (`docker network ls`). It's `external: true`, so compose won't create it
- [ ] **`docker ps` before deploying.** The v1 containers (`server`, `my_app`) are named differently from
      v2's, so compose won't replace them — they'll keep holding 80/443. Symptom: the new Caddy logs look
      healthy while the browser still talks to the old one
- [ ] Deploy:

```bash
docker compose up -d --build
docker ps --format 'table {{.Names}}\t{{.Ports}}'   # mm_dev_server must own 80/443
```

- [ ] Lighthouse against the real domain
- [ ] Contact form in production (real origin and cert, live reCAPTCHA)
- [ ] 404 page and CSP console check again — first time either runs against the prerendered build behind
      the real Caddyfile

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

- **Lighthouse "Improve image delivery" (6–11 KiB)** and **"Render-blocking requests"** — below the
  threshold, cost no points.
- **`certutil is not available`** in local Caddy logs — it can't install its CA into a browser trust store
  from inside the container.
- **`stapling OCSP`** warning locally — internally-issued certs have no OCSP responder.
