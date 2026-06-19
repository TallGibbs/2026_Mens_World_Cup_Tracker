# World Cup 2026 Tracker - Routine Instructions

## Repository purpose

All tournament data lives in one file, `data.js` (the `WC` object) - the single
source of truth. Two pages render from it:

- `world_cup_tracker.html` - the matchday companion (group standings, featured
  teams, next-up countdown). It uses `WC` as its `DATA`.
- `today.html` (served at `/today`) - the "Today's Games" page listing the
  fixtures on the current date, each with a preview and the relevant group's
  standings before kickoff. It uses `WC.today` for the day's games and derives
  each standings table from the shared `WC.groups`, so the two pages can never
  disagree.

The site is updated daily by a scheduled Claude Code routine that edits `data.js`
only - never the pages' layout, CSS, or JavaScript. (Both pages load `data.js` as
a classic `<script>` before their render script.)

## Scheduled routine: daily tracker update

Each run of this routine must follow these steps in order:

1. Read `data.js` as the baseline. The page layout, styling, and JavaScript in
   `world_cup_tracker.html` and `today.html` must stay identical; the routine
   changes data in `data.js` only.
2. Collect the live state of the tournament following the **Data sourcing**
   section below: work the tiered source list in order, parse structured data
   directly, and never base any score, result, or standing on an AI-generated
   summary. The helper `scripts/fetch_results.sh [YYYY-MM-DD]` prints the day's
   matches (state, completion, score, venue, kickoff) straight from JSON - run it
   to get the facts. Confirm the tournament stage and today's date before
   collecting data.
3. Update `data.js` only - the `WC` object (the pages' layout, CSS, and JS must
   not change):
   - `WC.meta` (set `updated` to today), `WC.teams` (featured fixtures), and
     `WC.groups` (all 12 group tables), and
   - `WC.today` for the Today's Games page (see "Today's Games page" below).
     today.html derives its standings from `WC.groups`, so there is no separate
     standings copy to maintain.
   Verify every group's goal differences sum to zero before saving.
4. Save `data.js`.
5. **Validate before going further.** Run `node scripts/validate.mjs` (it checks
   today's date in Eastern Time by default). It must print `ALL CHECKS PASSED`
   before you continue. If it prints any `[FAIL]`, fix `data.js` and re-run until
   clean - never edit the validator to silence a check. The **Validation**
   section below lists what it enforces.
6. Save a dated, self-contained snapshot of the tracker by running
   `node scripts/snapshot.mjs` (it inlines `data.js` into
   `snapshots/world_cup_tracker_YYYY-MM-DD.html` so the dated copy is frozen).
   All dated copies live in `snapshots/`; never write them to the repository
   root. (Only the tracker is snapshotted; `today.html` is not.)
7. Commit every changed file (`data.js` and the new snapshot; the HTML pages
   change only if you intentionally edited them) to the development branch that
   is checked out at the start of the run, with a message such as
   `Update tracker for <date>`.
8. Push that branch to `origin` with `git push -u origin <branch-name>`.
9. Open a pull request into `main` for that branch (if the harness has already
   opened one, reuse it). Then merge it yourself without waiting for human
   review: if the pull request is still a draft, mark it ready first, then
   squash-merge it into `main` using the GitHub merge tool with
   `merge_method: "squash"`. After the merge the updated file is live on `main`.
   Then verify the squash-merge succeeded - confirm the pull request shows as
   merged and the squashed commit is on `main`. Branch cleanup is handled by the
   repository's "Automatically delete head branches" setting (GitHub repo
   Settings > General > Pull Requests), which deletes the merged development
   branch on merge with no further action. If that setting is off, attempt to
   delete the merged branch but treat any failure as non-fatal: the managed cloud
   git proxy forbids `git push origin --delete` (it returns HTTP 403), and no
   delete-branch API tool is available, so do not error if the branch cannot be
   removed from within a run. This self-merge is explicitly authorised.
10. If a push-notification tool is available, send a short, spoiler-free ping that
   the tracker has been refreshed - for example "World Cup 2026 Tracker updated
   for June 16, 2026". Like the email, it must not include any matches, scores,
   standings, results, or team details, so it cannot spoil a game on the owner's
   phone. If no such tool is available, skip this step silently and do not error.

Run every day even if nothing has changed: still set `WC.meta.updated` to today's
date, refresh `WC.today` for the current date, run `node scripts/validate.mjs`
until it prints `ALL CHECKS PASSED`, run `node scripts/snapshot.mjs`, and commit.

## Branch and merge policy

Each run works on the development branch that is checked out at the start of the
run, pushes that branch, opens (or reuses) a pull request into `main`, and then
squash-merges that pull request into `main` itself. The routine does not wait for
human review or approval before merging. Merged development branches are cleaned
up by the repository's "Automatically delete head branches" setting (the cloud
git proxy blocks branch deletion from within a run), so stale branches do not
pile up. `main` keeps one squashed commit per daily run.

## Authorisation

The routine is explicitly authorised to open a pull request and squash-merge it
into `main` itself, without human review or approval. This is intentional.

## Hosting

The tracker is hosted on **Cloudflare Pages** at
**https://worldcup.youmissedit.org/** (subdomain of `youmissedit.org`; apex +
`www` are unrelated and stay on Google Sites). The Pages project is connected to
this GitHub repo with **continuous deployment from `main`**, so the routine does
not deploy anything itself: once a run's commit lands on `main` (step 8),
Cloudflare Pages rebuilds and the live site reflects it within a minute or two.
There is no build step - Cloudflare publishes the repo root as-is, and the
`_redirects` file rewrites `/` to `world_cup_tracker.html` (and `/today` to
`today.html`), so the bare domain renders the current tracker and dated snapshots
are reachable at `/snapshots/world_cup_tracker_YYYY-MM-DD.html`. Setup and DNS
details live in `docs/DEPLOY.md`.

(The site previously ran on Netlify; it was migrated because Netlify's free plan
caps usage at 300 credits/month and bills ~15 credits per production deploy, so a
once-a-day deploy cadence exhausted the free credits and paused the site.
Cloudflare Pages' free tier has no bandwidth cap and allows 500 builds/month.)

## Data sourcing

All match results and standings must come from **structured data parsed
directly** - never from a model-written summary. This section is binding; it
exists because a run once recorded a fabricated scoreline (USA 2-1 Australia)
that a search-result summary invented for a match that had not been played.

The quickest way to honour this is the committed helper
`scripts/fetch_results.sh [YYYY-MM-DD]`, which fetches the day's fixtures and
prints them straight from JSON (it auto-selects Tier 1 if a key is set, else
Tier 2). Use it as the default entry point; the tiers below document what it
queries and how to fall back by hand.

### Hard rules (these override convenience)

- **Never** treat an AI-generated summary as a source of fact. Specifically:
  - The `WebSearch` tool's prose answer/summary is **not** a source. Use
    `WebSearch` only to discover URLs, then go to the data itself.
  - `WebFetch` runs the page through a small model to answer your prompt, so its
    answer is also a summary. Do not mark a fixture `final` on the strength of a
    `WebFetch` answer alone. `WebFetch` is acceptable only as the Tier 4 last
    resort below, and only when the page's own factual content is unambiguous.
  - Prefer JSON endpoints you parse yourself (via `curl` + `jq` in Bash) so no
    model sits between the source and the data.
- **Completion guard for `status:"final"`.** Mark a fixture `final` only when
  BOTH hold: (a) a Tier 1-3 structured source reports the match as completed
  (status FINISHED / "post" / FT-AET-PEN), AND (b) its scheduled kickoff is at
  least ~2.5 hours before the real current time. If kickoff has not yet passed,
  the fixture stays `upcoming` no matter what any source claims.
- **Cross-check before recording.** A result is only recorded when at least one
  structured source confirms it; if you must fall back to Tier 4, require two
  independent sources to agree on the same scoreline before writing it.
- After building standings, re-verify every group's goal differences sum to zero
  (a fabricated or mis-keyed result usually breaks this).

### Tiered source order (work top-down; stop at the first that yields the data)

1. **football-data.org (structured JSON, official-grade).** Use when the
   `FOOTBALL_DATA_API_KEY` environment variable is set. Parse JSON directly:
   ```
   curl -s -H "X-Auth-Token: $FOOTBALL_DATA_API_KEY" \
     "https://api.football-data.org/v4/competitions/WC/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD"
   curl -s -H "X-Auth-Token: $FOOTBALL_DATA_API_KEY" \
     "https://api.football-data.org/v4/competitions/WC/standings"
   ```
   Only `status == "FINISHED"` counts as played; read `score.fullTime.home/away`.
2. **ESPN site API (structured JSON, no auth).** Reliable fallback needing no
   key - confirmed reachable and parseable from the run environment. Parse JSON
   directly:
   ```
   curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=YYYYMMDD"
   ```
   Read `events[].competitions[].status.type.state`: only `"post"` with
   `completed:true` counts; scores are in `competitors[].score`.
3. **api-football.com (structured JSON, RapidAPI/API-Sports).** Use when the
   `API_FOOTBALL_KEY` environment variable is set:
   ```
   curl -s -H "x-apisports-key: $API_FOOTBALL_KEY" \
     "https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=YYYY-MM-DD"
   ```
   Only `fixture.status.short` in `FT`/`AET`/`PEN` counts as played.
4. **Direct page fetch (last resort).** Only if Tiers 1-3 are all unavailable.
   Fetch an authoritative results page (FIFA.com, ESPN scoreboard, official
   confederation pages) and read the page's own factual scoreline - not a
   model's paraphrase. Apply the completion guard and the two-source cross-check
   above before recording anything.

If no source confirms a match has finished, leave that fixture `upcoming` and
its group at the prior matchday's standings, then still complete the rest of the
run (refresh `meta.updated`, save the dated snapshot, commit). A stale-but-true
file is always preferable to a fresh-but-invented one.

Note on environment: as of this writing neither `FOOTBALL_DATA_API_KEY` nor
`API_FOOTBALL_KEY` is set in the run environment, so Tier 2 (ESPN, no auth) is
the active primary source. Add either key as an environment variable to promote
Tiers 1/3 ahead of it.

## Data rules

- `WC.meta.updated` must be set to today's date (e.g. "June 16, 2026").
- Every group's goal differences must sum to zero before committing.
- No placeholder values may remain in `data.js`.
- Do not use emojis anywhere in `data.js` or the pages.
- Do not change the visual design, controls, or countdown logic.
- The site designates the **men's** tournament (titles, the hero headline via
  `WC.meta.tournament`, and the nav brand all say "Men's"). Keep that wording; a
  separate Women's edition may be built later.
- Before committing, `node scripts/validate.mjs` must print `ALL CHECKS PASSED`.
  It enforces every rule in this section mechanically (see **Validation** below).

## Validation (`scripts/validate.mjs`)

`scripts/validate.mjs` is the mechanical gate for every run. It reads the `WC`
object from `data.js` and exits non-zero if anything is off. Run it after editing
the data and before committing:

```
node scripts/validate.mjs            # checks today's date in Eastern Time
node scripts/validate.mjs 2026-06-20 # or check a specific date
```

It must print `ALL CHECKS PASSED`. What it enforces:

- **Table math, per group:** exactly four teams, goal differences sum to zero,
  `pld = w + d + l`, `pts = 3*w + d`, total wins equal total losses, draws and
  matches-played are even, and no negative values.
- **Freshness:** `WC.meta.updated` and `WC.today.date` are today's date, and
  every `WC.today.games[].iso` is dated today. This is the check that catches a
  Today's Games list that was not refreshed for the current day.
- **Fixtures:** each featured `final` fixture carries integer scores; each
  `upcoming` fixture carries a `preview` of at least two forward-looking bullets;
  every `WC.today.games[]` entry has all its fields plus at least two `bullets`,
  and its two teams appear in that group's table.
- **Hygiene:** the tournament is labelled "Men's", and there are no emojis or
  placeholder tokens in the data.

Cross-page agreement no longer needs a check: both pages render from the same
`WC.groups`, so their standings cannot disagree. If a check fails, fix `data.js` -
never weaken the validator to go green. A failure almost always means a mis-keyed
or fabricated result (the class of bug that once put an invented score on the
site) or a Today's Games list left on yesterday's fixtures.

At the very start of each run, also run the pre-flight `bash scripts/preflight.sh`.
It confirms the toolchain (node, jq, curl) is present and prints a data health
snapshot via the validator, so you begin with a clear picture of the current
state (a stale-data report is expected before you refresh).

This pre-flight is registered as a `SessionStart` hook in `.claude/settings.json`,
so it runs automatically at the start of every Claude Code session on this repo -
each run opens with the toolchain check and data health snapshot before any edits.
You can also run it by hand any time with `bash scripts/preflight.sh`.

## Hero "Next up" preview must stay forward-looking

The hero's "Next up for our teams" card shows a details panel for the single
next featured fixture: the relevant group's standings plus a short **What to
watch** list. That list is rendered from the upcoming fixture's `preview` field
and must be **forward-looking - never a recap of a game already played**.

How to populate it each run:

- Add a `preview` array to every **upcoming** fixture in `WC.teams[].fixtures`
  (entries with `status:"upcoming"`). Finished fixtures (`status:"final"`) do not
  need one. Example:

  ```js
  {opp:"Australia", when:"Fri Jun 19, 3:00 PM ET", date:"2026-06-19T15:00:00-04:00",
   venue:"Lumen Field, Seattle", tv:"FOX", status:"upcoming",
   preview:[
     "A win sends the USA into the Round of 32 with a match to spare.",
     "Both teams won their openers, so first place in Group D is on the line.",
     "Pochettino expects Pulisic (calf) back in the starting XI."
   ]}
  ```

- Write 2-3 concise bullets about what is **still to come**: what a result would
  mean (qualification or seeding math), team form heading in, and confirmed
  availability/lineup news (injuries, returns, suspensions) for *that upcoming*
  match. Phrase everything in the future/anticipatory tense.
- Do NOT restate the score, scorers, or events of a previous game in `preview`.
  Past-game recaps belong only in `WC.teams[].note` (shown on the team cards
  lower down), which is a separate, backward-looking field. Keep the two distinct:
  `note` = what just happened to the team; `preview` = what to watch in the next
  fixture.
- Because the hero auto-selects whichever featured fixture is chronologically
  next, make sure at least that next upcoming fixture always carries a fresh,
  accurate `preview`.

## Today's Games page (`WC.today`)

`today.html` lists every match being played on the **current date** and must be
refreshed each run so it never shows a past day's fixtures. Edit the `WC.today`
object in `data.js`; the page layout, CSS, and JS stay identical.

Populate `WC.today` from the same structured sources used for the tracker (run
`scripts/fetch_results.sh` for today's date to get the fixtures, venues and
kickoff times):

- `date` - long form of today, e.g. "Friday, June 19, 2026".
- `stageLabel` - the tournament stage (e.g. "Group Stage").
- `schedNote` - one line summarising the day (how many matches, which groups).
- `tz` - keep the standing Eastern-Time/broadcast note unless coverage changes.
- `kits` - a hex colour for each team appearing today (used for the colour bars).
- `games[]` - one entry per match **kicking off today**, in time order. Each has
  `group`, `stage`, `home`, `away`, `kick` (ET label), `iso` (ISO time with the
  `-04:00` ET offset - drives the live/next-up badge), `venue`, `tv`, `stream`,
  and a `bullets` array of 2-3 forward-looking "what to watch" notes. As with the
  hero `preview`, keep bullets anticipatory; do not recap a finished game.

The standings mini-table under each game is derived automatically from
`WC.groups` (the group the match belongs to), so there is **no** separate
standings copy to maintain on this page - just keep `WC.groups` correct. The
`updated` line reuses `WC.meta.updated`.

If no matches are scheduled on the current date, set `WC.today.games` to an empty
array (the page renders a tidy "no matches today" card) and still refresh `date`
and `schedNote`.
