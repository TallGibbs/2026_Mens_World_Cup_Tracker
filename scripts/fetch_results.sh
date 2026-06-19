#!/usr/bin/env bash
#
# fetch_results.sh - pull STRUCTURED 2026 World Cup match data for a given date.
#
# Part of the daily tracker routine's "Data sourcing" tier list (see CLAUDE.md).
# It prints facts parsed directly from JSON - never an AI-generated summary - so
# the routine can decide each match's status (and copy its score) without a model
# sitting between the source and the data. This is the safeguard against the
# class of bug that once invented a "USA 2-1 Australia" result for an unplayed
# match.
#
# Usage:
#   scripts/fetch_results.sh [YYYY-MM-DD]
#
# Date defaults to today in US Eastern Time (the tournament's reference zone on
# this site). Pass a date to inspect a specific matchday.
#
# Source selection (matches the CLAUDE.md tier order):
#   Tier 1  football-data.org   - used when FOOTBALL_DATA_API_KEY is set
#   Tier 2  ESPN site API       - no auth; the default fallback
#
# Output: one normalised line per match. Read STATE/COMPLETED to decide whether a
# fixture may be marked "final":
#   - ESPN:           state=post  & completed=true   -> finished
#   - football-data:  status=FINISHED                -> finished
# Anything else (pre/in, SCHEDULED/TIMED/IN_PLAY) means the game is NOT final;
# leave that fixture "upcoming" regardless of any other source's claim.
#
set -euo pipefail

command -v jq >/dev/null 2>&1 || { echo "error: jq is required but not installed" >&2; exit 1; }

DATE_DASH="${1:-$(TZ=America/New_York date +%Y-%m-%d)}"
DATE_PLAIN="${DATE_DASH//-/}"

# curl with sane timeouts and retries for flaky networks.
fetch() { curl -fsS -m 25 --retry 3 --retry-delay 2 "$@"; }

if [ -n "${FOOTBALL_DATA_API_KEY:-}" ]; then
  echo "# source: football-data.org (Tier 1)   date: ${DATE_DASH}" >&2
  fetch -H "X-Auth-Token: ${FOOTBALL_DATA_API_KEY}" \
    "https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${DATE_DASH}&dateTo=${DATE_DASH}" \
  | jq -r '
      .matches[]? |
      [ .status,
        .homeTeam.name, (.score.fullTime.home|tostring),
        (.score.fullTime.away|tostring), .awayTeam.name,
        .utcDate
      ] | @tsv' \
  | while IFS=$'\t' read -r status home hs as away utc; do
      printf "status=%-10s  %s %s-%s %s | %s\n" "$status" "$home" "$hs" "$as" "$away" "$utc"
    done
else
  echo "# source: ESPN site API (Tier 2, no auth)   date: ${DATE_DASH}" >&2
  fetch "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${DATE_PLAIN}" \
  | jq -r '
      .events[]? | .competitions[0] as $c |
      [ $c.status.type.state,
        ($c.status.type.completed|tostring),
        ($c.competitors[]|select(.homeAway=="home")|.team.displayName),
        ($c.competitors[]|select(.homeAway=="home")|.score),
        ($c.competitors[]|select(.homeAway=="away")|.score),
        ($c.competitors[]|select(.homeAway=="away")|.team.displayName),
        .date,
        ($c.venue.fullName // "?")
      ] | @tsv' \
  | while IFS=$'\t' read -r state completed home hs as away iso venue; do
      printf "state=%-4s completed=%-5s  %s %s-%s %s | %s | %s\n" \
        "$state" "$completed" "$home" "$hs" "$as" "$away" "$iso" "$venue"
    done
fi
