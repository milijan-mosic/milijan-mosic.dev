# milijan-mosic.dev — v2

A Solid Start 2 + TypeScript + Tailwind v4 rewrite of the site, replacing the Go/templ app in `../src`.
The UI, copy and layout are a 1:1 port — this is a rewrite of the implementation, not a redesign.

## Requirements

Node 24+ (Solid Start 2.x requires it).

## Getting started

```bash
npm install
cp env.example .env      # then fill in the values
npm run dev              # http://localhost:3000
```

## Scripts

| Script                     | What it does                                                              |
| -------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`              | Vite dev server on :3000                                                  |
| `npm run build`            | `prebuild` validates content → `vite build` → `postbuild` prerenders HTML |
| `npm start`                | Serves the built SSR handler on :40000                                    |
| `npm run typecheck`        | `tsc --noEmit` — covers src, scripts, server.ts and vite.config.ts        |
| `npm run format`           | Prettier over the whole project                                           |
| `npm run check`            | format:check + typecheck + validate:content                               |
| `npm run validate:content` | Zod-checks every file in `content/`                                       |
| `npm run optimize:assets`  | Regenerates images and icons (outputs are committed)                      |

## How the build works

Solid Start **2.x dropped Nitro**, and with it both the `node-server` preset and `server.prerender.routes`.
The 2.0.5 README still documents the v1 preset model; it is stale. This project supplies both pieces itself:

- **`server.ts`** — `vite build` emits an H3 app at `dist/server/entry-server.js` that does not listen on
  anything. This wraps it with `srvx` and gives it a port.
- **`scripts/prerender.ts`** — runs as `postbuild`. Renders `/` and `/404` by calling
  `app.fetch(new Request(...))` directly and writes the markup into `dist/client/`. **`vite build` alone
  emits zero HTML**, so an empty `dist/client` means this step failed.

  It opens no socket on purpose: an earlier version booted a real server on a fixed port and broke the
  build with `EADDRINUSE` whenever anything else held that port.

In production Caddy serves `dist/client` as static files. Node is only in the request path for `/api/contact`.

## Layout

```
content/          all editable copy, plain JSON — validated by scripts/validate-content.ts
public/           optimized images, fonts, favicons (committed, not built on deploy)
scripts/          prerender, content validation, asset pipeline
src/
  routes/         index.tsx, [...404].tsx, api/contact.ts
  components/     layout/ sections/ background/ consent/ ui/
  content/        typed re-exports of the JSON above
  lib/            consent, recaptcha, contact schema
```

## Editing content

Everything the page says lives in `content/*.json`. Change a string, reload — no code edit needed.
`npm run validate:content` (which `prebuild` runs automatically) rejects unknown icon names, image paths
that don't exist on disk, and empty required fields, so a bad edit fails the build rather than the page.

Icons are referenced by name. The vocabulary is the 10 FontAwesome names in `src/lib/icon-names.ts` plus
every filename in `src/assets/icons/`.

## Environment

See `env.example` for the full list (named without the leading dot deliberately — see the file header). `RESEND_API_KEY`, `RECAPTCHA_SECRET_KEY`, `CONTACT_TO_EMAIL` and
`CONTACT_FROM_EMAIL` are **server-only** and must only ever be read through `process.env` inside
`src/routes/api/contact.ts` — referencing one from a component would inline it into the client bundle.
The two `VITE_`-prefixed keys are public by nature and are inlined at build time by design.

With no `RECAPTCHA_SECRET_KEY` set, the contact route skips captcha verification so local development works
without keys. With no `RESEND_API_KEY`, it returns a 500 rather than silently dropping the message.

## Deployment

`docker/Dockerfile` builds on `node:24-alpine` and runs `server.ts` on port 40000 (Node 24 strips the
types at load, so there is no separate compile step). On start the container
copies its `dist/client` into the `v2_static` volume, which Caddy mounts read-only at `/srv/v2` — so the VPS
needs no Node toolchain. See `../docker-compose.yaml`.

Old hashed assets accumulate in that volume across deploys. That is deliberate (in-flight page loads keep
working during a restart) but it does mean the volume grows slowly; clear it if it ever matters.
