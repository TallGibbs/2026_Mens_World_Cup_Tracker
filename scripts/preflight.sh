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
echo "=== Structured source reachability ==="
# Surfaces a silent data outage: if every tier source is blocked/unreachable the
# routine has NO permitted way to confirm results and must NOT invent them. A run
# that sees all sources down should hold the data stale (and say so), never guess.
probe() { # name url
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 12 "$2" 2>/dev/null)
  [ -n "$code" ] || code="000"
  if [ "$code" = "000" ] || [ "$code" = "403" ] || [ "$code" = "407" ]; then
    echo "  BLOCKED: $1 (HTTP $code) - $2"
    return 1
  fi
  echo "  reachable: $1 (HTTP $code)"
  return 0
}
reach=0
probe "ESPN site API (Tier 2, no auth)" \
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260601" && reach=1
[ -n "${FOOTBALL_DATA_API_KEY:-}" ] && { probe "football-data.org (Tier 1)" \
  "https://api.football-data.org/v4/competitions/WC/matches?dateFrom=2026-06-01&dateTo=2026-06-01" && reach=1; }
[ -n "${API_FOOTBALL_KEY:-}" ] && { probe "api-football (Tier 3)" \
  "https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=2026-06-01" && reach=1; }
if [ "$reach" -eq 0 ]; then
  echo "  WARNING: no structured source is reachable from this session. Per CLAUDE.md"
  echo "  data-sourcing rules, do NOT mark fixtures final or fill bracket slots from a"
  echo "  web/AI summary - hold the data stale, refresh only meta.updated/WC.today, and"
  echo "  note the outage. Set FOOTBALL_DATA_API_KEY or API_FOOTBALL_KEY, or restore the"
  echo "  egress allowlist for these hosts, to source results again."
fi

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
