#!/usr/bin/env bash
# Production deploy. Runs on the VPS, from the checkout it deploys.
#
# GitHub Actions (.github/workflows/deploy.yml) reaches it over SSH with a key
# that ~/.ssh/authorized_keys pins to this script (command="…",restrict), so
# that key can trigger a deploy and nothing else. Safe to run by hand too.
set -euo pipefail

REPO_URL="https://github.com/milijan-mosic/milijan-mosic.dev.git"
BRANCH="master"
SITE_URL="https://milijan-mosic.dev/"

cd "$(dirname "$(readlink -f "$0")")/.."

# One deploy at a time: a second push waits here instead of racing the first.
exec 9>.git/deploy.lock
flock 9

previous=$(git rev-parse HEAD)
echo "==> Current commit: $previous"

# Public repo, so plain HTTPS needs no credentials. --ff-only refuses to touch
# anything if the VPS checkout has diverged from GitHub.
git fetch --quiet "$REPO_URL" "$BRANCH"
git merge --ff-only FETCH_HEAD
current=$(git rev-parse HEAD)
echo "==> Deploying: $current"

# The old containers keep serving until the new image has built.
docker compose up -d --build

# The Caddyfile is a single-file bind mount. git replaces the file rather than
# editing it, so the running container keeps reading the old one until it's
# recreated. Recreating Caddy takes the site and notes down for a few seconds.
if ! git diff --quiet "$previous" "$current" -- server/Caddyfile; then
  echo "==> Caddyfile changed, recreating mm_dev_server"
  docker compose up -d --no-deps --force-recreate mm_dev_server
fi

# Only dangling images (earlier builds of mm_dev_app), never tagged ones.
docker image prune -f

echo "==> Health check: $SITE_URL"
for attempt in $(seq 1 10); do
  if headers=$(curl -fsS --http2 --max-time 10 -D - -o /dev/null "$SITE_URL" 2>&1); then
    if grep -qi '^content-security-policy:' <<<"$headers"; then
      echo "==> OK: 200 with CSP (attempt $attempt)"
      exit 0
    fi
    echo "Responded, but without a Content-Security-Policy header"
  fi
  sleep 3
done

echo "==> Health check FAILED. Previous commit was $previous" >&2
exit 1
