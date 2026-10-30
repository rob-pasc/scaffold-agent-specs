#!/usr/bin/env node
// Adds the fingerprints of the bundled scaffold to lib/released-fingerprints.json,
// so `update` recognizes this version as unmodified in repositories that installed it.
// Run before every release that changes scaffold/ (`npm test` fails until you do).
import fs from 'node:fs';
import { getBundledFingerprints, releasedFingerprintsFile } from '../lib/scaffold.js';

const released = fs.existsSync(releasedFingerprintsFile)
  ? JSON.parse(fs.readFileSync(releasedFingerprintsFile, 'utf8'))
  : {};
let added = 0;
for (const [rel, hash] of Object.entries(getBundledFingerprints())) {
  released[rel] ??= [];
  if (!released[rel].includes(hash)) {
    released[rel].push(hash);
    added++;
  }
}
const sorted = Object.fromEntries(Object.keys(released).sort().map((rel) => [rel, released[rel]]));
fs.writeFileSync(releasedFingerprintsFile, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Recorded ${added} new fingerprint${added === 1 ? '' : 's'}.`);
