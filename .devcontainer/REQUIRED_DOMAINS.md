# Additional firewall domains required by `v2/`

> **Status: already applied.** These seven domains have been added to `ALLOWED_DOMAINS` in
> `init-firewall.sh`. Rebuild the container to activate them. This file is the reference for
> *why* each one is there.

The v2 site (Solid Start) talks to three third-party services that the previous allowlist blocked.

Everything else in the v2 build — scaffolding, `npm install`, Tailwind, the font (self-hosted via
`@fontsource/fira-code`), and the Lighthouse run — works with the allowlist as it was before. Only the
live email send and the analytics/reCAPTCHA calls need these.

## What was added to `ALLOWED_DOMAINS`

```sh
  # ── v2: transactional email ────────────────────────────────────────────────
  "api.resend.com"              # Resend send call from /api/contact

  # ── v2: reCAPTCHA v3 ───────────────────────────────────────────────────────
  "www.google.com"              # api.js (browser) + /recaptcha/api/siteverify (server)
  "www.gstatic.com"             # reCAPTCHA runtime assets

  # ── v2: Google Analytics 4 ─────────────────────────────────────────────────
  "www.googletagmanager.com"    # gtag.js
  "www.google-analytics.com"    # GA4 collection
  "region1.google-analytics.com"
  "analytics.google.com"
```

## Which one unblocks what

| Domain | Needed by | Blocked without it |
|---|---|---|
| `api.resend.com` | `src/routes/api/contact.ts` | Contact form returns an error; no email sent |
| `www.google.com` | `lib/recaptcha.ts` + server-side `siteverify` | Form submits are rejected as unverified |
| `www.gstatic.com` | reCAPTCHA runtime | reCAPTCHA fails to initialise |
| `www.googletagmanager.com` | `gtag.js` in `entry-server.tsx` | Consent banner still works; no analytics |
| `www.google-analytics.com` + the two others | GA4 event collection | Accepting consent produces no hits |

## Caveat worth knowing

`init-firewall.sh` resolves each domain to fixed IPv4 addresses with `dig` **once, at container start**,
and allows only those IPs. Google serves these hostnames from large rotating ranges, so an analytics or
reCAPTCHA request can still fail intermittently inside the container even after allowlisting — the IP it
resolves to at request time may not be one of the IPs captured at boot.

This is a devcontainer-only artifact and does not affect the VPS deployment. If reCAPTCHA verification
proves too flaky to test locally, the practical workaround is to run that one verification step against a
build outside the container rather than widening the firewall.

No font or CDN domains are needed: Fira Code ships from npm and is self-hosted.
