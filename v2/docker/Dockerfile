# Stages:
#   deps     — npm ci, shared by everything below; cached until package-lock.json changes
#   dev      — `vite dev` with hot reload; local.docker-compose.yaml builds this target
#   builder  — production build + prerender
#   (final)  — production runtime; the default target, used by docker-compose.yaml
#
# SolidStart 2.x requires Node 24+.

# =========================
# Dependencies
# =========================
FROM node:24-alpine AS deps

WORKDIR /app

# Only the manifests, so any source change reuses this (slow) layer.
COPY package.json package-lock.json ./
RUN npm ci

# =========================
# Development
# =========================
FROM deps AS dev

# Config is baked in (changing it means `up --build`, which only re-runs this
# cheap layer). src/, content/ and public/ are bind-mounted read-only by
# local.docker-compose.yaml, so edits hot reload with no rebuild — and because
# the mounts sit beside node_modules rather than over /app, the image's own
# node_modules (built for Alpine's musl) is never hidden by the host's.
COPY vite.config.ts tsconfig.json ./

# Runs as root on purpose: every mount is read-only, so the container can't
# touch your files, and Vite is free to write its caches into node_modules.
# The VITE_* keys come from env_file — Vite reads prefixed vars from process.env
# as well as from .env.
EXPOSE 40000
CMD ["npx", "vite", "dev", "--host", "0.0.0.0", "--port", "40000"]

# =========================
# Production build
# =========================
FROM deps AS builder

COPY . .

# `build` emits dist/client (assets) + dist/server (SSR handler); the postbuild
# prerender step then writes dist/client/{index,404}.html.
#
# .env is in .dockerignore, but Vite inlines the VITE_* keys (reCAPTCHA site key,
# GA ID) at build time — without it the client ships with neither and every
# contact submission fails verification. Mounting it as a secret exposes it to
# this one RUN only; it never lands in a layer.
RUN --mount=type=secret,id=app_env,target=/app/.env npm run build

# Drop dev dependencies (sharp, typescript, vite) from the shipped node_modules.
RUN npm prune --omit=dev

# =========================
# Production runtime — keep this stage last so it stays the default target
# =========================
FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

# Caddy serves the prerendered HTML itself, but those files live in this image.
# Creating the directory here (owned by node) means the shared volume mounted
# over it inherits that ownership, so the copy below needs no root.
RUN mkdir -p /srv/v2 && chown node:node /srv/v2

# Run unprivileged; the node image already provides this user.
USER node

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/server.ts ./server.ts
COPY --from=builder --chown=node:node /app/types ./types
COPY --from=builder --chown=node:node /app/package.json ./package.json

EXPOSE 40000

# Publish the static build into the shared volume, then serve /api/contact.
# This keeps the VPS free of any Node toolchain — the image is the only source
# of truth for both the HTML and the API. server.ts runs directly: Node 24
# strips the types at load, so there is no separate compile step.
CMD ["sh", "-c", "cp -a /app/dist/client/. /srv/v2/ && exec node server.ts"]
