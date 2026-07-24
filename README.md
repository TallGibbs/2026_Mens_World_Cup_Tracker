# World Cup Tracker

A static tracker for the FIFA World Cup. It is currently a **hybrid**:

- a permanent **recap and archive of the Men's World Cup 2026** - the podium, how
  the three featured teams (USA, Netherlands, England) finished, all 12 final
  group tables, the complete knockout bracket, and links to the frozen dated
  snapshots, and
- a live **countdown to the Women's World Cup 2027 in Brazil** (June 24 to
  July 25, 2027).

Once the 2027 draw and match schedule are published, the same pipeline pivots to
full live tracking of that tournament. See **`docs/ROADMAP.md`** for the phased
plan and the open questions.

There is no build step: the pages are static HTML/CSS/JS and all tournament data
lives in one file, `data.js`, which every page loads.

**Live site:** https://worldcup.youmissedit.org/ - hosted on Cloudflare Pages
with continuous deployment from `main`, so each update publishes automatically.
See `docs/DEPLOY.md` for the hosting and DNS setup.

## Files

- `data.js` - **the single source of truth.** One `WC` object holds the meta, the
  countdown target, the recap, the featured teams, all 12 group tables, the
  Today's Games data, and the knockout bracket. Every page loads it and renders
  from it; the routine edits only this file.
- `world_cup_tracker.html` - the front page, served at `/`. Shows the recap, the
  archive links, the group tables, the best-third-placed table, and the hero
  countdown.
- `today.html` - the "Today's Games" subpage, served at `/today`. Lists the day's
  matches with ET kickoff times, venues, where to watch, each group's standings
  with the teams in action highlighted, and preview bullets per game. It reads
  `WC.today` for the games and derives each standings table from the shared
  `WC.groups`. Between tournaments it renders a "no matches" card.
- `bracket.html` - the knockout tree, served at `/bracket`. Renders `WC.bracket`;
  currently the complete, final 2026 bracket.
- All three pages share a **sticky top navigation bar** (brand + Tracker /
  Today's Games / Bracket links). The bar is identical on each page; the current
  page is marked with `aria-current="page"` (gold underline). On narrow screens it
  collapses to a hamburger menu. To add a destination, add an `<li>` to the
  `.nav-links` list in **all three** files.
- `snapshots/` - dated, self-contained snapshots produced by each update run:
  `world_cup_tracker_YYYY-MM-DD.html` and `world_cup_bracket_YYYY-MM-DD.html`.
  See `snapshots/README.md`.
- `scripts/fetch_results.sh` - pulls a day's fixtures/results straight from a
  structured JSON source (no AI summary in the loop).
- `scripts/validate.mjs` - the data quality gate. Run `node scripts/validate.mjs`
  after editing `data.js`; it must print `ALL CHECKS PASSED` before committing.
- `scripts/snapshot.mjs` - writes the frozen dated snapshots by inlining
  `data.js` into the tracker and bracket pages.
- `scripts/preflight.sh` - start-of-run health check (`bash scripts/preflight.sh`).
- `CLAUDE.md` - the authoritative, step-by-step spec for the update routine.
- `docs/ROADMAP.md` - the phased plan for the 2026 -> 2027 pivot.

## How it works

All state lives in a single `WC` object in `data.js` - the single source of truth
that every page loads and renders from. An update only ever touches `data.js`,
never the layout, styling, or logic.

Key fields:

- `meta` - describes the **archived** tournament, including `updated` (the date
  the data was last regenerated).
- `next` - the **countdown target**: the next tournament, its ISO opening
  instant, and the bullets shown beside the countdown. The hero counts down to
  this whenever no featured fixture is still upcoming.
- `recap` - how the archived tournament finished: podium, the featured teams'
  finishes, and the archive links.
- `teams[]` - the three featured teams, each with a fixture list. A fixture's
  `status` is `final` (with `us`/`them`) or `upcoming` (with a forward-looking
  `preview` of at least two bullets).
- `groups[]` / `groupsFinal[]` - all 12 groups. Each group's goal differences must
  sum to zero. today.html's mini-tables derive from these, so there is only one
  copy of the standings.
- `today` - the Today's Games page: date, stage label, broadcast note, kits, and
  the day's `games[]` (empty between tournaments).
- `bracket` - the knockout tree, with each slot's descriptor, resolved teams,
  score and advancement wiring.

## Update routine

A scheduled Claude Code routine refreshes the data and publishes. It runs
**weekly** while there is no tournament in progress. **`CLAUDE.md` is the
authoritative, step-by-step spec.** In brief:

1. Run `bash scripts/preflight.sh`, then read `docs/ROADMAP.md`.
2. Pull any results from a structured source (`scripts/fetch_results.sh`) - never
   an AI-written summary.
3. Edit **`data.js`** only. Keep the pages' layout, CSS, and JavaScript
   unchanged, and use no emojis.
4. Run `node scripts/validate.mjs` until it prints `ALL CHECKS PASSED`.
5. Run `node scripts/snapshot.mjs` to write the dated snapshots.
6. Commit, push, open a PR into `main`, and squash-merge; Cloudflare Pages
   redeploys from `main`.
