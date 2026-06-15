# World Cup 2026 Tracker - Routine Instructions

## Repository purpose

`world_cup_tracker.html` is a self-contained, single-file matchday companion for
the 2026 FIFA World Cup. It is updated daily by a scheduled Claude Code routine.

## Scheduled routine: daily tracker update

Each run of this routine must follow these steps in order:

1. Read `world_cup_tracker.html` from the repo as the baseline.
2. Search authoritative sources (FIFA.com, ESPN, NBC Sports) for the live state
   of the tournament and collect all data needed to update the file.
3. Update only the `DATA` object inside the file (layout, CSS, and JS must not
   change). Verify every group's goal differences sum to zero before saving.
4. Save the updated file back to `world_cup_tracker.html` (overwrite in place).
5. Save a dated copy as `world_cup_tracker_YYYY-MM-DD.html` using today's date.
6. Commit both files to the designated development branch with a message such as
   `Update tracker for <date>`.
7. Push the branch to `origin`.
8. Create a draft pull request targeting `main` if one does not already exist.
9. **Immediately squash-merge the PR into `main`** using the GitHub MCP tool
   `mcp__github__merge_pull_request` with `merge_method: "squash"`. Do not wait
   for a review or any other approval. The routine is authorised to merge.
10. After a successful merge, delete the remote development branch if a branch
    deletion tool is available. If no such tool is available, skip this step
    silently; do not error.
11. Send a push notification summarising what changed (inside
    `<routine_summary>` tags) so the results reach the owner's phone.

## Merge method

Always use **squash merge** (not regular merge or rebase) so that `main` keeps a
clean one-commit-per-day history.

## Authorisation

The routine is explicitly authorised to push to its branch, open a PR, and
squash-merge that PR into `main` without human review. This is intentional.

## Data rules

- `meta.updated` must be set to today's date (e.g. "June 16, 2026").
- Every group's goal differences must sum to zero before committing.
- No placeholder values may remain in the file.
- Do not use emojis anywhere in the file.
- Do not change the visual design, controls, or countdown logic.
