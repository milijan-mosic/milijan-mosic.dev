#!/usr/bin/env bash
f=$(jq -r '.tool_input.file_path // empty')
[[ "$f" =~ /frontend/.*\.(ts|tsx|js|jsx|json)$ ]] && npx --prefix /workspaces/platform-rule-engine/frontend prettier --write "$f"
exit 0
