# Security Rules for Claude Code

> **Do not modify this file.** It contains company-wide security rules that
> apply to all repositories. Project-specific context belongs in `CLAUDE.md`.

---

## Environment

You are running inside a secure devcontainer with:

- Filesystem isolation — you cannot access the host machine or other projects
- Network isolation — outbound traffic is restricted to an approved whitelist
- Non-root user — you do not have system-level privileges

---

## Hard Rules — No Exceptions

**Files you must never read, write, or reference:**

- `.env`, `.env.*`, `.env.local`, `.env.production`, and any similar variants
- Any file matching: `*secret*`, `*credential*`, `*password*`, `*apikey*`, `*api_key*`, `*token*`
- Private keys: `*.key`, `*.pem`, `*.p12`, `*.pfx`, `id_rsa`, `id_ed25519`
- Cloud credential directories: `.aws/`, `.gcp/`, `.azure/`
- SSH directory: `.ssh/`

**Commands you must never run without explicit user confirmation:**

- `rm -rf` or any destructive delete
- `sudo` for anything beyond routine package installation
- `curl`, `wget`, `nc`, `netcat` — always ask before running; show the exact URL/endpoint to the user and wait for approval
- Any command that modifies system files outside the workspace

**Git rules:**

- Never push directly to `main` or `master` — always use feature branches
- Never commit files matching secret patterns listed above
- Always run `git diff --staged` before committing so the user can review

---

## If You Find a Secret

If you encounter what looks like a secret, API key, or credential anywhere in the codebase — even buried inside a comment or test file — stop immediately.
Tell the user what you found and where. Do not read it further, include it in output, or act on it in any way.

---

## When in Doubt

Ask before acting. A clarifying question costs nothing. An irreversible action can cost a lot. This applies especially to: deleting files, changing configuration, installing packages, and anything touching auth or credentials.
