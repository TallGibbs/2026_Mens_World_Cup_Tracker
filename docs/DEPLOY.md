# Deploy & Hosting (Netlify + GoDaddy)

The tracker is a single static HTML file, so hosting is simple: a Netlify site
connected to this GitHub repo with **continuous deployment**, served at the
subdomain **`worldcup.youmissedit.org`**. There is no build step and no backend.

Once set up, nothing about the daily routine changes: each run commits and pushes
the refreshed `world_cup_tracker.html` to `main` (see `CLAUDE.md`), Netlify sees
the push and redeploys automatically, and the live site updates within a minute
or two. The daily email links to the live web view instead of an attachment.

## Current deployment (live)

- **Netlify site:** `worldcup-youmissedit` (team **YouMissedIt**), continuous
  deployment from `main`.
- **Netlify URL (live, renders correctly):** https://worldcup-youmissedit.netlify.app/
- **Custom domain:** `worldcup.youmissedit.org` - add the GoDaddy CNAME (step 3
  below) to bring it live.

## How it serves

`netlify.toml` (repo root) does two things:

- `publish = "."` - publish the repo as-is (no build command).
- a `200` (rewrite) rule mapping `/` -> `/world_cup_tracker.html`, so the bare
  domain renders the current tracker while the URL stays clean.

Dated snapshots are reachable directly, e.g.
`https://worldcup.youmissedit.org/snapshots/world_cup_tracker_2026-06-16.html`.

## One-time setup

### 1. Create the Netlify site (interactive - needs your Netlify login)

Netlify dashboard -> **Add new site -> Import an existing project -> Deploy with
GitHub** -> authorize Netlify for GitHub if prompted -> pick
`TallGibbs/2026_Mens_World_Cup_Tracker` -> use team **YouMissedIt** (same team as
the Woodloch site).

Build settings: leave the **build command empty** and **publish directory** as
the repo root (`netlify.toml` already sets `publish = "."`). Click **Deploy**.
Netlify gives the site a `*.netlify.app` URL - confirm the tracker renders there
before wiring DNS.

> CLI alternative (if you prefer the terminal): from the repo root run
> `netlify login` then `netlify init` (link to a new site, no build command),
> and `netlify deploy --prod` for a manual publish. Continuous deployment via the
> GitHub import above is preferred because the daily routine already pushes to
> `main`.

### 2. Add the custom domain in Netlify

Netlify -> the new site -> **Domain management -> Add a domain** ->
`worldcup.youmissedit.org`. Netlify shows a **CNAME target** (e.g.
`your-site-name.netlify.app`). Copy it.

### 3. Add one CNAME at GoDaddy (leave apex + www alone)

GoDaddy -> `youmissedit.org` -> **DNS -> Records -> Add**:

| Field | Value |
|---|---|
| Type | **CNAME** |
| Name/Host | **`worldcup`** (just the label, not the full domain) |
| Value / Points to | **the Netlify target from step 2** |
| TTL | default |

**Do NOT change the apex `@` or `www`** - those stay pointed at Google Sites,
exactly like the Woodloch setup. This adds one subdomain and touches nothing else.

Netlify auto-provisions a Let's Encrypt certificate once DNS resolves (usually
minutes, up to ~24h). Then **https://worldcup.youmissedit.org/** is live and
auto-renews.

## Day-to-day

Nothing to do. The daily routine's push to `main` triggers a Netlify redeploy.
To publish a manual change, just commit and push to `main`.

## Verifying a deploy

- Netlify dashboard -> **Deploys** shows each push and its build/publish status.
- Open https://worldcup.youmissedit.org/ and confirm `meta.updated` matches the
  latest run's date.
