# Deploy & Hosting (Cloudflare Pages + GoDaddy)

The tracker is a single static HTML file, so hosting is simple: a Cloudflare
Pages project connected to this GitHub repo with **continuous deployment**,
served at the subdomain **`worldcup.youmissedit.org`**. There is no build step
and no backend.

Once set up, nothing about the daily routine changes: each run commits and pushes
the refreshed `world_cup_tracker.html` to `main` (see `CLAUDE.md`), Cloudflare
Pages sees the push and redeploys automatically, and the live site updates within
a minute or two.

## Why Cloudflare Pages (migrated off Netlify)

The site previously ran on Netlify. Netlify's free plan is now a hard **300
credits/month** with no overage, and **each production deploy costs ~15
credits** - so a site that redeploys **every day** (~30 x 15 = ~450 credits/mo)
blows past the free cap on deploys alone, which **pauses the site** until the
next billing cycle. Cloudflare Pages' free tier fits a daily-updated static site
far better: **no bandwidth cap** and **500 builds/month** (our ~30/mo is a
fraction), plus free custom domains and SSL.

## How it serves

`_redirects` (repo root) defines two rewrites, in syntax shared by Cloudflare
Pages and Netlify:

- `/` -> `/world_cup_tracker.html` (status `200`, so the bare domain renders the
  current tracker while the URL stays clean).
- `/today` -> `/today.html`.

There is no build command and the build output directory is the repo root, so
Cloudflare publishes the files as-is. Dated snapshots are reachable directly,
e.g. `https://worldcup.youmissedit.org/snapshots/world_cup_tracker_2026-06-16.html`.

## One-time setup

### 1. Create the Cloudflare Pages project (needs your Cloudflare login)

Cloudflare dashboard -> **Workers & Pages -> Create -> Pages -> Connect to Git**
-> authorize Cloudflare for GitHub if prompted -> pick
`TallGibbs/2026_Mens_World_Cup_Tracker` -> production branch **`main`**.

Build settings:

| Field | Value |
|---|---|
| Framework preset | **None** |
| Build command | **(leave empty)** |
| Build output directory | **`/`** (repo root) |

Click **Save and Deploy**. Cloudflare gives the project a `*.pages.dev` URL -
confirm the tracker renders there (and that `/today` and a `/snapshots/...` file
load) before wiring DNS.

### 2. Add the custom domain in Cloudflare Pages

Pages project -> **Custom domains -> Set up a custom domain** ->
`worldcup.youmissedit.org`. Because the `youmissedit.org` zone is **not** on
Cloudflare, it will show a **CNAME target** (the project's `*.pages.dev`
hostname). Copy it.

### 3. Update the one CNAME at GoDaddy (leave apex + www alone)

GoDaddy -> `youmissedit.org` -> **DNS -> Records**. Edit the existing
**`worldcup`** CNAME (it currently points at the old Netlify target) and change
its value:

| Field | Value |
|---|---|
| Type | **CNAME** |
| Name/Host | **`worldcup`** (just the label, not the full domain) |
| Value / Points to | **the Cloudflare Pages target from step 2** (`<project>.pages.dev`) |
| TTL | default |

**Do NOT change the apex `@` or `www`** - those stay pointed at Google Sites.
This swaps one subdomain record and touches nothing else.

Cloudflare auto-provisions the SSL certificate once DNS resolves (usually
minutes). Then **https://worldcup.youmissedit.org/** is live and auto-renews.

### 4. Decommission Netlify (optional cleanup)

Once the subdomain resolves to Cloudflare and HTTPS is green, you can delete (or
just leave paused) the old `worldcup-youmissedit` Netlify site. Removing this
site also frees credits for any other projects on that Netlify account, since one
paused project pauses the whole account.

## Day-to-day

Nothing to do. The daily routine's push to `main` triggers a Cloudflare Pages
redeploy. To publish a manual change, just commit and push to `main`.

## Verifying a deploy

- Cloudflare dashboard -> the Pages project -> **Deployments** shows each push
  and its status.
- Open https://worldcup.youmissedit.org/ and confirm `meta.updated` matches the
  latest run's date.
