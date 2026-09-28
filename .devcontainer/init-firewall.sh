#!/bin/bash
# init-firewall.sh
# Restricts outbound network access from the Claude Code container.
# Only whitelisted domains are reachable. Everything else is blocked.
#
# Runs automatically on every container start (postStartCommand in devcontainer.json).
# To add a domain: add it to ALLOWED_DOMAINS below and rebuild the container.

set -euo pipefail

echo "[firewall] Initializing network restrictions..."

# ── Allowed outbound destinations ─────────────────────────────────────────────

ALLOWED_DOMAINS=(
  # Anthropic — required for Claude Code to function
  "api.anthropic.com"
  "platform.claude.com"
  "claude.ai"
  "statsig.anthropic.com"
  "downloads.claude.ai"
  "sentry.io"

  # Package managers
  "registry.npmjs.org"
  "pypi.org"
  "files.pythonhosted.org"
  "crates.io"

  # Source control
  "github.com"
  "api.github.com"
  "raw.githubusercontent.com"
  "objects.githubusercontent.com"
  "cli.github.com"

  # Yarn
  "registry.yarnpkg.com"
  "dl.yarnpkg.com"

  # VS Code extensions marketplace
  # Required for installing and updating extensions inside the container
  "marketplace.visualstudio.com"
  "eamodio.gallerycdn.vsassets.io"
  "vsassets.io"
  "vscode.blob.core.windows.net"
  "download.visualstudio.microsoft.com"

  # ── v2 site (Solid Start) third-party services ──────────────────────────────
  # See .devcontainer/REQUIRED_DOMAINS.md for what each one unblocks.

  # Transactional email — Resend send call from /api/contact
  "api.resend.com"

  # reCAPTCHA v3 — api.js in the browser, /recaptcha/api/siteverify on the server
  "www.google.com"
  "www.gstatic.com"

  # Google Analytics 4 — gtag.js and event collection
  "www.googletagmanager.com"
  "www.google-analytics.com"
  "region1.google-analytics.com"
  "analytics.google.com"
)

# ── Flush existing rules ───────────────────────────────────────────────────────
iptables -F OUTPUT 2>/dev/null || true
iptables -P OUTPUT ACCEPT

# ── Always allow loopback and established connections ─────────────────────────
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# ── Always allow DNS ──────────────────────────────────────────────────────────
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

# ── Allow SSH for git operations ──────────────────────────────────────────────
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT

# ── Resolve and allow whitelisted domains ─────────────────────────────────────
for domain in "${ALLOWED_DOMAINS[@]}"; do
  ips=$(dig +short "$domain" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' || true)
  if [ -n "$ips" ]; then
    while IFS= read -r ip; do
      iptables -A OUTPUT -d "$ip" -j ACCEPT
      echo "[firewall] Allowed: $domain → $ip"
    done <<< "$ips"
  else
    echo "[firewall] Warning: could not resolve $domain"
  fi
done

# ── Block everything else ─────────────────────────────────────────────────────
iptables -A OUTPUT -j DROP
iptables -P OUTPUT DROP

echo "[firewall] Done. All outbound traffic blocked except whitelisted domains."
echo "[firewall] To add a domain: edit ALLOWED_DOMAINS in .devcontainer/init-firewall.sh"
echo ""
echo "[firewall] Active rules:"
iptables -L OUTPUT -n --line-numbers
