# World Cup 2026 Tracker - Dedicated /bracket Knockout Page (Option 1)

> ============================================================================
> DEADLINE: Phase 0 MUST merge before 2026-06-28 or the daily auto-update breaks.
> Today is 2026-06-26. Round of 32 begins 2026-06-28.
>
> If you can do only one thing, do Phase 0. The single fact that matters: the
> moment a knockout fixture is written into `WC.today.games` (June 28), the
> validator's mandatory-`group` check (`validate.mjs` line 129) HARD-FAILS the
> daily commit gate, the automated commit/merge breaks, and the live site stops
> updating. Phase 0 unblocks that gate. Everything else can follow.
> ============================================================================

This document is a complete, self-contained build spec for adding a dedicated
`/bracket` knockout page (and its supporting data, validator, and snapshot
plumbing) to the World Cup 2026 Tracker. It is written for a fresh Claude Code
session with no memory of any prior conversation: a competent engineer/agent can
implement the whole thing from this document plus the repo.

All paths are absolute under the repo root:
`C:\Users\Gibbl\Documents\Projects\World_Cup_Tracker\.claude\worktrees\friendly-montalcini-943fee\`
(referred to below as `<root>`). Line numbers are against the files as they stand
on 2026-06-26 and have been verified by reading them.

---

## Table of contents

1. [Overview and goals](#1-overview-and-goals)
2. [Current architecture recap](#2-current-architecture-recap)
3. [CRITICAL: pre-knockout plumbing due before June 28, 2026](#3-critical-pre-knockout-plumbing-due-before-june-28-2026)
4. [Canonical schema block (read this before any code)](#4-canonical-schema-block-read-this-before-any-code)
5. [Data model spec](#5-data-model-spec)
6. [Bracket page (bracket.html) UI/UX spec](#6-bracket-page-brackethtml-uiux-spec)
7. [Best third-placed teams race table spec (Tracker page)](#7-best-third-placed-teams-race-table-spec-tracker-page)
8. [Validator + snapshot + scripts changes](#8-validator--snapshot--scripts-changes)
9. [Transition and daily-routine operations](#9-transition-and-daily-routine-operations)
10. [Build plan: phased checklist](#10-build-plan-phased-checklist)
11. [Out of scope / v2](#11-out-of-scope--v2)
12. [Open questions / decisions for the owner](#12-open-questions--decisions-for-the-owner)

---

## 1. Overview and goals

### What we are building and why

The tournament moves from the group stage to the knockout stage on **June 28,
2026** (Round of 32). The current site has no place to show a bracket, and - more
urgently - its data and validation pipeline assumes every fixture belongs to a
single group, which is false for a knockout tie (its two teams come from
different groups). We are building:

1. A new **`/bracket` page** (`bracket.html`) - a true peer to the Tracker and
   Today pages - that renders the full knockout tree (Round of 32 through the
   Final, plus the third-place play-off) from a new `WC.bracket` data structure.
2. A **best third-placed teams race table** on the **Tracker** page, ranked by
   FIFA's Pts > GD > GF, which requires adding goals-for/against to group rows.
3. The one-time **plumbing** (new data keys, a phase-aware validator, an extended
   snapshot script) so the daily automated routine can keep the bracket current
   with pure `data.js` edits.

### The Tracker | Today | Bracket decision (already made - design to it)

- Navigation is a three-item peer set: **Tracker | Today | Bracket**. Keep the
  friendly "Tracker" brand; add ONE peer link. Do NOT rename "Tracker" to "Group
  Stage". Round names (Round of 32, Round of 16, ...) are **section headings
  inside the bracket page**, never nav tabs.
- The **best third-placed teams race table lives on the Tracker page**, not on
  the bracket page.
- Day one uses **simple, reliable rendering** (CSS flex columns / round-grouped
  lists) plus a **mobile round-selector**. No SVG tree.

### Explicitly v2 / out of scope (see section 11)

SVG-drawn bracket tree with connector lines; path-highlighting on hover; animated
status chips (LIVE/FT/penalty badges beyond plain text); showing both teams' final
group rows under a knockout game on the Today page. None of these change the data
contract this document establishes, so each can be added later with no migration.

---

## 2. Current architecture recap

The site is **static, with no build step**, continuously deployed by Cloudflare
Pages from `main`. There is one source of truth for all tournament data:

- **`<root>\data.js`** declares a single global object `const WC = { meta,
  teams[], groups[], today }` (top-level shape at line 20). It is a classic
  script (`window.WC`), not a module - no `export`/`module.exports`. The validator
  and snapshot scripts read it by string-extracting and `Function()`-evaluating
  the `WC` literal.
- **`<root>\world_cup_tracker.html`** (the Tracker / matchday companion) loads
  `data.js` via `<script src="/data.js"></script>` and consumes `WC` directly:
  hero "Next up" card, featured-team cards, and all 12 group standings tables.
- **`<root>\today.html`** (served at `/today`) lists the current day's fixtures
  from `WC.today`, and derives each game's mini-standings from `WC.groups` (so the
  two pages can never disagree).

**The daily routine constraint (this is the load-bearing constraint of the whole
design):** a scheduled Claude Code routine updates the site once a day by editing
**`data.js` only** - never the pages' HTML/CSS/JS, never the scripts, never the
validator. Therefore every page/script/validator change in this document is a
**one-time edit that then freezes**; after it ships, daily updates must stay pure
`data.js` edits. Each run must end with `node scripts/validate.mjs` printing
`ALL CHECKS PASSED` and `node scripts/snapshot.mjs` writing a frozen dated copy,
then commit -> push -> open/reuse PR into `main` -> squash-merge.

Deployment specifics relevant here:
- **`<root>\_redirects`** contains exactly one rule, `/   /world_cup_tracker.html
  200`, plus a comment warning that an explicit `/today` rule causes an infinite
  redirect loop (Pages canonicalises `/today.html` -> `/today` natively). By the
  same logic a new `bracket.html` needs NO redirect rule (verify on a preview;
  add nothing).
- **`<root>\scripts\snapshot.mjs`** snapshots `world_cup_tracker.html` only.

---

## 3. CRITICAL: pre-knockout plumbing due before June 28, 2026

This is the unmissable, time-critical part. Read it before anything else.

**The blocker.** `validate.mjs` line 129 makes `group` a mandatory key on every
`WC.today.games[]` entry:

```js
129  for (const k of ['group','home','away','kick','iso','venue','tv','stream']) if (!gm[k]) fail(`${tag}: missing "${k}"`);
```

A knockout tie has two teams from two **different** groups and no single `group`.
On June 28 the daily routine writes a Round-of-32 game into `WC.today.games`. With
the line-129 check as-is, the run's `node scripts/validate.mjs` step fails, the
commit gate never goes green, and the automated commit/merge stops - **the live
site freezes on stale data with no human in the loop to notice quickly.**

**The fix is Phase 0** (section 10). It is self-contained, ships independently of
the bracket page and third-place table, and leaves the site fully working on
group-stage data. Phase 0:

1. Adds `gf`/`ga` to all 48 group rows (the long-pole task - see the caveat
   below), and adds `WC.meta.phase`.
2. Makes the validator's today-game `group` requirement **phase-aware** so a
   knockout game (no `group`) passes.
3. Adds a knockout sub-card branch to `today.html` so a knockout game renders
   something sensible instead of an empty "Group undefined" table.

**Phase 0 long pole - the `gf`/`ga` backfill.** Reconstructing goals-for/against
for all 48 rows from the **actual match scores** (via `bash scripts/fetch_results.sh`
for each matchday in the Jun 11-27 window) is the most time-consuming and
anti-fabrication-sensitive task in the entire build. Do not rush or guess it. Plan
for it as the Phase-0 bottleneck. Acceptance: every row satisfies `gf - ga === gd`,
every group satisfies `sum(gf) === sum(ga)`, and 2-3 rows are spot-checked against
the real published scoreline.

If Phase 0 cannot fully land before June 28, the minimum viable unblock is the
validator line-129 relaxation (3.2) plus a stub `today.html` knockout branch -
the `gf`/`ga` backfill and third-place table can follow, because nothing on the
critical commit-gate path depends on them once the validator no longer requires
`gf`/`ga`. (If you relax line 129 but have NOT yet extended `checkGroupRows` to
require `gf`/`ga`, the group-stage data stays green without the backfill; do the
backfill as soon as possible afterward so the third-place table is correct.)

---

## 4. Canonical schema block (read this before any code)

This block is the single source of truth for every new/changed field. Earlier
drafts of this design contained four mutually-incompatible variants of the bracket
slot shape; **this block overrides all of them.** Wherever a later section shows a
JSON or code snippet, it conforms to the definitions here. If you ever find a
contradiction, this block wins.

### 4.1 `WC.meta.phase` (machine phase enum)

New key on `WC.meta`. Do NOT overload `WC.meta.stage` (that stays the human display
label, e.g. `"Group Stage"` -> `"Round of 32"`). Allowed values, in order:

```
"group" | "r32" | "r16" | "qf" | "sf" | "final" | "done"   (7 values)
```

### 4.2 Bracket round keys vs phase enum (they are NOT 1:1)

Bracket round discriminator field is **`key`** (not `id`). Allowed round keys:

```
"r32" | "r16" | "qf" | "sf" | "third" | "final"            (6 values)
```

The two sets overlap but are NOT one-to-one: **`third`** (third-place play-off) is
a round key with NO matching phase value - it runs during `phase:"final"`. And
`group`/`done` are phase values with no round. Do not assume "round key == phase".

### 4.3 Group row shape (with new `gf`/`ga`)

Every row in every `WC.groups[].rows[]` (and `WC.groupsFinal[].rows[]`):

```js
{ "team":"Mexico", "pld":3, "w":3, "d":0, "l":0, "gf":8, "ga":2, "gd":6, "pts":9 }
```

All integers. Invariants (validator-enforced): `gd === gf - ga` per row;
`gf >= 0`, `ga >= 0`; per group `sum(gf) === sum(ga)` (a HARD check - see 8.A.1).

### 4.4 Bracket slot shape (THE canonical form - flat, not nested objects)

`home`/`away` are **descriptor strings** (always present, always renderable).
`homeTeam`/`awayTeam` are the **resolved team names or `null`**. `winner` is a
**team NAME** (not `"home"`/`"away"`). `status` is `"upcoming"` or `"final"` ONLY
(there is no `"live"`).

```js
{
  "id": "R32-1",                       // stable unique slot id
  "home": "Winner Group A",            // DESCRIPTOR string, always non-empty
  "away": "Best 3rd (B/E/F/I/J)",      // DESCRIPTOR string, always non-empty
  "homeTeam": "Mexico",                // resolved name, or null until known
  "awayTeam": "South Africa",          // resolved name, or null until known
  "kick": "Sat Jun 28, 12:00 PM ET",   // ET display label
  "iso": "2026-06-28T12:00:00-04:00",  // ISO with -04:00 ET offset
  "venue": "Estadio Azteca, Mexico City",
  "tv": "FOX",
  "status": "upcoming",                // "upcoming" | "final"  (NO "live")
  "hs": null,                          // home score: integer when final, else null
  "as": null,                          // away score: integer when final, else null
  "pens": null,                        // "5-4" shootout string when level + decided on PKs, else null
  "winner": null,                      // winning TEAM NAME when final, else null
  "homeSide": "home",                  // which side of feedsInto this winner fills (see 4.5); set on every non-final round's feeders
  "feedsInto": "R16-1",                // downstream slot id this winner advances into; null for Final + third-place
  "feedsSide": "home",                 // which side of the downstream slot this winner fills: "home" | "away"
  "bullets": ["...forward-looking...", "..."]  // >=2 while upcoming; never recap a finished game
}
```

Field notes:
- `hs`/`as` are the 90/120-minute scoreline; a shootout is recorded ONLY in
  `pens`, never by faking `hs`/`as`.
- `winner` is a team name equal to `homeTeam` or `awayTeam`; only set when
  `status:"final"` (by which point both teams are resolved).
- `feedsInto` + `feedsSide` are the structural advancement link. `feedsSide` tells
  the validator EXACTLY which side of the downstream slot this winner must occupy
  (so a winner mis-keyed into the wrong side is caught - see 8.A.3 #4). `feedsInto`
  is `null` for the Final (`F-1`) and the third-place play-off (`TP-1`).
- Undecided slots: `homeTeam:null`/`awayTeam:null` with a non-empty descriptor in
  `home`/`away`. **Never use the literal `"TBD"`** anywhere in `WC` - the
  validator's `PLACEHOLDER` regex (`/\b(TBD|TODO|FIXME|PLACEHOLDER|Lorem ipsum|XXXX?)\b/i`)
  fails on it. `"TBC"`, `"Winner Group A"`, `"Winner R32-1"`, `"3rd-CDFG"` are all
  safe.

### 4.5 Bracket round + top-level shape

```js
"bracket": {
  "source": "FIFA official match schedule (fifa.com), cross-checked vs ESPN fifa.world scoreboard",
  "rounds": [
    { "key":"r32",   "label":"Round of 32",          "matches":[ /* 16 slots */ ] },
    { "key":"r16",   "label":"Round of 16",          "matches":[ /*  8 slots */ ] },
    { "key":"qf",    "label":"Quarter-finals",       "matches":[ /*  4 slots */ ] },
    { "key":"sf",    "label":"Semi-finals",          "matches":[ /*  2 slots */ ] },
    { "key":"third", "label":"Third-place play-off", "matches":[ /*  1 slot  */ ] },
    { "key":"final", "label":"Final",                "matches":[ /*  1 slot  */ ] }
  ]
}
```

Round cardinality (validator-enforced, keyed on `rd.key`):
`{ r32:16, r16:8, qf:4, sf:2, third:1, final:1 }`.

### 4.6 `WC.today` knockout game shape (FLAT fields, no nested `knockout` object)

A knockout game **omits `group`**, sets `stage` to the round key, adds `bracketId`
linking it to a `WC.bracket` slot, and carries flat provenance fields. (There is
NO nested `knockout:{...}` sub-object - the page render and validator read these
flat keys.)

```js
{
  "stage": "r32",                      // round key ("r32".."final"); flips page + validator to knockout
  "bracketId": "R32-1",                // must resolve to a WC.bracket slot id
  "round": "Round of 32",              // display label for the sub-card heading
  "home": "Mexico",
  "away": "South Africa",
  "homeFrom": "Winner Group A",         // provenance label, flat field
  "awayFrom": "Best third-placed (Group F)",
  "kick": "12:00 PM ET",
  "iso": "2026-06-28T12:00:00-04:00",   // dated today, -04:00 offset
  "venue": "Estadio Azteca, Mexico City",
  "tv": "FOX",
  "stream": "FOX One / Telemundo (ES)",
  "bullets": [ "...", "..." ]           // >=2 forward-looking; still required
  // NO "group" key; NO nested "knockout" object.
}
```

### 4.7 `WC.groupsFinal` and `WC.thirdPlace`

- `WC.groupsFinal` - a frozen deep copy of `WC.groups` taken once, the moment all
  12 groups reach `pld:3`; rows stored in final 1st->4th finishing order; never
  mutated again.
- **`WC.thirdPlace` does NOT exist.** Decision (resolving the earlier
  contradiction): the third-place race table is **derived in-page** on the Tracker
  from `WC.groupsFinal` (or live `WC.groups` during the group stage) - there is NO
  stored `WC.thirdPlace` array, and the validator has NO `WC.thirdPlace` checks.
  This mirrors the repo's derive-don't-duplicate discipline (today.html derives
  standings from `WC.groups`). See sections 7 and 12.

### 4.8 Naming/constant conventions used throughout

- Validator slot-id index variable: **`bracketById`** (a plain object id->node).
  (Earlier drafts also called it `bracketNodeIds`; use `bracketById` everywhere.)
- Bracket snapshot filename: **`snapshots/world_cup_bracket_<ymd>.html`** (matches
  the `world_cup_*` prefix convention; earlier drafts also wrote `bracket_<ymd>`).
- Bracket-page mobile breakpoint: **720px** (wider than the rest of the site's
  560px, because the bracket has up to 6 columns that must collapse sooner). The
  third-place table and other pages keep **560px**.

---

## 5. Data model spec

This section is the full set of `data.js` changes, conforming to section 4.

### 5.1 `WC.meta.phase`

Add the new key in `WC.meta` (currently lines 21-28), beside the existing human
label `stage`:

```js
"meta": {
  "tournament": "FIFA Men's World Cup 2026",
  "host": "Hosted across the USA, Canada and Mexico",
  "stage": "Group Stage",          // human label, drives display text (unchanged role)
  "phase": "group",                // NEW machine flag, drives logic (4.1)
  "where": "...",
  "standNote": "...",
  "updated": "June 26, 2026"
}
```

Phase/label pairing the daily routine maintains:

| `phase` | paired `stage` label |
|---|---|
| `"group"` | `"Group Stage"` |
| `"r32"` | `"Round of 32"` |
| `"r16"` | `"Round of 16"` |
| `"qf"` | `"Quarter-finals"` |
| `"sf"` | `"Semi-finals"` |
| `"final"` | `"Final"` |
| `"done"` | `"Champions"` |

`phase` stays `"group"` until the finalising run (all 12 groups `pld:3`), then
flips to `"r32"` in the same commit that writes `WC.groupsFinal` and seeds
`WC.bracket`. Thereafter it advances one round at a time as each round completes.

### 5.2 `gf` and `ga` on every group row

Add integer `gf` and `ga` to all 48 rows (12 groups x 4) - shape and invariants in
4.3. Backfill from actual match scores; never guess. Worked example (Group A,
existing `gd` values +6/-1/-1/-4 sum to 0):

```js
{ "team":"Mexico",       "pld":3,"w":3,"d":0,"l":0,"gf":8,"ga":2,"gd":6, "pts":9 },  // 8-2 = +6
{ "team":"South Africa", "pld":3,"w":1,"d":1,"l":1,"gf":3,"ga":4,"gd":-1,"pts":4 },  // 3-4 = -1
{ "team":"South Korea",  "pld":3,"w":1,"d":0,"l":2,"gf":3,"ga":4,"gd":-1,"pts":3 },  // 3-4 = -1
{ "team":"Czechia",      "pld":3,"w":0,"d":1,"l":2,"gf":2,"ga":6,"gd":-4,"pts":1 }   // 2-6 = -4
// sum(gf)=16 ; sum(ga)=16 -> balanced
```

(Illustrative arithmetic, not asserted real scores - use the true scores from the
structured source.) Existing mini-tables read only `pld/w/d/l/gd/pts`, so adding
`gf`/`ga` is backward-compatible and renders nothing new until the third-place
table (section 7) consumes `gf`.

### 5.3 `WC.groupsFinal` (frozen end-of-group seeding archive)

A new top-level key: a deep, frozen copy of `WC.groups` taken once at the instant
the group stage finishes, then never mutated. Same structure as `WC.groups` (12
group objects, each `{ id, started, rows:[...] }`, rows carrying the full
`team/pld/w/d/l/gf/ga/gd/pts` shape). **Rows must be stored in final finishing
order** - index 0 winner, 1 runner-up, 2 third, 3 fourth (apply FIFA tiebreaks
Pts > GD > GF to order them). Every row is `pld:3`.

Rationale: the bracket is seeded from final group positions. Freezing them into
`groupsFinal` means a later edit to live `WC.groups` cannot retroactively rewrite
who qualified. The third-place race table and all bracket seeding read from
`groupsFinal` once it exists.

```js
"groupsFinal": [
  { "id":"A", "started":true, "rows":[
    { "team":"Mexico",       "pld":3,"w":3,"d":0,"l":0,"gf":8,"ga":2,"gd":6, "pts":9 },  // 1st A
    { "team":"South Africa", "pld":3,"w":1,"d":1,"l":1,"gf":3,"ga":4,"gd":-1,"pts":4 },  // 2nd A
    { "team":"South Korea",  "pld":3,"w":1,"d":0,"l":2,"gf":3,"ga":4,"gd":-1,"pts":3 },  // 3rd A
    { "team":"Czechia",      "pld":3,"w":0,"d":1,"l":2,"gf":2,"ga":6,"gd":-4,"pts":1 }   // 4th A
  ]},
  /* ... groups B-L, same shape, rows in 1st->4th order ... */
]
```

### 5.4 `WC.bracket` (the knockout tree)

Top-level shape and round/slot shapes are fully specified in 4.4-4.5. The
remaining detail a fresh session needs:

#### FIFA Round-of-32 slot skeleton and feed-forward wiring

The 48-team format produces 16 R32 ties. The bracket is two halves of 16; winners
feed forward R32 -> R16 -> QF -> SF -> Final, and the two SF losers route to the
third-place play-off. Slot ids and `feedsInto`/`feedsSide` are deterministic
(the `3rd-XXXX` letter sets in descriptors are illustrative - replace with FIFA's
actual assignment for the qualified combination on the finalising run; the slot
COUNT and wiring below are fixed and correct):

```
Round of 32 (R32-1 .. R32-16)
  R32-1 -> R16-1 (home),  R32-2 -> R16-1 (away)
  R32-3 -> R16-2 (home),  R32-4 -> R16-2 (away)
  R32-5 -> R16-3 (home),  R32-6 -> R16-3 (away)
  R32-7 -> R16-4 (home),  R32-8 -> R16-4 (away)
  R32-9 -> R16-5 (home),  R32-10-> R16-5 (away)
  R32-11-> R16-6 (home),  R32-12-> R16-6 (away)
  R32-13-> R16-7 (home),  R32-14-> R16-7 (away)
  R32-15-> R16-8 (home),  R32-16-> R16-8 (away)

Round of 16 (R16-1 .. R16-8)
  R16-1 -> QF-1 (home), R16-2 -> QF-1 (away)
  R16-3 -> QF-2 (home), R16-4 -> QF-2 (away)
  R16-5 -> QF-3 (home), R16-6 -> QF-3 (away)
  R16-7 -> QF-4 (home), R16-8 -> QF-4 (away)

Quarter-finals (QF-1 .. QF-4)
  QF-1 -> SF-1 (home), QF-2 -> SF-1 (away)
  QF-3 -> SF-2 (home), QF-4 -> SF-2 (away)

Semi-finals (SF-1, SF-2)
  winners -> F-1 (SF-1 winner = home, SF-2 winner = away)
  losers  -> TP-1 (third-place play-off; routed manually, see note)

Third-place play-off (TP-1)   feedsInto:null
Final (F-1)                   feedsInto:null
```

So each non-terminal slot carries `feedsInto` + `feedsSide` per the rule "odd
feeder -> home, even feeder -> away" of its downstream slot. `F-1` and `TP-1` have
`feedsInto:null` and `feedsSide:null`.

**Third-place play-off routing is NOT validated by the advancement check** (the
`feedsInto` check covers winners only; SF *losers* feed `TP-1`). This is an
accepted limitation - the daily routine must manually verify both SF losers are
keyed into `TP-1` correctly. `TP-1`'s descriptors use loser tokens, e.g.
`home:"Loser SF-1"`, `away:"Loser SF-2"`.

#### Placeholder rendering (so the tree shows before teams are known)

The page renders `homeTeam` if non-null, else the `home` descriptor (and likewise
for away). So on June 28 all 16 R32 slots have resolved `homeTeam`/`awayTeam`
while R16/QF/SF/third/final slots have `homeTeam:null`/`awayTeam:null` and only
descriptors - the whole tree still renders. As matches finish, the routine sets
`winner`, then resolves the `feedsSide` side of the `feedsInto` slot's
`homeTeam`/`awayTeam`.

#### Realistic JSON example (resolved + placeholder slots)

Two resolved R32 matches (one normal, one penalties), two upcoming R32 with both
teams known, and placeholder R16/QF/SF/third/final slots. Note `R16-1`'s `home`
side is already resolved (because `R32-1` finished) while its `away` side stays
`null` (because `R32-2` has not finished):

```js
"bracket": {
  "source": "FIFA official match schedule (fifa.com), cross-checked vs ESPN fifa.world scoreboard",
  "rounds": [
    {
      "key": "r32", "label": "Round of 32",
      "matches": [
        {
          "id":"R32-1",
          "home":"Winner Group A", "away":"Best 3rd (C/D/F/G)",
          "homeTeam":"Mexico", "awayTeam":"Cape Verde",
          "kick":"Sat Jun 28, 12:00 PM ET", "iso":"2026-06-28T12:00:00-04:00",
          "venue":"Estadio Azteca, Mexico City", "tv":"FOX",
          "status":"final", "hs":2, "as":0, "pens":null, "winner":"Mexico",
          "feedsInto":"R16-1", "feedsSide":"home", "bullets":[]
        },
        {
          "id":"R32-2",
          "home":"Runner-up Group B", "away":"Winner Group C",
          "homeTeam":"Canada", "awayTeam":"Croatia",
          "kick":"Sat Jun 28, 4:00 PM ET", "iso":"2026-06-28T16:00:00-04:00",
          "venue":"BMO Field, Toronto", "tv":"FS1",
          "status":"final", "hs":1, "as":1, "pens":"4-2", "winner":"Canada",
          "feedsInto":"R16-1", "feedsSide":"away", "bullets":[]
        },
        {
          "id":"R32-3",
          "home":"Winner Group D", "away":"Best 3rd (A/E/H/I)",
          "homeTeam":"USA", "awayTeam":"South Africa",
          "kick":"Sun Jun 29, 12:00 PM ET", "iso":"2026-06-29T12:00:00-04:00",
          "venue":"SoFi Stadium, Los Angeles", "tv":"FOX",
          "status":"upcoming", "hs":null, "as":null, "pens":null, "winner":null,
          "feedsInto":"R16-2", "feedsSide":"home",
          "bullets":[
            "Group D winners the USA begin their knockout run as one of the host nations.",
            "A win sets up a Round of 16 tie against the winner of Match 4."
          ]
        },
        {
          "id":"R32-4",
          "home":"Runner-up Group E", "away":"Runner-up Group F",
          "homeTeam":"Netherlands", "awayTeam":"Brazil",
          "kick":"Sun Jun 29, 4:00 PM ET", "iso":"2026-06-29T16:00:00-04:00",
          "venue":"MetLife Stadium, East Rutherford", "tv":"FS1",
          "status":"upcoming", "hs":null, "as":null, "pens":null, "winner":null,
          "feedsInto":"R16-2", "feedsSide":"away",
          "bullets":[
            "A heavyweight last-32 tie pits the Netherlands against Brazil.",
            "The winner advances to face the USA or South Africa in the Round of 16."
          ]
        }
        /* ... R32-5 .. R32-16, same shape ... */
      ]
    },
    {
      "key": "r16", "label": "Round of 16",
      "matches": [
        {
          "id":"R16-1",
          "home":"Winner R32-1", "away":"Winner R32-2",
          "homeTeam":"Mexico", "awayTeam":"Canada",
          "kick":"Wed Jul 1, 4:00 PM ET", "iso":"2026-07-01T16:00:00-04:00",
          "venue":"Estadio Azteca, Mexico City", "tv":"FOX",
          "status":"upcoming", "hs":null, "as":null, "pens":null, "winner":null,
          "feedsInto":"QF-1", "feedsSide":"home",
          "bullets":[
            "The Round of 16 opener is set: Mexico face Canada in an all-host tie.",
            "The winner reaches the quarter-finals."
          ]
        },
        {
          "id":"R16-2",
          "home":"Winner R32-3", "away":"Winner R32-4",
          "homeTeam":null, "awayTeam":null,
          "kick":"Wed Jul 1, 8:00 PM ET", "iso":"2026-07-01T20:00:00-04:00",
          "venue":"SoFi Stadium, Los Angeles", "tv":"FS1",
          "status":"upcoming", "hs":null, "as":null, "pens":null, "winner":null,
          "feedsInto":"QF-1", "feedsSide":"away",
          "bullets":[
            "This Round of 16 slot fills with the winners of Match 3 and Match 4.",
            "One of the USA, South Africa, the Netherlands or Brazil reaches the quarter-finals here."
          ]
        }
        /* ... R16-3 .. R16-8 ... */
      ]
    },
    {
      "key":"qf", "label":"Quarter-finals",
      "matches":[
        {
          "id":"QF-1", "home":"Winner R16-1", "away":"Winner R16-2",
          "homeTeam":null, "awayTeam":null,
          "kick":"Sat Jul 4, 4:00 PM ET", "iso":"2026-07-04T16:00:00-04:00",
          "venue":"AT&T Stadium, Arlington", "tv":"FOX",
          "status":"upcoming", "hs":null, "as":null, "pens":null, "winner":null,
          "feedsInto":"SF-1", "feedsSide":"home",
          "bullets":[
            "The first quarter-final pairs the winners of the top two Round of 16 ties.",
            "Victory books a place in the semi-finals."
          ]
        }
        /* ... QF-2, QF-3, QF-4 ... */
      ]
    },
    {
      "key":"sf", "label":"Semi-finals",
      "matches":[
        {
          "id":"SF-1", "home":"Winner QF-1", "away":"Winner QF-2",
          "homeTeam":null, "awayTeam":null,
          "kick":"Tue Jul 14, 8:00 PM ET", "iso":"2026-07-14T20:00:00-04:00",
          "venue":"AT&T Stadium, Arlington", "tv":"FOX",
          "status":"upcoming", "hs":null, "as":null, "pens":null, "winner":null,
          "feedsInto":"F-1", "feedsSide":"home",
          "bullets":[
            "The first semi-final decides one of the two finalists.",
            "The loser drops into the third-place play-off."
          ]
        }
        /* ... SF-2 (feedsInto F-1, feedsSide away) ... */
      ]
    },
    {
      "key":"third", "label":"Third-place play-off",
      "matches":[
        {
          "id":"TP-1", "home":"Loser SF-1", "away":"Loser SF-2",
          "homeTeam":null, "awayTeam":null,
          "kick":"Sat Jul 18, 4:00 PM ET", "iso":"2026-07-18T16:00:00-04:00",
          "venue":"Hard Rock Stadium, Miami", "tv":"FOX",
          "status":"upcoming", "hs":null, "as":null, "pens":null, "winner":null,
          "feedsInto":null, "feedsSide":null,
          "bullets":[
            "The two beaten semi-finalists meet to decide third place.",
            "A consolation final between two of the tournament's strongest sides."
          ]
        }
      ]
    },
    {
      "key":"final", "label":"Final",
      "matches":[
        {
          "id":"F-1", "home":"Winner SF-1", "away":"Winner SF-2",
          "homeTeam":null, "awayTeam":null,
          "kick":"Sun Jul 19, 3:00 PM ET", "iso":"2026-07-19T15:00:00-04:00",
          "venue":"MetLife Stadium, East Rutherford", "tv":"FOX",
          "status":"upcoming", "hs":null, "as":null, "pens":null, "winner":null,
          "feedsInto":null, "feedsSide":null,
          "bullets":[
            "The 2026 FIFA Men's World Cup Final.",
            "The winners of the two semi-finals meet for the title at MetLife Stadium."
          ]
        }
      ]
    }
  ]
}
```

### 5.5 `WC.today` knockout game shape

Full shape in 4.6. Key rules: omit `group`; set `stage` to the round key; set
`bracketId` to the slot id; carry flat `round`/`homeFrom`/`awayFrom`; keep all
always-required fields (`home`, `away`, `kick`, `iso` dated today, `venue`, `tv`,
`stream`, >=2 forward-looking `bullets`); add both teams' hexes to
`WC.today.kits`; set `WC.today.stageLabel` to the round name. Rest-day behavior is
unchanged: `games:[]`, refresh `date`/`schedNote`, bump `meta.updated`.

The Today page renders a **knockout sub-card** (not a single-group mini-table) for
these games - see 6.7 and the `today.html` edit in 10.0.4.

---

## 6. Bracket page (bracket.html) UI/UX spec

`bracket.html` is a true peer page built by copying the Tracker shell and
replacing the body. All CSS tokens/classes referenced are verified against
`world_cup_tracker.html` as it stands today.

### 6.1 Reusing the tracker shell

Build by copying `world_cup_tracker.html` lines 1-314 and changing three things,
then replacing the body content:

- **Head (lines 1-9):** copy verbatim; change only `<title>` (line 6) to
  `Men's World Cup 2026 - Bracket`.
- **`<style>` block (lines 10-301):** copy verbatim (the established convention -
  `today.html` already inlines its own copy). This brings the full `:root` token
  set (lines 11-34: `--qual:#1E9E63`, `--third:#E0962B`, `--win`, `--draw`,
  `--loss`, `--gold:#E9B949`, `--band`, `--card`, `--hairline`,
  `--hairline-strong`, `--radius:14px`, `--header-h:54px`, `--shadow`), the
  `body`/`.wrap`/`.display`/`.eyebrow` primitives, the entire sticky-nav CSS
  (lines 54-96 including the 560px hamburger block), the standings table classes
  (lines 251-271: `table`, `thead th`, `tbody td`, `.teamcell`, `.qedge`,
  `tr.q-auto`, `tr.q-third`, `td.pts`, `.gd-pos`, `.gd-neg`), `.section-head`
  (lines 202-205), `.legend`/`.footer` (lines 274-280), and the responsive
  (282-296) + reduced-motion (297-300) blocks. Then append the bracket CSS from
  6.5 just before `</style>` (line 301).
- **Body chrome:** copy the skip-link (line 304), `<header class="site-header">
  <nav class="site-nav" aria-label="Primary">` (lines 305-306), the brand anchor
  (line 307, unchanged "Men's World Cup 2026"), and the `.nav-toggle` button (line
  308). Keep `<main id="main"><div class="wrap"> ... </div></main>`. Reuse the
  footer block (lines 375-378) with `#updated`.
- **Scripts:** end with `<script src="/data.js"></script>` (exact bytes - the
  validator/snapshot require this) then one bracket render `<script>`. Inside,
  copy `el()`/`esc()` verbatim (lines 397-398) and the nav-toggle IIFE verbatim
  (lines 674-681 - the hamburger does not work without it).

### 6.2 Navigation change (hand-synced in all three files)

Three-item `<ul class="nav-links">`. No CSS change required (`.nav-links` is
`display:flex; gap:2px`; the 560px block makes it a column - both accommodate N
items). `aria-current="page"` marks the current page's link only.

`world_cup_tracker.html` (replace lines 309-312):
```html
    <ul class="nav-links" id="nav-links">
      <li><a href="/" aria-current="page">Tracker</a></li>
      <li><a href="/today">Today's Games</a></li>
      <li><a href="/bracket">Bracket</a></li>
    </ul>
```

`today.html` (replace lines 218-221):
```html
    <ul class="nav-links" id="nav-links">
      <li><a href="/">Tracker</a></li>
      <li><a href="/today" aria-current="page">Today's Games</a></li>
      <li><a href="/bracket">Bracket</a></li>
    </ul>
```

`bracket.html`:
```html
    <ul class="nav-links" id="nav-links">
      <li><a href="/">Tracker</a></li>
      <li><a href="/today">Today's Games</a></li>
      <li><a href="/bracket" aria-current="page">Bracket</a></li>
    </ul>
```

### 6.3 Desktop layout - day-one choice and fallback

**RECOMMENDED day-one choice: round-grouped vertical lists in horizontally
scrolling flex columns.** One `<section>`-like column per round, inside a single
`overflow-x:auto` container, each column a vertical stack of match cards. Reading
order R32 -> Final without any SVG, absolute positioning, or vertical-centering.

```html
<section aria-label="Knockout bracket" id="bracket-desktop" class="bracket-scroll">
  <div class="round-col" data-round="r32">
    <div class="round-head"><h2>Round of 32</h2><span class="rc-count">16 ties</span></div>
    <div class="round-list"><!-- match cards --></div>
  </div>
  <div class="round-col" data-round="r16"> ... </div>
  <!-- qf, sf, third, final ... -->
</section>
```

**FALLBACK (CSS-only swap, no HTML/JS change): stacked full-width round sections.**
If the horizontal-scroll container proves awkward on the owner's display, remove
`.bracket-scroll`'s flex/scroll rules and apply:
```css
.round-col{margin-bottom:30px;}
.round-list{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
```
This reads top-to-bottom with no horizontal scrolling. Pick the horizontal-column
layout for day one; switch to the fallback if QA shows the scroll container is
unintuitive.

Both variants collapse to the single-round mobile view below the **720px**
breakpoint (intentionally wider than the site's 560px - see 4.8).

### 6.4 Mobile (<=720px) sticky round-selector

Below 720px, show one round at a time with a sticky selector pinned under the site
header (reuses the `.seg` control look). Labels in order: `R32 | R16 | QF | SF |
3rd | Final`.

Behavior:
- Render all rounds' lists; CSS hides every `.round-col` except the active one on
  mobile.
- On load, auto-select the earliest round (in `WC.bracket.rounds` order) with at
  least one `status !== "final"` match. If all matches are final, select the last
  round (Final). If the bracket has not started, this resolves to `r32`.
- `position:sticky; top:var(--header-h)` so it stays reachable.
- Each button sets `aria-pressed`; the group is `role="group"` with an
  `aria-label`.

```html
<nav class="round-select" id="round-select" role="group" aria-label="Choose a round to view">
  <!-- buttons injected by script: one per WC.bracket.rounds[] entry -->
  <button data-round="r32" aria-pressed="true">R32</button>
  <button data-round="r16" aria-pressed="false">R16</button>
  <button data-round="qf"  aria-pressed="false">QF</button>
  <button data-round="sf"  aria-pressed="false">SF</button>
  <button data-round="third" aria-pressed="false">3rd</button>
  <button data-round="final" aria-pressed="false">Final</button>
</nav>
```

### 6.5 Match-card anatomy + CSS

Each tie is one card with two team rows, reusing the standings-row vocabulary.

```html
<article class="bmatch" data-status="upcoming" aria-label="Round of 32, match 1: Mexico v South Africa">
  <div class="bm-head">
    <span class="bm-id">R32 &middot; Match 1</span>
    <span class="bm-state upcoming">Sat Jun 28, 12:00 PM ET</span>
  </div>
  <div class="bm-row winner">
    <span class="bm-kit" style="background:#0E7C3A"></span>
    <span class="bm-team">Mexico</span>
    <span class="bm-from">Winner Group A</span>
    <span class="bm-score">2</span>
  </div>
  <div class="bm-row loser">
    <span class="bm-kit" style="background:#E2B007"></span>
    <span class="bm-team">South Africa</span>
    <span class="bm-from">Best 3rd C/E/F/H/I</span>
    <span class="bm-score">1</span>
  </div>
  <div class="bm-foot">Estadio Azteca, Mexico City &middot; FOX</div>
</article>
```

Anatomy rules:
- **`.bm-kit`** - color from `WC.today.kits[teamName]`, falling back to
  `var(--hairline-strong)` (see the kit-coupling caveat in 6.8).
- **`.bm-team`** - resolved `homeTeam`/`awayTeam`; when null, render the descriptor
  (`home`/`away`) in the `.unresolved` style. Never `"TBD"`.
- **`.bm-from`** - small uppercase provenance; shown for a resolved team; for an
  unresolved slot the descriptor IS the team line and `.bm-from` is omitted.
- **`.bm-score`** - `hs`/`as` when `status:"final"`; append a penalties caption to
  the card foot when `pens` set ("won 5-4 on penalties"); never overwrite `hs`/`as`.
  No score column while `upcoming`.
- **winner/loser** - compare `winner` (a team name) to each row's team; winning row
  gets `.winner` (bold, full ink), losing row gets `.loser` (dimmed). Weight +
  opacity only; no new colors.
- **`.bm-state`** - plain text: `upcoming` shows the kickoff label in `--muted`;
  `final` shows "Full time" in `--faint`. **There is no `"live"` state** (status is
  only `upcoming`/`final` - see 4.4).

CSS to append before `</style>` (line 301):

```css
/* ---------- Bracket page ---------- */
.bracket-scroll{display:flex;gap:18px;overflow-x:auto;padding:4px 2px 14px;
  scroll-snap-type:x proximity;}
.round-col{flex:0 0 290px;min-width:290px;scroll-snap-align:start;}
.round-head{display:flex;align-items:baseline;gap:10px;margin:6px 0 12px;}
.round-head h2{font-family:'Barlow Condensed','Barlow',sans-serif;font-weight:700;
  font-size:22px;margin:0;letter-spacing:.01em;}
.round-head .rc-count{color:var(--muted);font-size:12.5px;}
.round-list{display:flex;flex-direction:column;gap:14px;}

.bmatch{background:var(--card);border:1px solid var(--hairline);border-radius:var(--radius);
  box-shadow:var(--shadow);overflow:hidden;}
.bm-head{display:flex;align-items:center;justify-content:space-between;gap:8px;
  padding:9px 12px;background:#F7F9FB;border-bottom:1px solid var(--hairline);}
.bm-id{font-family:'Barlow Condensed','Barlow',sans-serif;text-transform:uppercase;
  letter-spacing:.07em;font-size:11px;font-weight:700;color:var(--faint);}
.bm-state{font-size:12px;font-weight:600;color:var(--muted);}
.bm-state.final{color:var(--faint);}

.bm-row{display:flex;align-items:center;gap:10px;padding:9px 12px;}
.bm-row + .bm-row{border-top:1px solid #EEF2F6;}
.bm-kit{width:4px;height:22px;border-radius:3px;flex:none;}
.bm-team{font-family:'Barlow Condensed','Barlow',sans-serif;font-weight:600;font-size:17px;}
.bm-from{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);
  font-family:'Barlow Condensed','Barlow',sans-serif;}
.bm-score{margin-left:auto;font-family:'Barlow Condensed','Barlow',sans-serif;
  font-weight:700;font-size:18px;color:var(--ink);}
.bm-row.winner .bm-team{font-weight:700;color:var(--ink);}
.bm-row.loser .bm-team,.bm-row.loser .bm-score{color:var(--faint);}
.bm-row.unresolved .bm-team{color:var(--faint);font-weight:600;}
.bm-foot{padding:8px 12px;border-top:1px solid #EEF2F6;color:var(--faint);font-size:12px;}

/* mobile: one round at a time + sticky selector (720px, wider than site 560px) */
.round-select{display:none;}
@media (max-width:720px){
  .bracket-scroll{display:block;overflow-x:visible;}
  .round-select{display:flex;gap:4px;overflow-x:auto;position:sticky;top:var(--header-h);z-index:50;
    background:var(--bg-top);padding:8px 2px;margin:0 0 6px;}
  .round-select button{font-family:'Barlow Condensed','Barlow',sans-serif;font-weight:600;
    text-transform:uppercase;letter-spacing:.06em;font-size:13px;white-space:nowrap;
    border:1px solid var(--hairline);background:var(--card);color:var(--muted);
    padding:8px 14px;border-radius:9px;cursor:pointer;box-shadow:var(--shadow);}
  .round-select button[aria-pressed="true"]{background:var(--band);color:#fff;border-color:var(--band);}
  .round-select button:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
  .round-col{flex:none;min-width:0;display:none;margin-bottom:8px;}
  .round-col.active{display:block;}
  .round-list{gap:12px;}
}
```

A legend reusing `.legend`/`.sw` sits above the bracket:
```html
<div class="legend">
  <span class="k"><span class="sw" style="background:var(--qual)"></span> Winner advances</span>
  <span class="k"><span class="sw" style="background:var(--third)"></span> Best third-placed entrant</span>
</div>
```

### 6.6 Render script (placeholder-tolerant)

Reads `WC.bracket` ONLY (never `WC.today`). Dispatches on `WC.meta.phase`. Copy
`el`/`esc` from lines 397-398 first.

```js
const WCB = (WC.bracket && WC.bracket.rounds) || [];
const PHASE = (WC.meta && WC.meta.phase) || "group";
function kitFor(name){ return (WC.today && WC.today.kits && WC.today.kits[name]) || "var(--hairline-strong)"; }

function renderRow(team, descriptor, isWinner, isLoser, score){
  const resolved = !!team;
  const cls = ["bm-row"];
  if(!resolved) cls.push("unresolved");
  else if(isWinner) cls.push("winner");
  else if(isLoser) cls.push("loser");
  const label = esc(resolved ? team : descriptor);
  const from  = resolved ? '<span class="bm-from">'+esc(descriptor)+'</span>' : '';
  const sc    = (score!=null) ? '<span class="bm-score">'+score+'</span>' : '';
  return '<div class="'+cls.join(' ')+'">'+
    '<span class="bm-kit" style="background:'+kitFor(team)+'"></span>'+
    '<span class="bm-team">'+label+'</span>'+from+sc+'</div>';
}

function renderMatch(m){
  const fin = m.status==="final";
  const hw = fin && m.winner===m.homeTeam, aw = fin && m.winner===m.awayTeam;
  const state = fin ? '<span class="bm-state final">Full time</span>'
             : '<span class="bm-state upcoming">'+esc(m.kick||"")+'</span>';
  const pens = (fin && m.pens) ? ' &middot; won '+esc(m.pens)+' on penalties' : '';
  return '<article class="bmatch" data-status="'+esc(m.status)+'">'+
    '<div class="bm-head"><span class="bm-id">'+esc(m.id)+'</span>'+state+'</div>'+
    renderRow(m.homeTeam, m.home, hw, fin&&!hw, fin?m.hs:null)+
    renderRow(m.awayTeam, m.away, aw, fin&&!aw, fin?m.as:null)+
    '<div class="bm-foot">'+esc(m.venue||"")+(m.tv?' &middot; '+esc(m.tv):'')+pens+'</div>'+
  '</article>';
}

function earliestUnfinished(){
  for(const rd of WCB){ if((rd.matches||[]).some(m=>m.status!=="final")) return rd.key; }
  return WCB.length ? WCB[WCB.length-1].key : null;   // all final -> Final; none -> null
}
```

Then build one `.round-col` per `WCB[i]`, inject `.round-select` buttons from the
same array, wire each button to toggle `.active` on the matching `.round-col` and
`aria-pressed`, default the active round to `earliestUnfinished()`, copy the
nav-toggle IIFE (lines 674-681) verbatim, and set `#updated` from
`WC.meta.updated` (mirror tracker line 406).

**Pre-knockout / empty guard.** If `WC.bracket` is absent or empty, render one
tidy card: *"Bracket opens June 28 - check back after the group stage."* If
`phase === "group"` but `WC.bracket` exists with descriptor-only slots, render the
full skeleton (all rounds, placeholder cards) plus a note: *"The knockout bracket
fills in as groups finish. Round of 32 begins June 28."*

```js
if(!WCB.length){
  document.querySelector('#bracket-desktop').innerHTML =
    '<article class="bmatch"><div class="bm-foot" style="padding:14px 16px;font-size:14px;color:var(--muted)">'+
    'Bracket opens June 28 - check back after the group stage.</div></article>';
}
```

### 6.7 Accessibility

- One `<h1>` at the top of `<main>` ("Bracket", optionally with an `.eyebrow`
  "Knockout stage"), then each round is an `<h2>` in `.round-head`. No skipped
  levels.
- Viewport meta (line 5, copied) does not disable zoom; the mobile design does not
  rely on zoom (one full-width round at a time).
- Desktop container is `<section aria-label="Knockout bracket">`; mobile selector
  is `role="group"` with `aria-label` and per-button `aria-pressed`.
- Each match `<article>` carries an `aria-label` summarizing the tie in reading
  order (and the result when final), so score/winner are conveyed without relying
  on color/weight alone.
- Unresolved slots read their descriptor ("Winner Group A v Best 3rd C/E/F/H/I").
- Keep the skip-link and `<main id="main">`.

### 6.8 Kit-color coupling caveat

The bracket reads kit colors from `WC.today.kits`. On a day when `WC.today` is a
rest-day (`kits:{}`) or only carries today's two teams, most bracket teams will not
be in `kits` and their bars fall back to grey (`var(--hairline-strong)`). This is
acceptable for v1 (no crash, neutral bars). If the owner wants stable bracket
colors, seed a small persistent `WC.bracket.kits` map later (out of scope here).

---

## 7. Best third-placed teams race table spec (Tracker page)

Lives on `world_cup_tracker.html` only. **Derived in-page** from group rows -
there is NO stored `WC.thirdPlace` array (see 4.7 and the decision in 12).

### 7.1 Hard rule: ordering only, never client-computed "clinched/eliminated"

CLAUDE.md forbids putting any standing-derived competitive claim on the site that
was not parsed from a structured source. This table MUST show only the **ordering**
of the twelve third-placed teams (Pts > GD > GF) and a **provisional** top-8
cutoff line, always captioned "as things stand". It MUST NOT print any team-level
"clinched/secured/eliminated/through" badge, compute permutation math, or assert a
settled outcome. The cutoff divider is presentational (where the top-8/bottom-4
line falls right now) and is always labelled provisional.

### 7.2 Data prerequisite (blocking)

Requires `gf` on every group row (added in Phase 0 / 5.2). The table reads `r.gf`
for the GF tiebreaker; if `gf` is somehow absent at render time, the code falls
back to `0` and still renders (degraded, never a crash).

### 7.3 Markup seam

Insert a new `<section>` after the group-standings `</section>` (line 373) and
before the footer `<div class="footer">` (line 375):

```html
  <section aria-label="Best third-placed teams">
    <div class="section-head">
      <h2>Best third-placed teams</h2>
      <span class="note">Eight best of twelve reach the Round of 32 &middot; provisional, as things stand</span>
    </div>
    <div id="third-place"></div>
    <p class="tp-caveat">Ordering only &middot; the cutoff can still swing on the final group matchday. Not a statement that any team has qualified or been eliminated.</p>
  </section>
```

### 7.4 Render function + bootstrap call

Add `renderThirdPlace()` after `renderGroups()` closes (line 631) and add
`renderThirdPlace();` to the bootstrap block (after line 686, so it reads
`renderHero(); renderTeams(); renderGroups(); renderThirdPlace(); applyFilters();`).

**Row-ordering dependency (explicit).** This table sorts the COLLECTED twelve
thirds, but it collects each group's third-placed row as `group.rows[2]` (index 2).
That is the true third-placed team ONLY if each group's `rows` are themselves
stored in rank order. The daily routine already keeps group rows sorted (and the
existing `renderGroups()` labels index 2 as `q-third`), so this holds - but to be
robust against an out-of-order day, `renderThirdPlace()` **sorts each group's rows
by Pts > GD > GF before taking index 2.** (This also future-proofs against a day
where uneven `pld` left the data unsorted.) Source rows from `WC.groupsFinal` when
it exists, else live `WC.groups`.

```js
/* =========================================================================
   Best third-placed teams race (Tracker page).
   Derived live from WC.groupsFinal || WC.groups - NO stored copy. ORDERING
   ONLY with a provisional top-8 cutoff. NEVER renders a client-computed
   "clinched"/"eliminated" status (CLAUDE.md data rules). Ranking: Pts>GD>GF.
   ========================================================================= */
function renderThirdPlace(){
  const mount = document.getElementById('third-place');
  if(!mount) return;
  const src = (DATA.groupsFinal && DATA.groupsFinal.length) ? DATA.groupsFinal : DATA.groups;

  const num = (v)=> (typeof v==='number' && !Number.isNaN(v)) ? v : 0;
  const cmp = (a,b)=> (b.pts-a.pts) || (b.gd-a.gd) || (b.gf-a.gf) ||
                      (a.team<b.team?-1:(a.team>b.team?1:0));

  const thirds = [];
  src.forEach(g=>{
    if(!g.started) return;
    // sort this group's rows defensively before taking index 2
    const ranked = (g.rows||[]).slice().sort((x,y)=>
      (num(y.pts)-num(x.pts)) || (num(y.gd)-num(x.gd)) || (num(y.gf)-num(x.gf)) ||
      (x.team<y.team?-1:(x.team>y.team?1:0)));
    const r = ranked[2];
    if(!r || num(r.pld)<=0) return;
    thirds.push({ group:g.id, team:r.team, pld:num(r.pld), gd:num(r.gd), gf:num(r.gf), pts:num(r.pts) });
  });
  thirds.sort(cmp);

  if(!thirds.length){
    mount.innerHTML = '<p class="tp-empty">Third-place places fill in once every group has played. Check back after the next matchday.</p>';
    return;
  }

  const CUT = 8, showCut = thirds.length > CUT;
  let body = '';
  thirds.forEach((t,idx)=>{
    const rank = idx+1, advancing = rank <= CUT;
    const gdTxt = t.gd>0 ? '<span class="gd-pos">+'+t.gd+'</span>'
                : (t.gd<0 ? '<span class="gd-neg">'+t.gd+'</span>' : '0');
    if(showCut && rank===CUT+1){
      body += '<tr class="tp-cut" aria-hidden="true"><td colspan="7">'+
              '<span class="tp-cut-label">Top 8 advance (provisional) &middot; cutoff as things stand</span></td></tr>';
    }
    body += '<tr class="tp-row '+(advancing?'tp-in':'tp-out')+'">'+
      '<td class="tp-rank">'+rank+'</td>'+
      '<td class="tm"><span class="teamcell"><span class="qedge"></span><span class="tn">'+esc(t.team)+'</span></span></td>'+
      '<td class="tp-grp">'+esc(t.group)+'</td>'+
      '<td>'+t.pld+'</td>'+
      '<td>'+gdTxt+'</td>'+
      '<td class="tp-gf">'+t.gf+'</td>'+
      '<td class="pts">'+t.pts+'</td></tr>';
  });

  mount.innerHTML =
    '<div class="gcard tp-card"><div class="gbody"><table class="tp-table">'+
      '<thead><tr><th class="tp-rank">#</th><th class="tm">Team</th><th class="tp-grp">Grp</th>'+
      '<th>Pld</th><th>GD</th><th>GF</th><th>Pts</th></tr></thead>'+
      '<tbody>'+body+'</tbody></table></div></div>';
}
```

Reuses `esc()` (line 398), `DATA` (line 390, alias of `WC`), `.gcard`/`.gbody`,
the bare `table`/`thead th`/`tbody td`/`td.pts`/`.gd-pos`/`.gd-neg` styling, and
`.teamcell`/`.qedge`/`.tn`.

### 7.5 CSS to add (after line 271, before the legend/footer block)

```css
/* ---------- Third-place race ---------- */
.tp-card{margin-top:2px;}
.tp-table .tp-rank{width:34px;font-family:'Barlow Condensed','Barlow',sans-serif;font-weight:700;color:var(--muted);}
.tp-table th.tp-rank{color:var(--faint);}
.tp-table .tp-grp{font-weight:600;color:var(--muted);}
.tp-table .tp-gf{font-variant-numeric:tabular-nums;}
.tp-table tr.tp-in  .qedge{background:var(--qual);}
.tp-table tr.tp-out .qedge{background:var(--third);}
.tp-table tr.tp-out td{color:var(--muted);}
.tp-table tr.tp-cut td{padding:0;border-bottom:0;border-top:2px dashed var(--hairline-strong);
  background:linear-gradient(180deg, rgba(30,158,99,.05), rgba(224,150,43,.05));}
.tp-cut-label{display:block;text-align:center;padding:5px 6px;
  font-family:'Barlow Condensed','Barlow',sans-serif;text-transform:uppercase;
  letter-spacing:.08em;font-size:10.5px;font-weight:700;color:var(--faint);}
.tp-caveat{margin:12px 2px 0;color:var(--faint);font-size:12px;line-height:1.5;}
.tp-empty{margin:8px 2px;color:var(--muted);font-size:14px;}

@media (max-width:560px){
  .tp-table .tp-rank,.tp-table thead th.tp-rank{display:none;}
  .tp-table td:nth-child(4),.tp-table thead th:nth-child(4){display:none;}  /* Pld */
  .tp-table{font-size:13px;}
}
```

### 7.6 Columns + mobile collapse

Desktop columns: Rank (`#`), Team (`.teamcell` + zone-colored `.qedge`), Group,
Pld, GD, GF, Pts. The cutoff divider is a `<tr class="tp-cut">` spanning all 7
columns, drawn between rank 8 and 9, `aria-hidden="true"` (zone meaning is also
carried per-row by `.tp-in`/`.tp-out` and the `.qedge` color). On `<=560px`, hide
Rank and Pld; keep Team/Group/GD/GF/Pts and the divider. (`colspan="7"` larger
than the visible column count still stretches edge to edge.)

### 7.7 Legend/footer

No change required - the existing legend (lines 366-372) already names "Top 2
advance" (green `--qual`) and "3rd place (8 best advance)" (amber `--third`), and
the footer (line 376) already says "the eight best third-placed teams reach the
Round of 32."

---

## 8. Validator + snapshot + scripts changes

All edits are additive or conditional. **Never weaken an existing check.** Line
numbers are against `<root>\scripts\validate.mjs` and `<root>\scripts\snapshot.mjs`
as they stand.

### (A) `scripts/validate.mjs`

#### A.0 - Phase const + enum (near line 65 and inside the `if (WC)` block)

Add the enum constant beside the other top-level consts (after the `PLACEHOLDER`
const at line 65):
```js
const PHASES = ['group', 'r32', 'r16', 'qf', 'sf', 'final', 'done'];
```

Extend the `WC.meta` block (currently lines 105-109). Keep the two existing
`fail`s; add the phase check:
```js
  if (!WC.meta) fail('WC.meta is missing');
  else {
    if (!/men's/i.test(WC.meta.tournament || '')) fail(`WC.meta.tournament should say "Men's" (got "${WC.meta.tournament}")`);
    if (norm(WC.meta.updated) !== norm(expectedShort)) fail(`WC.meta.updated = "${WC.meta.updated}", expected today "${expectedShort}"`);
    if (WC.meta.phase != null && !PHASES.includes(WC.meta.phase))
      fail(`WC.meta.phase must be one of ${PHASES.join('|')} (got "${WC.meta.phase}")`);
  }
```

Immediately after the `WC.meta` block closes, derive `PHASE`:
```js
const PHASE = (WC.meta && WC.meta.phase) || 'group';
```

Build the bracket id index right after the `byId` loop at line 111 (so BOTH the
today-games loop and the bracket checks can use it - this avoids a temporal-dead-
zone ReferenceError; declare it exactly once):
```js
const bracketById = {};
if (WC.bracket && Array.isArray(WC.bracket.rounds))
  for (const rd of WC.bracket.rounds) for (const m of (rd.matches || [])) bracketById[m.id] = m;
```

#### A.1 - `gf`/`ga` in `checkGroupRows` (lines 70-84), runs ALWAYS

Extend the numeric key loop (line 74) to include `gf`,`ga`; accumulate `sgf`/`sga`;
add the per-row `gd===gf-ga` and `gf,ga>=0` checks; add the per-group
`sum(gf)===sum(ga)` HARD check (it is an independent guard - `sgd===0` constrains
differences, not absolute GF/GA totals):

```js
function checkGroupRows(id, rows) {
  if (!Array.isArray(rows) || rows.length !== 4) { fail(`Group ${id}: expected 4 rows, got ${rows && rows.length}`); return; }
  let sgd = 0, sw = 0, sl = 0, sd = 0, spld = 0, sgf = 0, sga = 0;
  for (const r of rows) {
    for (const k of ['pld','w','d','l','gd','gf','ga','pts']) if (typeof r[k] !== 'number' || Number.isNaN(r[k])) fail(`Group ${id} / ${r.team}: ${k} is not a number`);
    if (r.pld < 0 || r.w < 0 || r.d < 0 || r.l < 0 || r.pts < 0) fail(`Group ${id} / ${r.team}: negative value`);
    if (r.gf < 0 || r.ga < 0) fail(`Group ${id} / ${r.team}: negative gf/ga (gf=${r.gf}, ga=${r.ga})`);
    if (r.pld !== r.w + r.d + r.l) fail(`Group ${id} / ${r.team}: pld(${r.pld}) != w+d+l(${r.w + r.d + r.l})`);
    if (r.pts !== 3 * r.w + r.d) fail(`Group ${id} / ${r.team}: pts(${r.pts}) != 3w+d(${3 * r.w + r.d})`);
    if (r.gd !== r.gf - r.ga) fail(`Group ${id} / ${r.team}: gd(${r.gd}) != gf-ga(${r.gf - r.ga})`);
    sgd += r.gd; sw += r.w; sl += r.l; sd += r.d; spld += r.pld; sgf += r.gf; sga += r.ga;
  }
  if (sgd !== 0) fail(`Group ${id}: goal differences sum to ${sgd}, not 0`);
  if (sgf !== sga) fail(`Group ${id}: total gf(${sgf}) != total ga(${sga})`);
  if (sw !== sl) fail(`Group ${id}: total wins(${sw}) != total losses(${sl})`);
  if (sd % 2 !== 0) fail(`Group ${id}: total draws(${sd}) is odd (each draw is shared by two teams)`);
  if (spld % 2 !== 0) fail(`Group ${id}: total matches played(${spld}) is odd`);
}
```

(This newly requires `gf`/`ga` on every group row the instant it lands - the
Phase-0 backfill must be committed in the same pass.)

#### A.2 - Phase-aware today-game required keys (replaces line 129; keeps 131-138)

```js
  (today.games || []).forEach((gm, idx) => {
    const tag = `today game #${idx + 1} (${gm.home} v ${gm.away})`;

    // Knockout when a non-"group" stage key is set, or when phase is past group and there is no single group.
    const isKo = (gm.stage && gm.stage !== 'group') || (PHASE !== 'group' && !gm.group);
    const requiredKeys = isKo
      ? ['home','away','kick','iso','venue','tv','stream','bracketId']   // knockout: no group; link to bracket slot
      : ['group','home','away','kick','iso','venue','tv','stream'];      // group: unchanged
    for (const k of requiredKeys) if (!gm[k]) fail(`${tag}: missing "${k}"`);
    if (isKo && gm.group) fail(`${tag}: knockout game should not carry a single "group"`);

    if (!Array.isArray(gm.bullets) || gm.bullets.length < 2) fail(`${tag}: needs a "bullets" array of >=2 entries`);

    if (gm.iso) {
      if (Number.isNaN(+new Date(gm.iso))) fail(`${tag}: iso "${gm.iso}" is not a valid date`);
      else if (gm.iso.slice(0, 10) !== targetYMD) fail(`${tag}: iso date ${gm.iso.slice(0, 10)} is not today (${targetYMD}) - stale fixture`);
    }

    // Group-stage both-teams-in-group check: UNCHANGED; already guarded by gm.group, so it self-skips for knockout.
    if (gm.group) {
      const g = byId[gm.group];
      if (!g) fail(`${tag}: group ${gm.group} is not one of WC.groups`);
      else for (const side of [gm.home, gm.away]) if (!(g.rows || []).some((r) => r.team === side)) fail(`${tag}: ${side} is not in Group ${gm.group}`);
    }

    // Knockout linkage: today-game must reference a real bracket slot whose resolved teams agree.
    if (isKo && gm.bracketId) {
      const node = bracketById[gm.bracketId];
      if (!node) fail(`${tag}: bracketId "${gm.bracketId}" is not in WC.bracket`);
      else {
        if (node.homeTeam && gm.home !== node.homeTeam) fail(`${tag}: home "${gm.home}" disagrees with bracket slot ${gm.bracketId} (homeTeam "${node.homeTeam}")`);
        if (node.awayTeam && gm.away !== node.awayTeam) fail(`${tag}: away "${gm.away}" disagrees with bracket slot ${gm.bracketId} (awayTeam "${node.awayTeam}")`);
      }
    }
  });
```

#### A.3 - Bracket + groupsFinal integrity (new block after the today-games loop, gated)

This is the knockout replacement for the group stage's "gd sums to zero" guard: a
result is only recordable if it is well-formed (round cardinality), self-consistent
(winner agrees with the scoreline; a level score is impossible without a recorded
penalty result), and correctly cross-linked (the winner advances into the EXACT
`feedsSide` of its `feedsInto` slot).

```js
  if (WC.bracket) {
    const knownTeams = new Set();
    for (const g of (WC.groupsFinal || WC.groups || [])) for (const r of (g.rows || [])) knownTeams.add(r.team);

    if (typeof WC.bracket.source !== 'string' || !WC.bracket.source.trim())
      fail('WC.bracket.source must be a non-empty named structured source string');
    if (!Array.isArray(WC.bracket.rounds)) fail('WC.bracket.rounds must be an array');

    const ROUND_SIZE = { r32: 16, r16: 8, qf: 4, sf: 2, third: 1, final: 1 };
    const seenIds = new Set();
    for (const rd of (WC.bracket.rounds || [])) {
      const exp = ROUND_SIZE[rd.key];
      if (exp == null) fail(`WC.bracket: unknown round key "${rd.key}"`);
      else if (!Array.isArray(rd.matches) || rd.matches.length !== exp)
        fail(`WC.bracket round "${rd.key}": expected ${exp} matches, got ${rd.matches && rd.matches.length}`);

      for (const m of (rd.matches || [])) {
        if (!m.id) { fail(`WC.bracket round "${rd.key}": a match is missing "id"`); continue; }
        if (seenIds.has(m.id)) fail(`WC.bracket: duplicate match id "${m.id}"`);
        seenIds.add(m.id);

        for (const k of ['home','away','iso','venue','tv','status'])
          if (m[k] == null || m[k] === '') fail(`WC.bracket ${m.id}: missing "${k}"`);
        if (m.status !== 'upcoming' && m.status !== 'final')
          fail(`WC.bracket ${m.id}: status must be "upcoming" or "final" (got "${m.status}")`);

        for (const side of ['homeTeam','awayTeam'])
          if (m[side] != null && m[side] !== '' && !knownTeams.has(m[side]))
            fail(`WC.bracket ${m.id}: ${side} "${m[side]}" is not a known tournament team`);

        if (m.status === 'final') {
          if (!Number.isInteger(m.hs) || !Number.isInteger(m.as) || m.hs < 0 || m.as < 0)
            fail(`WC.bracket ${m.id}: a final match needs integer hs/as >= 0`);
          if (!m.homeTeam || !m.awayTeam)
            fail(`WC.bracket ${m.id}: a final match must have both teams resolved`);
          if (m.winner !== m.homeTeam && m.winner !== m.awayTeam)
            fail(`WC.bracket ${m.id}: winner "${m.winner}" must equal homeTeam or awayTeam`);
          if (Number.isInteger(m.hs) && Number.isInteger(m.as)) {
            if (m.hs === m.as) {
              if (!/^\d+-\d+$/.test(m.pens || '')) fail(`WC.bracket ${m.id}: level score ${m.hs}-${m.as} must record a penalty result "X-Y" in "pens"`);
              else { const [ph, pa] = m.pens.split('-').map(Number);
                if (ph === pa) fail(`WC.bracket ${m.id}: penalties cannot be level (${m.pens})`);
                else if (m.winner !== (ph > pa ? m.homeTeam : m.awayTeam)) fail(`WC.bracket ${m.id}: winner "${m.winner}" disagrees with penalties ${m.pens}`); }
            } else {
              if (m.pens) fail(`WC.bracket ${m.id}: non-level score ${m.hs}-${m.as} must not record penalties`);
              if (m.winner !== (m.hs > m.as ? m.homeTeam : m.awayTeam)) fail(`WC.bracket ${m.id}: winner "${m.winner}" disagrees with score ${m.hs}-${m.as}`);
            }
          }
        } else {
          if (m.hs != null || m.as != null || m.winner != null || m.pens != null)
            fail(`WC.bracket ${m.id}: an upcoming match must not carry hs/as/winner/pens`);
        }
      }
    }

    // No resolved team appears twice within one round.
    for (const rd of (WC.bracket.rounds || [])) {
      const seenInRound = new Set();
      for (const m of (rd.matches || [])) for (const side of [m.homeTeam, m.awayTeam]) {
        if (!side) continue;
        if (seenInRound.has(side)) fail(`WC.bracket round "${rd.key}": team "${side}" appears more than once`);
        seenInRound.add(side);
      }
    }

    // Advancement: a final winner must occupy the EXACT feedsSide of its feedsInto slot.
    for (const rd of (WC.bracket.rounds || [])) for (const m of (rd.matches || [])) {
      if (!m.feedsInto) continue;
      const nxt = bracketById[m.feedsInto];
      if (!nxt) { fail(`WC.bracket ${m.id}: feedsInto "${m.feedsInto}" is not a known slot id`); continue; }
      if (m.feedsSide !== 'home' && m.feedsSide !== 'away') { fail(`WC.bracket ${m.id}: feedsSide must be "home" or "away"`); continue; }
      if (m.status === 'final' && m.winner) {
        const slot = m.feedsSide === 'home' ? nxt.homeTeam : nxt.awayTeam;
        if (slot !== m.winner) fail(`WC.bracket ${m.id}: winner "${m.winner}" not keyed into ${m.feedsInto}.${m.feedsSide} (found "${slot}")`);
      }
    }
  }

  // Phase consistency: once past group, the frozen final table must exist.
  if (PHASE !== 'group' && !WC.groupsFinal) fail(`WC.meta.phase is "${PHASE}" but WC.groupsFinal is missing`);

  // groupsFinal table math + all rows pld:3.
  if (WC.groupsFinal) for (const g of WC.groupsFinal) {
    checkGroupRows('FINAL ' + g.id, g.rows || []);
    for (const r of (g.rows || [])) if (r.pld !== 3) fail(`WC.groupsFinal ${g.id} / ${r.team}: pld is ${r.pld}, expected 3`);
  }
```

(There is intentionally NO `WC.thirdPlace` block - the table is derived in-page.)

#### A.4 - Bring `bracket.html` under the hygiene gate (lines 87-100)

Add a `bracketSrc` read tolerant of absence (so the validator does not hard-fail
before `bracket.html` exists), emoji-scan it, and assert it loads `/data.js`:

```js
let dataSrc, trackerSrc, todaySrc, bracketSrc, WC;
try { dataSrc = readFileSync(join(root, 'data.js'), 'utf8'); } catch (e) { fail('cannot read data.js: ' + e.message); }
try { trackerSrc = readFileSync(join(root, 'world_cup_tracker.html'), 'utf8'); } catch (e) { fail('cannot read world_cup_tracker.html: ' + e.message); }
try { todaySrc = readFileSync(join(root, 'today.html'), 'utf8'); } catch (e) { fail('cannot read today.html: ' + e.message); }
try { bracketSrc = readFileSync(join(root, 'bracket.html'), 'utf8'); } catch (e) { /* optional until created */ }
try { if (dataSrc) WC = extractObject(dataSrc, 'WC'); } catch (e) { fail('parse WC from data.js: ' + e.message); }

scanEmoji('data.js', dataSrc);
scanEmoji('world_cup_tracker.html', trackerSrc);
scanEmoji('today.html', todaySrc);
scanEmoji('bracket.html', bracketSrc);
```
(`scanEmoji` must no-op on an undefined source; the existing helper already
tolerates falsy input, but confirm before relying on it.)

Extend the `/data.js` asserts (lines 99-100):
```js
if (trackerSrc && !/<script src="\/data\.js"><\/script>/.test(trackerSrc)) fail('world_cup_tracker.html does not load /data.js');
if (todaySrc && !/<script src="\/data\.js"><\/script>/.test(todaySrc)) fail('today.html does not load /data.js');
if (bracketSrc && !/<script src="\/data\.js"><\/script>/.test(bracketSrc)) fail('bracket.html does not load /data.js');
```

The validator uses `try/catch` to tolerate `bracket.html` absence - it does NOT
need `existsSync` (that is only used in `snapshot.mjs`, a different file - see B).

#### A.5 - Phase-gating summary

| Check | Runs when |
|---|---|
| Group table math incl. `gf`/`ga` (A.1) | always |
| Featured-fixture checks (existing) | always |
| Today-game required keys (A.2) | always; branches on `isKo` |
| Today-game both-teams-in-group (existing 135-138) | when `gm.group` present (self-skips for knockout) |
| Today-game <-> bracket linkage (A.2) | when `isKo && gm.bracketId` |
| Bracket integrity (A.3) | `if (WC.bracket)` |
| Phase requires groupsFinal (A.3) | `PHASE !== 'group'` |
| groupsFinal table math (A.3) | `if (WC.groupsFinal)` |
| phase enum (A.0) | when `WC.meta.phase != null` |
| Freshness (existing), hygiene incl. `bracket.html` (A.4) | always |

### (B) `scripts/snapshot.mjs` - also freeze the bracket

Refactor the inliner into a `freeze()` helper and call it twice. The tracker
snapshot stays byte-identical; the bracket snapshot is a separate file
`snapshots/world_cup_bracket_<ymd>.html` (see 4.8). Replace lines 25-36 and update
the import (line 15) and docstring (lines 11-12):

```js
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
```

```js
const tag = '<script src="/data.js"></script>';
const data = readFileSync(join(root, 'data.js'), 'utf8');
mkdirSync(join(root, 'snapshots'), { recursive: true });

// Inline data.js into a page and write a self-contained dated snapshot.
function freeze(pageFile, outName) {
  const page = readFileSync(join(root, pageFile), 'utf8');
  if (!page.includes(tag)) { console.error(`${pageFile} does not reference /data.js - nothing to inline`); process.exit(1); }
  const inlined = page.replace(tag, '<script>\n' + data.replace(/<\/script>/gi, '<\\/script>') + '\n</script>');
  if (inlined.includes(tag)) { console.error(`ERROR: ${outName} still references external /data.js`); process.exit(1); }
  writeFileSync(join(root, 'snapshots', outName), inlined);
  console.log(`wrote snapshots/${outName} (self-contained, ${inlined.length} bytes)`);
}

freeze('world_cup_tracker.html', `world_cup_tracker_${ymd}.html`);

if (existsSync(join(root, 'bracket.html'))) {
  freeze('bracket.html', `world_cup_bracket_${ymd}.html`);
} else {
  console.log('bracket.html not present yet - skipping bracket snapshot');
}
```

Note: do NOT backfill or edit previously committed dated snapshots when the schema
changes - dated snapshots are immutable historical freezes.

### (C) `scripts/fetch_results.sh` - no change

No code change. The ESPN `fifa.world` scoreboard it already queries returns
knockout fixtures with the same `state`/`completed`/`score`/`displayName` fields,
so the completion guard is unchanged. What it CANNOT give you is the bracket
structure (which qualifier fills each R32 line, which slot a winner feeds) - that
is hand-entered from a named structured bracket source and recorded in
`WC.bracket.source` (see 9).

---

## 9. Transition and daily-routine operations

The 10-step daily flow in CLAUDE.md is unchanged in structure; only the data work
in step 3 changes, plus the step-6 snapshot wording. The routine still edits
`data.js` only.

### 9.1 The one-time CUTOVER (group -> knockout), all in one run's data edit

On the run where the last group matches go `final` (all 12 groups `pld:3`), after
the normal group-table update, in order:

1. Finish `WC.groups` with `gf`/`ga`. Verify per group: all rows `pld:3`, `gd` sums
   to zero, `sum(gf)===sum(ga)`.
2. Freeze `WC.groupsFinal` = deep copy of `WC.groups`, rows sorted into true
   1st->4th order (Pts > GD > GF). Never edit it again.
3. Seed `WC.bracket`: populate all 16 R32 slots' `homeTeam`/`awayTeam` from the
   now-known winners/runners-up + the 8 qualifying third-placed teams, mapped per
   the named source (9.2). Create R16/QF/SF/third/final slots with descriptor-only
   sides (`homeTeam:null`/`awayTeam:null`) and correct `feedsInto`/`feedsSide`. Set
   `WC.bracket.source`.
4. Flip `WC.meta.phase = "r32"`, set `WC.meta.stage = "Round of 32"`, re-point
   `WC.meta.where`.
5. Refresh `WC.today` for the cutover date (knockout match-day shape if R32 games
   kick off, else rest-day).
6. Validate -> snapshot (both files) -> commit -> merge.

Cutover is atomic and one-way: the validator requires `WC.groupsFinal` whenever
`phase !== "group"`, so you cannot land `"r32"` without the frozen table. If the
last group result is in doubt on June 27, leave `phase:"group"` and do the cutover
on the first fully-confirmed run.

### 9.2 Sourcing R32 matchups (named structured source)

- Scores/state: `bash scripts/fetch_results.sh [YYYY-MM-DD]` (ESPN `fifa.world`).
  Completion guard unchanged: a slot goes `final` only when the source reports
  `state=post & completed=true` AND kickoff was >=~2.5h ago.
- Bracket structure: use the **FIFA official Match Schedule / bracket on fifa.com**
  as the primary named source - specifically the official "Round of 32 pairings by
  qualifying-thirds combination" table (the published bracket diagram that maps
  group positions to R32 lines). The exact `3rd-XXXX` combination assigned to each
  R32 slot depends on **which eight groups' thirds qualify**, so on cutover day
  look up the row of that table matching the actual 8 qualified third-place groups.
  Cross-check the resulting pairings against the ESPN `fifa.world` fixtures list
  before writing any team name into a slot. Two independent structured sources must
  agree; never seed from an AI summary.

### 9.3 `WC.today` on knockout match-day vs rest-day

Match-day: one game per tie kicking off today, in the FLAT knockout shape (4.6) -
omit `group`, set `stage` to the round key, set `bracketId`, carry
`round`/`homeFrom`/`awayFrom`, all always-required fields, >=2 forward-looking
`bullets`, both teams in `kits`; set `stageLabel`/`schedNote` to knockout phrasing.

Rest-day: `games:[]`; refresh `date` (today long-form) + `stageLabel` +
`schedNote`; still bump `meta.updated`, validate, snapshot, commit. Never skip a
day.

### 9.4 Hero / featured-team behavior after a team advances or is eliminated

The hero auto-selects the chronologically next `upcoming` fixture across
`WC.teams[].fixtures` and renders its `preview`. **This requires a one-time
`world_cup_tracker.html` hero edit** (specified as a build task in 10.1.7) so the
hero handles knockout fixtures that have no single `group`. As a data author:

- **Advanced, opponent known:** append a knockout fixture (`status:"upcoming"`,
  `opp` = the opponent, future-tense `preview`, >=2 bullets) to that team's
  `fixtures[]`. The hero picks it up automatically.
- **Advanced, opponent NOT known:** add the fixture with a descriptor opponent -
  e.g. `opp:"Winner of Croatia vs Japan"` or `opp:"Round of 16 opponent TBC"`
  (`"TBC"` is allowed; `"TBD"` is NOT). Include the fixed knockout `date`/`venue`
  if scheduled, so the countdown stays alive, with scenario `preview` bullets. If
  no date is fixed yet, leave the team on its last `final` fixture; the hero shows
  the `mode:'done'` copy that points to the bracket.
- **Eliminated:** mark the last fixture `status:"final"` with integer `us`/`them`,
  update `WC.teams[].note` (backward-looking), add no further `upcoming` fixture.
  The hero stops selecting that team. If all featured teams are out, the hero shows
  the `mode:'done'` copy (which the one-time edit links to `/bracket`).
- Never invent a `group` for a knockout fixture. `WC.teams[].group` stays the
  team's original group letter for historical lookup.

### 9.5 Stale-string handling (data-driven vs frozen page markup)

The routine edits `data.js` only, so anything hard-coded in a page cannot be fixed
daily.

| String | Where | Verdict / action |
|---|---|---|
| `WC.meta.stage` | data.js:24 | Data-driven - flip to current round label each round. |
| `WC.meta.where` | data.js:25 | Data-driven - re-point forward each round. |
| `WC.today.stageLabel` | data.js | Data-driven - set to current round name daily. |
| `WC.today.schedNote` | data.js | Data-driven - rewrite for the day's ties / rest-day. |
| Today legend "Top 2 advance" / "3rd place" | today.html markup (static) | Frozen. The recommended one-time today.html edit hides `.legend` on all-knockout days (`document.querySelector('.legend').style.display = TODAY.games.some(g=>g.group)?'':'none'`). If not shipped, accept minor staleness; do NOT try to fix from data.js. |
| Tracker legend / footer "eight best third-placed... reach the Round of 32" | tracker markup (static) | Stays historically accurate (and the third-place table on the Tracker keeps the vocabulary live). Accept as-is. |
| today.html mini-table captions | today.html markup | Resolved by the one-time knockout sub-card branch; no daily action. |
| Brand "Men's World Cup 2026" / nav "Tracker" | markup (static) | Keep - correct in all phases. Validator requires "Men's" in `WC.meta.tournament`. |

### 9.6 Clean-URL verification + fallback (one-time, on the Phase-1 PR preview)

`_redirects` stays unchanged - add NO `/bracket` rule (the documented `/today`
precedent: Pages canonicalises `/bracket.html` -> `/bracket` natively; an explicit
clean-URL rule can infinite-loop). On the Cloudflare Pages preview deploy for the
Phase-1 branch (push the branch to trigger it; this gate BLOCKS the Phase-1 merge):

1. Visit `https://<preview>/bracket` - must serve the bracket page (no 404, no
   loop).
2. Visit `https://<preview>/bracket.html` - must canonicalise to `/bracket`
   cleanly.
3. Confirm `/` and `/today` still resolve (no regression from the third nav link).

**Fallback (only if `/bracket` 404s on the preview):** add exactly the rewrite rule
`/bracket   /bracket.html   200` to `_redirects` (a 200 REWRITE, never a 301/302).
Verify it does not loop: `curl -sI https://<preview>/bracket` should return `200`
with no `Location:` redirect chain. If Pages later resolves `/bracket` natively,
remove the rule. Expected outcome: native resolution, NO rule needed.

### 9.7 Updated knockout-day routine checklist (step 3 data work)

```
[ ] WC.meta.updated -> today's long-form date.
[ ] WC.groups, WC.groupsFinal -> LEAVE FROZEN (validator still checks them).
[ ] WC.bracket:
      - finished slots -> status:"final", integer hs/as, winner=team name,
        pens:"X-Y" only if hs===as (else pens:null).
      - advance each winner into feedsInto.feedsSide of the downstream slot.
      - whole round complete -> bump WC.meta.phase + WC.meta.stage.
      - MANUALLY verify TP-1 both sides (SF losers) - the validator does NOT
        cross-check third-place routing.
      - keep WC.bracket.source accurate.
[ ] WC.meta.stage / WC.meta.where -> current round label + forward prose.
[ ] WC.today: match-day (flat knockout shape, no "group", bracketId, kits) OR
      rest-day (games:[], refresh date/stageLabel/schedNote).
[ ] WC.teams featured fixtures per 9.4 (advanced/known, advanced/unknown,
      eliminated; never invent a group; never "TBD").
[ ] node scripts/validate.mjs  -> ALL CHECKS PASSED (fix data.js, never the validator).
[ ] node scripts/snapshot.mjs  -> writes world_cup_tracker_<date>.html AND world_cup_bracket_<date>.html.
[ ] Commit data.js + both snapshots; push; PR; squash-merge; verify on main.
[ ] Spoiler-free push notification if a tool is available, else skip silently.
```

CLAUDE.md doc follow-ups (one-time): step 6/7 snapshot wording ("the tracker and
the bracket are snapshotted; today.html is not" / "the new snapshots"); Today's
Games guidance to cover the knockout `stage`/`bracketId`/flat-provenance shape and
the `WC.bracket` sourcing rule.

---

## 10. Build plan: phased checklist

Execute top to bottom. Each phase ends with the same hard gate:
`node scripts/validate.mjs` prints `ALL CHECKS PASSED` and (Phase 1 onward)
`node scripts/snapshot.mjs` succeeds and `/bracket` resolves on the preview. Do
not start a later phase until the current one's acceptance criteria pass.

### Phase 0 - URGENT pre-knockout plumbing (MUST land before June 28)

Self-contained; unblocks the daily commit gate; leaves the site fully working on
group-stage data.

**0.1** Add `gf`/`ga` to all 48 group rows in `data.js` (THE long pole - see 3).
Reconstruct from real scores via `fetch_results.sh` over Jun 11-27; preserve
`gf-ga===gd` per row and `sum(gf)===sum(ga)` per group.

**0.2** Add `WC.meta.phase:"group"` to `data.js` (4.1; do not overload `stage`).

**0.3** Extend `validate.mjs`: A.0 (PHASES const, phase enum check, `PHASE`
derive, `bracketById` index lifted to ~line 111), A.1 (`gf`/`ga` in
`checkGroupRows`), A.2 (phase-aware today-game keys, replacing line 129). The
`bracketById` linkage check short-circuits on `WC.bracket` being absent in Phase 0
(no-op until Phase 1).

**0.4** `today.html` knockout sub-card. Branch the per-game right column (line 352,
the `<div class="gc-side">...miniTable(g)...</div>`) so a game with no `g.group`
(or `g.stage && g.stage!=='group'`) renders a knockout sub-card instead of the
single-group mini-table (`miniTable`, lines 291-309). Add `knockoutCard(g)` reading
the FLAT fields `g.round`/`g.homeFrom`/`g.awayFrom` (4.6):

```js
function knockoutCard(g){
  return '<div class="side-h">'+esc(g.round||g.stage||'Knockout')+'</div>'+
    '<div class="koside">'+
      '<div class="korow"><span class="kit" style="background:'+kitFor(g.home)+'"></span>'+
        '<span class="kteam">'+esc(g.home)+'</span><span class="kseed">'+esc(g.homeFrom||'')+'</span></div>'+
      '<div class="komid">winner advances</div>'+
      '<div class="korow"><span class="kit" style="background:'+kitFor(g.away)+'"></span>'+
        '<span class="kteam">'+esc(g.away)+'</span><span class="kseed">'+esc(g.awayFrom||'')+'</span></div>'+
    '</div>'+
    '<div class="standnote">Single elimination &middot; winner advances. Full bracket on the <a href="/bracket">bracket page</a>.</div>';
}
```
Dispatch at line 352:
```js
'<div class="gc-side">'+((g.stage && g.stage!=='group') || !g.group ? knockoutCard(g) : miniTable(g))+'</div>'
```
Add the CSS (reuses `.kit` from line 156, `.side-h` 173-174, `.standnote` 191):
```css
.koside{display:flex;flex-direction:column;gap:10px;margin-top:2px;}
.korow{display:flex;align-items:center;gap:10px;}
.korow .kit{height:26px;}
.kteam{font-family:'Barlow Condensed','Barlow',sans-serif;font-weight:700;font-size:18px;}
.kseed{margin-left:auto;font-size:11.5px;color:var(--faint);font-family:'Barlow Condensed','Barlow',sans-serif;text-transform:uppercase;letter-spacing:.06em;}
.komid{font-size:11px;color:var(--faint);text-transform:uppercase;letter-spacing:.08em;text-align:center;border-top:1px dashed var(--hairline);border-bottom:1px dashed var(--hairline);padding:5px 0;}
```
Optional: after `renderGames()`, hide the group-stage legend on all-knockout days
(9.5). Badge logic, `kitFor`, and `g.stage/kick/venue/tv/stream/bullets` rendering
need NO change.

**Acceptance (Phase 0):**
- [ ] `node scripts/validate.mjs` prints `ALL CHECKS PASSED` on real June 26
  group-stage data (with `gf`/`ga` backfilled).
- [ ] Every row `gf-ga===gd`; every group `sum(gf)===sum(ga)`; 2-3 rows
  spot-checked against the published scoreline.
- [ ] A synthetic `stage:"r32"` knockout today-game (no `group`, with `bracketId`,
  `iso` dated to the test date) passes validation for that date. Synthetic edit
  discarded before commit.
- [ ] `node scripts/snapshot.mjs` writes `snapshots/world_cup_tracker_2026-06-26.html`
  (still tracker-only in Phase 0).
- [ ] `today.html` against a synthetic knockout game renders the knockout sub-card
  (not "Group undefined"), console error-free.

**Rollback (Phase 0):** `git checkout -- data.js today.html scripts/validate.mjs`.
`gf`/`ga` are additive data ignored by the un-extended render; `WC.meta.phase` is
inert if the validator no longer reads it.

### Phase 1 - bracket.html + WC.bracket + nav + snapshot + clean-URL verify

**1.1** Add the `WC.bracket` skeleton to `data.js` (4.5/5.4). For June 26 (still
group stage) every slot is `status:"upcoming"` with `homeTeam:null`/`awayTeam:null`
and descriptors. **R32 skeleton `iso`/`venue`/`kick`:** pre-fill them now from the
published FIFA match schedule (so the skeleton shows real kickoff/venue) - this
means sourcing the FIFA schedule during Phase 1, before groups finish. (If the
schedule is not yet practical to source, leave generic placeholder venues/times
and fill exact values at cutover; pick one and note it. Recommended: pre-fill from
the FIFA schedule.)

**1.2** Create `bracket.html` per section 6 (shell copy, render from `WC.bracket`
only, mobile round-selector, empty/skeleton guard, nav-toggle IIFE, `#updated`).

**1.3** Add the `Bracket` nav `<li>` to all three pages (6.2), correct
`aria-current` per page.

**1.4** Extend `validate.mjs`: A.3 (`WC.bracket`/`WC.groupsFinal` integrity) and
A.4 (`bracket.html` read/scan/`/data.js` assert). Activate the `bracketId`
linkage check (now that `WC.bracket` exists).

**1.5** Extend `snapshot.mjs` (B) to also write
`snapshots/world_cup_bracket_<ymd>.html`. Update CLAUDE.md step 6/7 wording.

**1.6** Clean-URL preview verification (9.6); add NOTHING to `_redirects` unless
the preview proves `/bracket` 404s.

**Acceptance (Phase 1):**
- [ ] `node scripts/validate.mjs` prints `ALL CHECKS PASSED` with the
  `WC.bracket` skeleton (all `upcoming`; score-consistency checks are no-ops).
- [ ] `node scripts/snapshot.mjs` writes BOTH `world_cup_tracker_<ymd>.html` AND
  `world_cup_bracket_<ymd>.html`.
- [ ] `bracket.html` renders all six rounds as section headings with placeholder
  cards; mobile round-selector works; console error-free.
- [ ] Three-item nav identical on all three pages with correct `aria-current`;
  hamburger opens on `bracket.html`.
- [ ] `/bracket` resolves on the Cloudflare preview with the clean URL, no loop;
  `/` and `/today` still resolve.
- [ ] A deliberately malformed bracket FAILS (e.g. a `final` node with `hs===as`
  and `pens:null`; a wrong round cardinality; a winner keyed into the wrong
  `feedsSide`) - confirm at least one negative case before reverting it.

**Rollback (Phase 1):** delete `bracket.html`, revert the nav `<li>` additions,
revert the `snapshot.mjs` bracket block (already a no-op once the file is gone),
revert the `WC.bracket` validator block, remove `WC.bracket` from `data.js` (which
neutralizes the gated checks). No `_redirects` change to undo.

### Phase 2 - third-place race table on the Tracker

**2.1** Add the `<section aria-label="Best third-placed teams">` markup after line
373 (7.3).

**2.2** Add `renderThirdPlace()` after line 631 and call it in the bootstrap block
after line 686 (7.4); add the CSS (7.5).

**2.3** (At the transition, optional-but-recommended) `WC.groupsFinal` freeze;
`renderThirdPlace()` already prefers it. If added, the A.3 `groupsFinal` checks
activate automatically.

**Acceptance (Phase 2):**
- [ ] `node scripts/validate.mjs` prints `ALL CHECKS PASSED`.
- [ ] `node scripts/snapshot.mjs` succeeds; the tracker snapshot includes the
  third-place table.
- [ ] The table renders sorted Pts > GD > GF, top 8 marked advancing and 9-12
  muted, with the "as things stand" caveat; no "clinched/eliminated" text anywhere.
- [ ] Degrades gracefully while groups G-L are at `pld:2` (provisional, no crash).
- [ ] `/bracket` still resolves (no Phase-1 regression).

**Rollback (Phase 2):** remove the section markup, `renderThirdPlace()`, and its
bootstrap call. Removing `WC.groupsFinal` (if added) neutralizes its gated checks.

### Critical-path summary

1. **Phase 0 first, before June 28** - the only phase whose absence breaks the
   automated daily commit once R32 starts.
2. **Phase 1** - depends on Phase 0's `WC.meta.phase` and relaxed today-game gate.
3. **Phase 2** - depends on Phase 0's `gf`/`ga`.

After all three freeze, the daily routine returns to editing `data.js` only.

---

## 11. Out of scope / v2

| Deferred item | Why deferred |
|---|---|
| SVG-drawn bracket tree (connector lines between rounds) | Owner chose simple, reliable rendering first. An SVG tree is fragile across viewports (especially ~380px mobile) and adds significant layout/measurement code with no functional gain over flex columns + a mobile round-selector. Day-one render already conveys the full bracket. No data-contract change when added later. |
| Path-highlighting on hover (a team's full route) | Requires cross-round DOM linkage and interaction state that depends on the SVG/positioned-tree layout above, itself deferred. Non-essential; building it before the tree exists is wasted work. |
| Status chips (LIVE / FT / penalty badges beyond plain score text) | The day-one card shows score + winner emphasis + kickoff, sufficient to read state. There is intentionally no `"live"` status on the bracket (it is a once-a-day static artifact). Richer live-state chips duplicate the Today page's badge logic. |
| Dated bracket snapshots beyond the Phase-1 extension; both teams' final group rows under a knockout game on today.html; a persistent `WC.bracket.kits` map | Nice-to-haves with no bearing on the June 28 deadline or the commit gate. Build only if explicitly requested. |

All deferred items leave the `WC.bracket` / `gf`/`ga` / `WC.meta.phase` /
`WC.groupsFinal` data contract intact, so each can be added in a future one-time
pass with no migration.

---

## 12. Open questions / decisions for the owner

These are genuinely unresolved or owner-judgment calls. Defaults are chosen so the
build can proceed; flag any the owner wants changed.

1. **Third-place table: derived vs stored.** This document resolves it to
   **derived in-page** (no `WC.thirdPlace` array, no validator block for it),
   matching the repo's derive-don't-duplicate pattern. If the owner later wants a
   source-attributed, explicitly-validated "qualified" column (sourced from FIFA
   rather than derived), that is a separate feature: it would re-introduce
   `WC.thirdPlace` and a validator block. Default: derived.

2. **R32 skeleton venues/times in Phase 1 (before groups finish).** Default:
   pre-fill from the published FIFA match schedule so the June-26 skeleton shows
   real kickoff/venue. Alternative: leave generic placeholders and fill at cutover
   (less sourcing work in Phase 1). Owner picks; affects when the FIFA schedule
   must be sourced.

3. **Bracket kit colors.** The bracket reads `WC.today.kits`, so most bracket bars
   are grey on any given day (only today's two teams are in `kits`). Default:
   accept grey bars for v1. If the owner wants stable bracket colors, add a small
   persistent `WC.bracket.kits` map (out of scope here).

4. **Hero "done"-state link.** Default: in the one-time hero edit, linkify
   "knockout bracket" in the `mode:'done'` copy to `/bracket`. Confirm the owner
   wants the hero to point at the new page (recommended).

5. **Third-place section after the group stage.** Once `phase !== "group"` the
   thirds are settled and the bracket shows them. Default: keep the table visible
   (it stays accurate from `groupsFinal`). If the owner prefers, add a one-line
   guard at the top of `renderThirdPlace()` to hide it post-group-stage. Default:
   keep visible.

---

### Relevant absolute paths

- `<root>\data.js` - the only file the daily routine edits; all new keys land here.
- `<root>\world_cup_tracker.html` - Tracker shell to copy; third-place table + hero edit.
- `<root>\today.html` - knockout sub-card branch (Phase 0).
- `<root>\bracket.html` - NEW peer page (Phase 1).
- `<root>\scripts\validate.mjs` - phase-aware commit gate.
- `<root>\scripts\snapshot.mjs` - extended to freeze both pages.
- `<root>\scripts\fetch_results.sh` - unchanged; ESPN fifa.world returns knockout fixtures.
- `<root>\_redirects` - add NO `/bracket` rule (verify on preview).
- `<root>\CLAUDE.md` - one-time doc follow-ups (snapshot wording, Today's Games knockout guidance).
