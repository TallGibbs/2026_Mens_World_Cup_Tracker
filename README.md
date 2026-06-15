# 2026 Men's World Cup Tracker

A single, self-contained HTML page that tracks the 2026 FIFA World Cup, with a
focus on three featured teams: USA, Netherlands, and England. It shows a
next-match countdown, the featured teams at a glance, and all 12 group
standings. Everything (markup, styling, and JavaScript) lives in
`world_cup_tracker.html` with no external build step or dependencies beyond a
web font.

## Files

- `world_cup_tracker.html` - the live tracker. Open it directly in any browser.
- `world_cup_tracker_YYYY-MM-DD.html` - dated snapshots produced by the daily
  update routine (see below).

## How it works

All tournament state lives in a single `DATA` object near the top of the
`<script>` block in `world_cup_tracker.html`. The rendering code reads from that
object, so the daily update only ever needs to touch the data, never the layout,
styling, or logic.

Key fields:

- `meta.updated` - the date the page was last regenerated.
- `teams[]` - the three featured teams, each with a fixture list. Set a
  fixture's `status` to `final` and add `us`/`them` once it is played, and keep
  the `date` field as an ISO string with the `-04:00` ET offset (this drives the
  countdown).
- `groups[]` - all 12 groups with played, W, D, L, goal difference, and points.
  Set `started: true` once a group has played. Each group's goal differences
  should sum to zero.

## Daily update routine

Every morning, produce an updated version of the tracker as a single
self-contained HTML file.

Start by reading the current `world_cup_tracker.html` as the baseline. Keep its
layout, styling, and JavaScript identical; change only the data.

1. Search authoritative, current sources (FIFA, ESPN, NBC Sports, official team
   pages) for the live state of the 2026 FIFA World Cup. Confirm the tournament
   stage and today's date.
2. Update ONLY the data in `world_cup_tracker.html`:
   - `meta.updated` to today's date.
   - The three featured teams (USA, Netherlands, England): for each, mark any
     played match status `final` with the us/them score, and confirm the next
     match (opponent, date as an ISO string with the `-04:00` ET offset, "when"
     label in ET, venue, TV). Update each team's short note with the latest
     relevant detail.
   - All 12 group standings: played, W, D, L, goal difference and points,
     ordered by current position. Mark `started: true` once a group has played.
     Make sure each group's goal differences sum to zero.
   - If a team advances to the knockout stage, reflect that in its card and the
     next-match logic.
3. Re-verify kickoff times in ET; correct any that have firmed up.
4. Save the full updated HTML back to `world_cup_tracker.html` (overwrite it),
   and also save a dated copy as `world_cup_tracker_YYYY-MM-DD.html`. Do not
   change the visual design, the controls, or the countdown logic. Do not use
   emojis anywhere, including in code.
