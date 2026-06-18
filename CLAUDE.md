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
5. Save a dated copy inside the `snapshots/` folder as
   `snapshots/world_cup_tracker_YYYY-MM-DD.html` using today's date. All dated
   copies live in `snapshots/`; never write them to the repository root. Create
   the folder if it does not exist.
6. Commit both files to the development branch that is checked out at the start
   of the run, with a message such as `Update tracker for <date>`.
7. Push that branch to `origin` with `git push -u origin <branch-name>`.
8. Open a pull request into `main` for that branch (if the harness has already
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
9. If a push-notification tool is available, send a short, spoiler-free ping that
   the tracker has been refreshed - for example "World Cup 2026 Tracker updated
   for June 16, 2026". Like the email, it must not include any matches, scores,
   standings, results, or team details, so it cannot spoil a game on the owner's
   phone. If no such tool is available, skip this step silently and do not error.

Run every day even if nothing has changed: still set `meta.updated` to today's
date, save today's dated copy, and commit.

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

The tracker is hosted on **Netlify** at **https://worldcup.youmissedit.org/**
(subdomain of `youmissedit.org`; apex + `www` are unrelated and stay on Google
Sites). The Netlify site is connected to this GitHub repo with **continuous
deployment from `main`**, so the routine does not deploy anything itself: once a
run's commit lands on `main` (step 8), Netlify rebuilds and the live site
reflects it within a minute or two. There is no build step - `netlify.toml` just
publishes the repo root and rewrites `/` to `world_cup_tracker.html`, so the bare
domain renders the current tracker and dated snapshots are reachable at
`/snapshots/world_cup_tracker_YYYY-MM-DD.html`. Setup and DNS details live in
`docs/DEPLOY.md`.

## Data rules

- `meta.updated` must be set to today's date (e.g. "June 16, 2026").
- Every group's goal differences must sum to zero before committing.
- No placeholder values may remain in the file.
- Do not use emojis anywhere in the file.
- Do not change the visual design, controls, or countdown logic.
