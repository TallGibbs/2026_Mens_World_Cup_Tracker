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
   merged and the squashed commit is on `main` - and only then delete the merged
   development branch from `origin` (for example
   `git push origin --delete <branch-name>`, or the GitHub delete-branch tool).
   Do not delete the branch until the merge is verified. This self-merge and the
   branch deletion are explicitly authorised.
9. Email the distribution list a short message linking to the updated tracker.
   Read the recipient addresses from `email_config.py` (the `RECIPIENTS` list) so
   there is a single source of truth for who the update goes to. Do not inline or
   attach the tracker (the file renders via JavaScript, which email clients strip,
   and the connector cannot attach files). Instead, using a subject such as
   `World Cup 2026 Tracker - <date>`, send a brief message whose body contains
   hyperlinks to:
     - the live tracker on `main`:
       https://github.com/TallGibbs/2026_Mens_World_Cup_Tracker/blob/main/world_cup_tracker.html
     - today's dated snapshot (substitute today's date):
       https://github.com/TallGibbs/2026_Mens_World_Cup_Tracker/blob/main/world_cup_tracker_YYYY-MM-DD.html
     - the repository home:
       https://github.com/TallGibbs/2026_Mens_World_Cup_Tracker
   If an email tool that can send messages is available, send it; if only a draft
   tool is available, create the draft to those recipients instead and note in the
   run summary that it needs a manual send. If no email tool is available at all,
   skip this step silently and do not error.
10. If a push-notification tool is available, send a short summary of what changed
   so the result reaches the owner's phone. If no such tool is available, skip
   this step silently and do not error.

Run every day even if nothing has changed: still set `meta.updated` to today's
date, save today's dated copy, and commit.

## Branch and merge policy

Each run works on the development branch that is checked out at the start of the
run, pushes that branch, opens (or reuses) a pull request into `main`, and then
squash-merges that pull request into `main` itself. The routine does not wait for
human review or approval before merging. After verifying the merge succeeded, it
deletes the merged development branch from `origin` so stale branches do not pile
up. `main` keeps one squashed commit per daily run.

## Authorisation

The routine is explicitly authorised to open a pull request and squash-merge it
into `main` itself, without human review or approval. This is intentional.

## Data rules

- `meta.updated` must be set to today's date (e.g. "June 16, 2026").
- Every group's goal differences must sum to zero before committing.
- No placeholder values may remain in the file.
- Do not use emojis anywhere in the file.
- Do not change the visual design, controls, or countdown logic.
