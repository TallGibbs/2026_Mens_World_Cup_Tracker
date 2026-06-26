#!/usr/bin/env node
/*
 * scripts/snapshot.mjs - write frozen, self-contained dated snapshots of the
 * tracker and (once it exists) the bracket page.
 *
 * Since the single-source refactor the live pages load data.js externally, so a
 * plain copy would not be frozen (it would read whatever data.js holds later).
 * This inlines the current data.js into each snapshot, so every dated file is a
 * true point-in-time copy that renders on its own. (today.html is not snapshotted.)
 *
 * Usage: node scripts/snapshot.mjs [YYYY-MM-DD]   (defaults to today, US Eastern)
 * Writes snapshots/world_cup_tracker_YYYY-MM-DD.html and, when bracket.html is
 * present, snapshots/world_cup_bracket_YYYY-MM-DD.html.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TZ = 'America/New_York';
const argDate = process.argv[2];
const ymd = argDate || new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) { console.error(`Invalid date: "${ymd}" (expected YYYY-MM-DD)`); process.exit(2); }

const tag = '<script src="/data.js"></script>';
const data = readFileSync(join(root, 'data.js'), 'utf8');
mkdirSync(join(root, 'snapshots'), { recursive: true });

// Inline data.js into a page and write a self-contained dated snapshot.
function freeze(pageFile, outName) {
  const page = readFileSync(join(root, pageFile), 'utf8');
  if (!page.includes(tag)) { console.error(`${pageFile} does not reference /data.js - nothing to inline`); process.exit(1); }
  const inlined = page.replace(tag, '<script>\n' + data.replace(/<\/script>/gi, '<\\/script>') + '\n</script>');
  if (inlined.includes(tag)) { console.error(`ERROR: ${outName} still references external /data.js`); process.exit(1); }
  writeFileSync(join(root, 'snapshots', outName), inlined);
  console.log(`wrote snapshots/${outName} (self-contained, ${inlined.length} bytes)`);
}

freeze('world_cup_tracker.html', `world_cup_tracker_${ymd}.html`);

if (existsSync(join(root, 'bracket.html'))) {
  freeze('bracket.html', `world_cup_bracket_${ymd}.html`);
} else {
  console.log('bracket.html not present yet - skipping bracket snapshot');
}
