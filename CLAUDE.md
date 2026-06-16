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
9. Email the distribution list a short, spoiler-free message linking to the
   updated tracker. Read the recipient addresses from `email_config.py` (the
   `RECIPIENTS` list) so there is a single source of truth for who the update goes
   to. Do not inline or attach the tracker (the file renders via JavaScript, which
   email clients strip, and the connector cannot attach files).

   Keep the email deliberately minimal so it can never spoil a result. Using a
   subject such as `World Cup 2026 Tracker - <date>`, the body must contain only
   these three things, in this order:
     - a friendly greeting;
     - the date and time the tracker was last updated (e.g. "Updated June 16,
       2026 at 9:32 AM ET"); and
     - hyperlinks to our repository:
       - the live tracker on `main`:
         https://github.com/TallGibbs/2026_Mens_World_Cup_Tracker/blob/main/world_cup_tracker.html
       - today's dated snapshot (substitute today's date):
         https://github.com/TallGibbs/2026_Mens_World_Cup_Tracker/blob/main/world_cup_tracker_YYYY-MM-DD.html
       - the repository home:
         https://github.com/TallGibbs/2026_Mens_World_Cup_Tracker

   Do NOT describe any matches, scores, standings, fixtures, results, schedules,
   or other tournament details anywhere in the subject or body - no game
   summaries, no "what changed" notes, no team mentions - so the email cannot
   spoil a game for anyone who has not watched yet. The links alone let readers
   open the tracker when they are ready.

   If an email tool that can send messages is available, send it; if only a draft
   tool is available, create the draft to those recipients instead and note in the
   run summary that it needs a manual send. If no email tool is available at all,
   skip this step silently and do not error.
10. If a push-notification tool is available, send a short, spoiler-free ping that
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

## Data rules

- `meta.updated` must be set to today's date (e.g. "June 16, 2026").
- Every group's goal differences must sum to zero before committing.
- No placeholder values may remain in the file.
- Do not use emojis anywhere in the file.
- Do not change the visual design, controls, or countdown logic.
