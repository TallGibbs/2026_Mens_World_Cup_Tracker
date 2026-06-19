#!/bin/bash
#
# preflight.sh - start-of-run health check for the World Cup tracker routine.
#
# Informational ONLY: it never blocks (always exits 0). At the start of a run the
# committed data is still the previous day's, so validate.mjs is expected to
# report staleness here; the routine refreshes the data and then validate.mjs
# must pass before committing (see CLAUDE.md).
#
# It (1) confirms the toolchain the routine relies on is present (node, jq, curl)
# and (2) prints a data health snapshot via scripts/validate.mjs.
#
# Usage: bash scripts/preflight.sh
set -uo pipefail

cd "$(dirname "$0")/.." || exit 0

echo "=== World Cup tracker pre-flight ==="
for tool in node jq curl; do
  if command -v "$tool" >/dev/null 2>&1; then
    echo "  ok: $tool ($("$tool" --version 2>&1 | head -n1))"
  else
    echo "  MISSING: $tool - the routine needs it (jq + curl for fetch_results.sh, node for validate.mjs)"
  fi
done

echo ""
echo "=== Data health snapshot: node scripts/validate.mjs ==="
if command -v node >/dev/null 2>&1; then
  node scripts/validate.mjs || true
else
  echo "  skipped: node not available"
fi

echo ""
echo "Note: a stale-data report above is expected at the start of a run. Refresh"
echo "the data, then validate.mjs must print ALL CHECKS PASSED before committing."

exit 0
