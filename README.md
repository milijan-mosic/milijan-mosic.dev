# milijan-mosic.dev

My personal site. Built with Solid Start, TypeScript and Tailwind, prerendered to static HTML and served by
Caddy from my own VPS. The only server-side code is the contact form.

## Repository

```
v2/                        the site — see v2/README.md for scripts, build and content editing
server/Caddyfile           production Caddy config (milijan-mosic.dev, www redirect, notes.)
server/local.Caddyfile     local dev Caddy config (app.moss.local)
docker-compose.yaml        production stack
local.docker-compose.yaml  local dev stack
src/                       the previous Go + templ site, kept for rollback
logo.png, tsunami_software.png   logo masters the favicons and icons are generated from
docs/                      early notes on content and layout
```

## Running it locally

Needs Docker with the buildx plugin, and this line in `/etc/hosts`:

```
127.0.0.1 app.moss.local
```

Then:

```bash
cp v2/env.example v2/.env    # fill in the keys
docker compose -f local.docker-compose.yaml up --build
```

The site is at <https://app.moss.local>. The certificate is self-signed, so the browser will warn once.
Edits under `v2/src`, `v2/content` and `v2/public` reload instantly. Rebuild (`--build`) only after changing
`package.json`, `vite.config.ts` or `tsconfig.json`.

Without Docker: `cd v2 && npm install && npm run dev`, then open <http://localhost:3000>.

## Production

On the VPS:

```bash
docker compose up -d --build
```

Caddy gets and renews the TLS certificate itself. The app container builds the site, copies the static
files into a volume Caddy serves from, and then only handles `/api/contact`. The pre-deploy checklist and
the rollback steps are in `TESTING.md`.

## The old site (v1)

`src/` is the Go + templ version. Nothing runs it anymore. To start it for comparison:

```bash
cd src/ ; templ generate --watch --proxy="http://localhost:20000" --cmd="go run ."
cd src/ ; npx @tailwindcss/cli -i ./static/css/global.css -o ./static/css/base.css --watch
cd src/ ; npx vite build --watch    # shader bundle
```
