#!/usr/bin/env node
/*
 * scripts/validate.mjs - mechanical guardrail for the daily tracker routine.
 *
 * It parses the data objects straight out of the two pages:
 *   - DATA  from world_cup_tracker.html
 *   - TODAY from today.html
 * and checks them for internal consistency, cross-page agreement, and freshness
 * for a target date. It changes nothing; it only reports.
 *
 * The routine MUST run this and see "ALL CHECKS PASSED" before committing. If a
 * check fails, fix the DATA/TODAY objects - never edit this validator just to go
 * green.
 *
 * Usage:
 *   node scripts/validate.mjs [YYYY-MM-DD]
 * Date defaults to today in US Eastern Time (the site's reference zone).
 *
 * Exit codes: 0 = all checks pass, 1 = at least one failure, 2 = bad invocation.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---------- target date (Eastern Time) ---------- */
const TZ = 'America/New_York';
const argDate = process.argv[2];
const etTodayYMD = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date());
const targetYMD = argDate || etTodayYMD();
if (!/^\d{4}-\d{2}-\d{2}$/.test(targetYMD)) {
  console.error(`Invalid date argument: "${targetYMD}" (expected YYYY-MM-DD)`);
  process.exit(2);
}
const targetNoon = new Date(`${targetYMD}T12:00:00-04:00`);
const fmt = (opts) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...opts }).format(targetNoon);
const expectedShort = fmt({ month: 'long', day: 'numeric', year: 'numeric' });            // "June 19, 2026"
const expectedLong = fmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); // "Friday, June 19, 2026"
const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

/* ---------- pull a top-level `const NAME = {...}` object literal ---------- */
function extractObject(src, name) {
  const at = src.indexOf('const ' + name);
  if (at < 0) throw new Error(`could not find "const ${name}"`);
  const start = src.indexOf('{', at);
  if (start < 0) throw new Error(`no opening brace after "const ${name}"`);
  let depth = 0, str = null, esc = false, i = start;
  for (; i < src.length; i++) {
    const c = src[i];
    if (str) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { str = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  const text = src.slice(start, i);
  return Function('"use strict"; return (' + text + ');')();
}

/* ---------- raw-text scans (emoji + placeholders) ---------- */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}️]/u;
const PLACEHOLDER = /\b(TBD|TODO|FIXME|PLACEHOLDER|Lorem ipsum|XXXX?)\b/i;
// Emoji rule applies to the whole file; scan the raw source.
function scanEmoji(label, text) {
  if (EMOJI.test(text)) fail(`${label}: contains an emoji character (none allowed)`);
}
// Placeholder tokens are only meaningful inside the data we author, so scan the
// serialized data object (not page chrome like the search input's placeholder=).
function scanPlaceholder(label, obj) {
  if (!obj) return;
  const m = JSON.stringify(obj).match(PLACEHOLDER);
  if (m) fail(`${label}: contains placeholder token "${m[0]}"`);
}

/* ---------- group-table invariants ---------- */
function checkGroupRows(label, id, rows) {
  if (!Array.isArray(rows) || rows.length !== 4) {
    fail(`${label} Group ${id}: expected 4 rows, got ${rows && rows.length}`);
    return;
  }
  let sgd = 0, sw = 0, sl = 0, sd = 0, spld = 0;
  for (const r of rows) {
    for (const k of ['pld', 'w', 'd', 'l', 'gd', 'pts']) {
      if (typeof r[k] !== 'number' || Number.isNaN(r[k])) fail(`${label} Group ${id} / ${r.team}: ${k} is not a number`);
    }
    if (r.pld < 0 || r.w < 0 || r.d < 0 || r.l < 0 || r.pts < 0) fail(`${label} Group ${id} / ${r.team}: negative value`);
    if (r.pld !== r.w + r.d + r.l) fail(`${label} Group ${id} / ${r.team}: pld(${r.pld}) != w+d+l(${r.w + r.d + r.l})`);
    if (r.pts !== 3 * r.w + r.d) fail(`${label} Group ${id} / ${r.team}: pts(${r.pts}) != 3w+d(${3 * r.w + r.d})`);
    sgd += r.gd; sw += r.w; sl += r.l; sd += r.d; spld += r.pld;
  }
  if (sgd !== 0) fail(`${label} Group ${id}: goal differences sum to ${sgd}, not 0`);
  if (sw !== sl) fail(`${label} Group ${id}: total wins(${sw}) != total losses(${sl})`);
  if (sd % 2 !== 0) fail(`${label} Group ${id}: total draws(${sd}) is odd (each draw is shared by two teams)`);
  if (spld % 2 !== 0) fail(`${label} Group ${id}: total matches played(${spld}) is odd`);
}

/* ---------- load both files ---------- */
let trackerSrc, todaySrc, DATA, TODAY;
try { trackerSrc = readFileSync(join(root, 'world_cup_tracker.html'), 'utf8'); }
catch (e) { fail('cannot read world_cup_tracker.html: ' + e.message); }
try { todaySrc = readFileSync(join(root, 'today.html'), 'utf8'); }
catch (e) { fail('cannot read today.html: ' + e.message); }
try { if (trackerSrc) DATA = extractObject(trackerSrc, 'DATA'); } catch (e) { fail('parse DATA: ' + e.message); }
try { if (todaySrc) TODAY = extractObject(todaySrc, 'TODAY'); } catch (e) { fail('parse TODAY: ' + e.message); }
if (trackerSrc) scanEmoji('world_cup_tracker.html', trackerSrc);
if (todaySrc) scanEmoji('today.html', todaySrc);
scanPlaceholder('DATA', DATA);
scanPlaceholder('TODAY', TODAY);

/* ---------- tracker (DATA) ---------- */
const byId = {};
if (DATA) {
  if (!DATA.meta) fail('DATA.meta is missing');
  else {
    if (!/men's/i.test(DATA.meta.tournament || '')) fail(`DATA.meta.tournament should say "Men's" (got "${DATA.meta.tournament}")`);
    if (norm(DATA.meta.updated) !== norm(expectedShort)) fail(`DATA.meta.updated = "${DATA.meta.updated}", expected today "${expectedShort}"`);
  }
  for (const g of (DATA.groups || [])) { byId[g.id] = g; checkGroupRows('tracker', g.id, g.rows || []); }
  for (const t of (DATA.teams || [])) {
    const g = byId[t.group];
    if (!g) fail(`team ${t.name}: group ${t.group} not found in DATA.groups`);
    else if (!(g.rows || []).some((r) => r.team === t.name)) fail(`team ${t.name} not present in its Group ${t.group} rows`);
    for (const f of (t.fixtures || [])) {
      if (f.status !== 'final' && f.status !== 'upcoming') fail(`${t.name} v ${f.opp}: status must be "final" or "upcoming" (got "${f.status}")`);
      if (f.status === 'final' && (!Number.isInteger(f.us) || !Number.isInteger(f.them) || f.us < 0 || f.them < 0))
        fail(`${t.name} v ${f.opp}: a final fixture needs integer us/them scores`);
      if (f.status === 'upcoming' && (!Array.isArray(f.preview) || f.preview.length < 2))
        fail(`${t.name} v ${f.opp}: an upcoming fixture needs a "preview" array of >=2 forward-looking bullets`);
    }
  }
}

/* ---------- Today's Games (TODAY) ---------- */
if (TODAY) {
  if (norm(TODAY.updated) !== norm(expectedShort)) fail(`TODAY.updated = "${TODAY.updated}", expected today "${expectedShort}"`);
  if (norm(TODAY.date) !== norm(expectedLong)) fail(`TODAY.date = "${TODAY.date}", expected today "${expectedLong}"`);
  for (const id of Object.keys(TODAY.groups || {})) checkGroupRows('today', id, TODAY.groups[id]);

  const gameGroups = new Set();
  (TODAY.games || []).forEach((gm, idx) => {
    const tag = `today game #${idx + 1} (${gm.home} v ${gm.away})`;
    for (const k of ['group', 'home', 'away', 'kick', 'iso', 'venue', 'tv', 'stream']) if (!gm[k]) fail(`${tag}: missing "${k}"`);
    if (!Array.isArray(gm.bullets) || gm.bullets.length < 2) fail(`${tag}: needs a "bullets" array of >=2 entries`);
    if (gm.iso) {
      if (Number.isNaN(+new Date(gm.iso))) fail(`${tag}: iso "${gm.iso}" is not a valid date`);
      else if (gm.iso.slice(0, 10) !== targetYMD) fail(`${tag}: iso date ${gm.iso.slice(0, 10)} is not today (${targetYMD}) - stale fixture`);
    }
    if (gm.group) {
      gameGroups.add(gm.group);
      const rows = (TODAY.groups || {})[gm.group];
      if (!rows) fail(`${tag}: group ${gm.group} is missing from TODAY.groups`);
      else for (const side of [gm.home, gm.away]) if (!rows.some((r) => r.team === side)) fail(`${tag}: ${side} is not listed in TODAY.groups.${gm.group}`);
    }
  });
  for (const id of Object.keys(TODAY.groups || {})) if (!gameGroups.has(id)) warn(`TODAY.groups has Group ${id} but no game today references it`);

  /* cross-page consistency: today's pre-kickoff standings must equal the tracker's */
  if (DATA) {
    for (const id of Object.keys(TODAY.groups || {})) {
      const tg = byId[id];
      if (!tg) { fail(`cross-check: Group ${id} is in today.html but not in the tracker`); continue; }
      const a = TODAY.groups[id], b = tg.rows || [];
      if (a.length !== b.length) { fail(`cross-check Group ${id}: row count differs (today ${a.length} vs tracker ${b.length})`); continue; }
      for (let i = 0; i < a.length; i++) {
        for (const k of ['team', 'pld', 'w', 'd', 'l', 'gd', 'pts']) {
          if (a[i][k] !== b[i][k]) fail(`cross-check Group ${id} row ${i + 1}: ${k} differs (today "${a[i][k]}" vs tracker "${b[i][k]}")`);
        }
      }
    }
  }
}

/* ---------- report ---------- */
console.log(`World Cup data validation - target date ${targetYMD} (${expectedLong})`);
console.log(`  tracker meta.updated: ${DATA && DATA.meta ? DATA.meta.updated : '?'}`);
console.log(`  today.updated:        ${TODAY ? TODAY.updated : '?'}`);
console.log('');
if (warnings.length) {
  console.log(`WARNINGS (${warnings.length}):`);
  for (const w of warnings) console.log('  [WARN] ' + w);
  console.log('');
}
if (errors.length) {
  console.log(`FAILED - ${errors.length} problem(s) must be fixed before committing:`);
  for (const e of errors) console.log('  [FAIL] ' + e);
  process.exit(1);
}
console.log('ALL CHECKS PASSED');
process.exit(0);
