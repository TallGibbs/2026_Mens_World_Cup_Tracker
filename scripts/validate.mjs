#!/usr/bin/env node
/*
 * scripts/validate.mjs - mechanical guardrail for the daily tracker routine.
 *
 * Since the single-source refactor, ALL tournament data lives in data.js as one
 * `WC` object ({ meta, teams, groups, today }). Both pages render from it, so
 * the two pages can no longer disagree by construction. This validator parses
 * WC and checks it for internal consistency and freshness for a target date. It
 * changes nothing; it only reports.
 *
 * The routine MUST run this and see "ALL CHECKS PASSED" before committing. If a
 * check fails, fix data.js - never edit this validator just to go green.
 *
 * Usage:
 *   node scripts/validate.mjs [YYYY-MM-DD]   (defaults to today, US Eastern)
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
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const targetYMD = argDate || etTodayYMD();
if (!/^\d{4}-\d{2}-\d{2}$/.test(targetYMD)) {
  console.error(`Invalid date argument: "${targetYMD}" (expected YYYY-MM-DD)`);
  process.exit(2);
}
const targetNoon = new Date(`${targetYMD}T12:00:00-04:00`);
const fmt = (opts) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...opts }).format(targetNoon);
const expectedShort = fmt({ month: 'long', day: 'numeric', year: 'numeric' });
const expectedLong = fmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

/* ---------- pull a top-level `const NAME = {...}` object literal ---------- */
function extractObject(src, name) {
  const at = src.indexOf('const ' + name);
  if (at < 0) throw new Error(`could not find "const ${name}"`);
  const start = src.indexOf('{', src.indexOf('=', at));
  if (start < 0) throw new Error(`no opening brace after "const ${name}"`);
  let depth = 0, str = null, esc = false, i = start;
  for (; i < src.length; i++) {
    const c = src[i];
    if (str) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === str) str = null; continue; }
    if (c === '"' || c === "'" || c === '`') { str = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return Function('"use strict"; return (' + src.slice(start, i) + ');')();
}

/* ---------- raw-text scans ---------- */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}️]/u;
const PLACEHOLDER = /\b(TBD|TODO|FIXME|PLACEHOLDER|Lorem ipsum|XXXX?)\b/i;
function scanEmoji(label, text) { if (text && EMOJI.test(text)) fail(`${label}: contains an emoji character (none allowed)`); }
function scanPlaceholder(label, obj) { if (obj) { const m = JSON.stringify(obj).match(PLACEHOLDER); if (m) fail(`${label}: contains placeholder token "${m[0]}"`); } }

/* ---------- group-table invariants ---------- */
function checkGroupRows(id, rows) {
  if (!Array.isArray(rows) || rows.length !== 4) { fail(`Group ${id}: expected 4 rows, got ${rows && rows.length}`); return; }
  let sgd = 0, sw = 0, sl = 0, sd = 0, spld = 0;
  for (const r of rows) {
    for (const k of ['pld', 'w', 'd', 'l', 'gd', 'pts']) if (typeof r[k] !== 'number' || Number.isNaN(r[k])) fail(`Group ${id} / ${r.team}: ${k} is not a number`);
    if (r.pld < 0 || r.w < 0 || r.d < 0 || r.l < 0 || r.pts < 0) fail(`Group ${id} / ${r.team}: negative value`);
    if (r.pld !== r.w + r.d + r.l) fail(`Group ${id} / ${r.team}: pld(${r.pld}) != w+d+l(${r.w + r.d + r.l})`);
    if (r.pts !== 3 * r.w + r.d) fail(`Group ${id} / ${r.team}: pts(${r.pts}) != 3w+d(${3 * r.w + r.d})`);
    sgd += r.gd; sw += r.w; sl += r.l; sd += r.d; spld += r.pld;
  }
  if (sgd !== 0) fail(`Group ${id}: goal differences sum to ${sgd}, not 0`);
  if (sw !== sl) fail(`Group ${id}: total wins(${sw}) != total losses(${sl})`);
  if (sd % 2 !== 0) fail(`Group ${id}: total draws(${sd}) is odd (each draw is shared by two teams)`);
  if (spld % 2 !== 0) fail(`Group ${id}: total matches played(${spld}) is odd`);
}

/* ---------- load the single source ---------- */
let dataSrc, trackerSrc, todaySrc, WC;
try { dataSrc = readFileSync(join(root, 'data.js'), 'utf8'); } catch (e) { fail('cannot read data.js: ' + e.message); }
try { trackerSrc = readFileSync(join(root, 'world_cup_tracker.html'), 'utf8'); } catch (e) { fail('cannot read world_cup_tracker.html: ' + e.message); }
try { todaySrc = readFileSync(join(root, 'today.html'), 'utf8'); } catch (e) { fail('cannot read today.html: ' + e.message); }
try { if (dataSrc) WC = extractObject(dataSrc, 'WC'); } catch (e) { fail('parse WC from data.js: ' + e.message); }

scanEmoji('data.js', dataSrc);
scanEmoji('world_cup_tracker.html', trackerSrc);
scanEmoji('today.html', todaySrc);
scanPlaceholder('data.js (WC)', WC);

/* both pages must actually load the shared data file */
if (trackerSrc && !/<script src="\/data\.js"><\/script>/.test(trackerSrc)) fail('world_cup_tracker.html does not load /data.js');
if (todaySrc && !/<script src="\/data\.js"><\/script>/.test(todaySrc)) fail('today.html does not load /data.js');

/* ---------- WC checks ---------- */
const byId = {};
if (WC) {
  if (!WC.meta) fail('WC.meta is missing');
  else {
    if (!/men's/i.test(WC.meta.tournament || '')) fail(`WC.meta.tournament should say "Men's" (got "${WC.meta.tournament}")`);
    if (norm(WC.meta.updated) !== norm(expectedShort)) fail(`WC.meta.updated = "${WC.meta.updated}", expected today "${expectedShort}"`);
  }

  for (const g of (WC.groups || [])) { byId[g.id] = g; checkGroupRows(g.id, g.rows || []); }

  for (const t of (WC.teams || [])) {
    const g = byId[t.group];
    if (!g) fail(`team ${t.name}: group ${t.group} not found in WC.groups`);
    else if (!(g.rows || []).some((r) => r.team === t.name)) fail(`team ${t.name} not present in its Group ${t.group} rows`);
    for (const f of (t.fixtures || [])) {
      if (f.status !== 'final' && f.status !== 'upcoming') fail(`${t.name} v ${f.opp}: status must be "final" or "upcoming" (got "${f.status}")`);
      if (f.status === 'final' && (!Number.isInteger(f.us) || !Number.isInteger(f.them) || f.us < 0 || f.them < 0)) fail(`${t.name} v ${f.opp}: a final fixture needs integer us/them scores`);
      if (f.status === 'upcoming' && (!Array.isArray(f.preview) || f.preview.length < 2)) fail(`${t.name} v ${f.opp}: an upcoming fixture needs a "preview" array of >=2 forward-looking bullets`);
    }
  }

  /* Today's Games */
  const today = WC.today || {};
  if (norm(today.date) !== norm(expectedLong)) fail(`WC.today.date = "${today.date}", expected today "${expectedLong}"`);
  (today.games || []).forEach((gm, idx) => {
    const tag = `today game #${idx + 1} (${gm.home} v ${gm.away})`;
    for (const k of ['group', 'home', 'away', 'kick', 'iso', 'venue', 'tv', 'stream']) if (!gm[k]) fail(`${tag}: missing "${k}"`);
    if (!Array.isArray(gm.bullets) || gm.bullets.length < 2) fail(`${tag}: needs a "bullets" array of >=2 entries`);
    if (gm.iso) {
      if (Number.isNaN(+new Date(gm.iso))) fail(`${tag}: iso "${gm.iso}" is not a valid date`);
      else if (gm.iso.slice(0, 10) !== targetYMD) fail(`${tag}: iso date ${gm.iso.slice(0, 10)} is not today (${targetYMD}) - stale fixture`);
    }
    if (gm.group) {
      const g = byId[gm.group];
      if (!g) fail(`${tag}: group ${gm.group} is not one of WC.groups`);
      else for (const side of [gm.home, gm.away]) if (!(g.rows || []).some((r) => r.team === side)) fail(`${tag}: ${side} is not in Group ${gm.group}`);
    }
  });
}

/* ---------- report ---------- */
console.log(`World Cup data validation - target date ${targetYMD} (${expectedLong})`);
console.log(`  WC.meta.updated: ${WC && WC.meta ? WC.meta.updated : '?'}`);
console.log(`  WC.today.date:   ${WC && WC.today ? WC.today.date : '?'}`);
console.log('');
if (warnings.length) { console.log(`WARNINGS (${warnings.length}):`); for (const w of warnings) console.log('  [WARN] ' + w); console.log(''); }
if (errors.length) {
  console.log(`FAILED - ${errors.length} problem(s) must be fixed before committing:`);
  for (const e of errors) console.log('  [FAIL] ' + e);
  process.exit(1);
}
console.log('ALL CHECKS PASSED');
process.exit(0);
