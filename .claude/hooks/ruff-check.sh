#!/usr/bin/env bash
f=$(jq -r '.tool_input.file_path // empty')
[[ "$f" == */backend/*.py ]] && cd /workspaces/platform-rule-engine/backend && uv run ruff check . --fix && uv run ruff format .
exit 0
