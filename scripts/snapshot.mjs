#!/usr/bin/env node
/*
 * scripts/snapshot.mjs - write a frozen, self-contained dated snapshot of the
 * tracker.
 *
 * Since the single-source refactor the live tracker loads data.js externally, so
 * a plain copy would not be frozen (it would read whatever data.js holds later).
 * This inlines the current data.js into the snapshot, so each dated file is a
 * true point-in-time copy that renders on its own.
 *
 * Usage: node scripts/snapshot.mjs [YYYY-MM-DD]   (defaults to today, US Eastern)
 * Writes snapshots/world_cup_tracker_YYYY-MM-DD.html.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TZ = 'America/New_York';
const argDate = process.argv[2];
const ymd = argDate || new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) { console.error(`Invalid date: "${ymd}" (expected YYYY-MM-DD)`); process.exit(2); }

const tag = '<script src="/data.js"></script>';
const tracker = readFileSync(join(root, 'world_cup_tracker.html'), 'utf8');
const data = readFileSync(join(root, 'data.js'), 'utf8');
if (!tracker.includes(tag)) { console.error('world_cup_tracker.html does not reference /data.js - nothing to inline'); process.exit(1); }

const inlined = tracker.replace(tag, '<script>\n' + data.replace(/<\/script>/gi, '<\\/script>') + '\n</script>');
if (inlined.includes(tag)) { console.error('ERROR: snapshot still references external /data.js'); process.exit(1); }

mkdirSync(join(root, 'snapshots'), { recursive: true });
const out = join(root, 'snapshots', `world_cup_tracker_${ymd}.html`);
writeFileSync(out, inlined);
console.log(`wrote snapshots/world_cup_tracker_${ymd}.html (self-contained, ${inlined.length} bytes)`);
