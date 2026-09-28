# CLAUDE.md

Personal site of Milijan Mosić, self-hosted on a VPS behind Caddy. **`v2/` (Solid Start 2 + TypeScript +
Tailwind v4 + Vite 8) is the site.** `src/` is the old Go + templ app, kept only as a rollback path — don't
edit it. `TESTING.md` is the list of what's still unverified; read it first when resuming work.

Security rules live in `.claude/SECURITY.md` (do not modify). Code style basics are in `AI_GUIDELINES.md`.

## Commands

Run from `v2/`. Node 24+.

```bash
npm run dev                # vite dev on :3000 (no Caddy, no CSP)
npm run check              # prettier --check + tsc --noEmit + content validation
npm run build              # validate content → vite build → prerender / and /404 into dist/client
npm run format             # prettier --write
npm run optimize:assets    # regenerate images/icons into public/ (outputs are committed)
```

From the repo root:

```bash
docker compose -f local.docker-compose.yaml up --build   # DEV stack: https://app.moss.local, hot reload
docker compose up -d --build                             # PROD stack — on the VPS this is the live site
```

Neither Docker, Caddy nor a browser exists in the devcontainer. Anything that needs them (container builds,
`caddy validate`, Lighthouse, visual checks) — hand the user the command and let them report back.

## Architecture

- **Rendering:** `scripts/prerender.ts` (postbuild) calls the built handler's `app.fetch()` for `/` and
  `/404` and writes HTML into `dist/client`. Caddy serves those files directly; Node is only in the request
  path for `POST /api/contact` (`src/routes/api/contact.ts` → Resend, with reCAPTCHA v3, honeypot and an
  in-memory rate limit).
- **`server.ts`** wraps the built H3 app with `srvx` on port 40000. Node 24 strips its types at load.
- **Content:** all copy is in `v2/content/*.json`, typed in `src/content/types.ts`, Zod-validated by
  `scripts/validate-content.ts` at prebuild (icon names, image paths under `public/`, non-empty fields).
- **Icons:** FontAwesome names listed in `src/lib/icon-names.ts` plus every SVG in `src/assets/icons/`.
- **Background:** raw WebGL (`src/components/background/`), no three.js.
- **Consent:** Consent Mode v2, everything denied by default; `src/lib/consent.ts` + `CookieBanner.tsx`.

### Docker / Caddy

|                   | Local (`local.docker-compose.yaml`)                          | Prod (`docker-compose.yaml`)                                  |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| Dockerfile target | `dev` — `vite dev`, `src/ content/ public/` mounted `:ro`    | final stage — prerendered build + `server.ts`                 |
| Caddyfile         | `server/local.Caddyfile`, `tls internal`, proxies everything | `server/Caddyfile`, ACME certs, static files from `/srv/v2`   |
| Env               | `v2/.env` via `env_file`                                     | `v2/.env` via `env_file` **and** as BuildKit secret `app_env` |

Services are `mm_dev_server` (Caddy) and `mm_dev_app` (Node, `expose` 40000 — never publish it with
`ports`). On start the prod app copies `dist/client` into the `v2_static` volume that Caddy mounts.

## Gotchas

- **SolidStart 2.x has no SSG and no deploy presets**, and its README still documents 1.x. Prerendering and
  the listening server are ours (see above). Trust its type definitions and CHANGELOG, not the README.
- **Keep the final prod stage last** in `v2/docker/Dockerfile`; it's the default target.
- **The local stack is a dev stack on purpose**, not a prod replica. Don't "fix" it to match prod.
- **Never add `Strict-Transport-Security` to `local.Caddyfile`** — with `tls internal` it locks the browser
  out. Otherwise keep the CSP identical in both Caddyfiles.
- **`VITE_*` keys are inlined at build time.** `.env` is in `.dockerignore`, so the prod image only gets
  them through the `app_env` build secret (needs `docker-buildx`).
- **Server-only env vars** (`RESEND_API_KEY`, `RECAPTCHA_SECRET_KEY`, `CONTACT_*`) are read only in
  `src/routes/api/contact.ts`. Referencing one from a component ships it to the client.
- **Keep Zod out of the client:** components import `src/lib/contact.ts`, never `contact-schema.ts`.
- `src/lib/icon-names.ts` must stay plain TS (no Vite syntax) — the validator imports it under bare Node.
- Every SVG in `src/assets/icons/` is bundled (eager glob). Delete icons that are no longer used.
- **Shader:** the pattern math in `shader.glsl.ts` is the site's visual identity — don't change it. It
  needs `highp` (mediump quantises the growing `time`). `uScale` crops rather than stretches; the
  undistorted shape is `REFERENCE_ASPECT` in `webgl.ts`.
- Fonts need the latin-ext subset (ć in Serbian names); `@font-face` rules are hand-written in `app.css`.
- `vite.config.ts` needs `allowedHosts: ["app.moss.local"]` for the Caddy-fronted dev stack.
- `optimize-assets.ts` reads its source photos from `src/static/images` (v1) and the logo masters from
  `logo.png` / `tsunami_software.png` at the repo root.

## Environment and secrets

- The env template is `v2/env.example` — **no leading dot**, because the settings deny rule on `.env.*`
  also blocks writing `.env.example`. Keep that naming for any new template.
- **Never read a `.env` file with any tool, including Bash.** Infer from `env.example`, the code, or the
  build output, or ask.
- The devcontainer firewall allows only a fixed list of hosts (`.devcontainer/init-firewall.sh`, reasons in
  `REQUIRED_DOMAINS.md`). `cdn.jsdelivr.net` is blocked; pull npm-published files with `npm pack` instead.

## Working with the owner

- Don't decide what gets tracked in git, and don't stage or commit unless asked.
- Anything new that makes the site talk to a third party must be flagged — the VPS is self-hosted on purpose.
  Google Analytics, reCAPTCHA and Resend are the accepted exceptions.
- Strict TypeScript and Prettier everywhere, including scripts. No `any`.
- Be explicit about what was verified (ran it) versus only written.
