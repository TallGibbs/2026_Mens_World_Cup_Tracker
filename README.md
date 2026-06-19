# 2026 Men's World Cup Tracker

A tracker for the 2026 FIFA Men's World Cup, with a focus on three featured
teams: USA, Netherlands, and England. It shows a next-match countdown, the
featured teams at a glance, and all 12 group standings, plus a "Today's Games"
page. There is no build step: the pages are static HTML/CSS/JS and all
tournament data lives in one file, `data.js`, which both pages load.

**Live site:** https://worldcup.youmissedit.org/ - hosted on Cloudflare Pages
with continuous deployment from `main`, so each daily update publishes
automatically. See `docs/DEPLOY.md` for the hosting and DNS setup.

## Files

- `data.js` - **the single source of truth.** One `WC` object holds the meta,
  featured teams, all 12 group tables, and the Today's Games data. Both pages
  load it and render from it; the daily routine edits only this file.
- `world_cup_tracker.html` - the live tracker (renders from `WC` as its `DATA`).
  Open it directly in any browser.
- `today.html` - the "Today's Games" subpage. It lists the day's matches with ET
  kickoff times, venues, where to watch (TV and stream), each group's standings
  with the teams in action highlighted, and a few preview bullets per game. It
  reads `WC.today` for the games and derives each standings table from the shared
  `WC.groups`. Reachable at `/today` on the live site.
- Both pages share a **sticky top navigation bar** (brand + Tracker / Today's
  Games links) so you can move between them from anywhere on the page. The bar is
  identical on each page; the current page is marked with `aria-current="page"`
  (gold underline). On narrow screens it collapses to a hamburger menu. To add a
  new destination later, add an `<li>` to the `.nav-links` list in both files.
- `snapshots/world_cup_tracker_YYYY-MM-DD.html` - dated snapshots produced by the
  daily update routine (see below). All dated copies live in the `snapshots/`
  folder to keep the repository root tidy; see `snapshots/README.md`.
- `scripts/fetch_results.sh` - pulls the day's fixtures/results straight from a
  structured JSON source (no AI summary in the loop) for the daily update.
- `scripts/validate.mjs` - the data quality gate. Run `node scripts/validate.mjs`
  after editing `data.js`; it checks per-group table math and freshness and must
  print `ALL CHECKS PASSED` before committing. (Cross-page drift is impossible now
  that both pages share `data.js`.)
- `scripts/snapshot.mjs` - writes a frozen, self-contained dated snapshot by
  inlining `data.js` into `snapshots/world_cup_tracker_YYYY-MM-DD.html`.
- `scripts/preflight.sh` - start-of-run health check: verifies the toolchain and
  prints a validator snapshot (`bash scripts/preflight.sh`). See `CLAUDE.md` for
  the full routine.

## How it works

All tournament state lives in a single `WC` object in `data.js` - the single
source of truth that both pages load and render from. The daily update only ever
touches `data.js`, never the layout, styling, or logic.

Key fields:

- `meta.updated` - the date the data was last regenerated.
- `teams[]` - the three featured teams, each with a fixture list. Set a
  fixture's `status` to `final` and add `us`/`them` once it is played, and keep
  the `date` field as an ISO string with the `-04:00` ET offset (this drives the
  countdown). Give each `upcoming` fixture a forward-looking `preview`.
- `groups[]` - all 12 groups with played, W, D, L, goal difference, and points.
  Each group's goal differences must sum to zero. today.html's mini-tables are
  derived from these, so there is only one copy of the standings.
- `today` - the Today's Games page: date, stage label, broadcast note, kits, and
  the day's `games[]`.

## Daily update routine

Every morning a scheduled Claude Code routine refreshes the data and publishes.
**`CLAUDE.md` is the authoritative, step-by-step spec.** In brief:

1. Pull the day's results from a structured source (`scripts/fetch_results.sh`) -
   never an AI-written summary.
2. Edit **`data.js`** only: `meta.updated`, the featured teams' fixtures/notes,
   all 12 group tables, and `today` (the day's games). Keep the pages' layout,
   CSS, and JavaScript unchanged, and use no emojis.
3. Run `node scripts/validate.mjs` until it prints `ALL CHECKS PASSED`.
4. Run `node scripts/snapshot.mjs` to write the dated snapshot.
5. Commit, push, open a PR into `main`, and squash-merge; Cloudflare Pages
   redeploys from `main`.
