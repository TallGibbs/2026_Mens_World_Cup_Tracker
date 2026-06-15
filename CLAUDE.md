# World Cup 2026 Tracker - Routine Instructions

## Repository purpose

`world_cup_tracker.html` is a self-contained, single-file matchday companion for
the 2026 FIFA World Cup. It is updated daily by a scheduled Claude Code routine.

## Scheduled routine: daily tracker update

Each run of this routine must follow these steps in order:

1. Read `world_cup_tracker.html` from the repo as the baseline. Keep its layout,
   styling, and JavaScript identical; change only the data.
2. Search authoritative sources (FIFA.com, ESPN, NBC Sports, official team and
   confederation pages) for the live state of the tournament. Confirm the
   tournament stage and today's date, and collect all data needed to update the
   file.
3. Update only the `DATA` object inside the file (layout, CSS, and JS must not
   change). Verify every group's goal differences sum to zero before saving.
4. Save the updated file back to `world_cup_tracker.html` (overwrite in place).
5. Save a dated copy as `world_cup_tracker_YYYY-MM-DD.html` using today's date.
6. Commit both files directly to the `main` branch, which is already checked out
   at the start of the run, with a message such as `Update tracker for <date>`.
   Do not create a new branch.
7. Push directly to `origin main`. Do not open a pull request and do not perform
   any merge step; the file is current on `main` as soon as the push lands.
8. If a push-notification tool is available, send a short summary of what changed
   so the result reaches the owner's phone. If no such tool is available, skip
   this step silently and do not error.

Run every day even if nothing has changed: still set `meta.updated` to today's
date, save today's dated copy, and commit.

## Branch and merge policy

This routine commits straight to `main`. There is no development branch, no pull
request, and no merge step. `main` keeps one commit per daily run.

## Authorisation

The routine is explicitly authorised to commit and push directly to `main`
without human review or a pull request. This is intentional.

## Data rules

- `meta.updated` must be set to today's date (e.g. "June 16, 2026").
- Every group's goal differences must sum to zero before committing.
- No placeholder values may remain in the file.
- Do not use emojis anywhere in the file.
- Do not change the visual design, controls, or countdown logic.
