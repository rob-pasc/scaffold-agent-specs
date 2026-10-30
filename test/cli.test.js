import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/scaffold-agent-specs.js', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
function tempDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'agent-specs-test-')); }
function invoke(dir, ...args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: dir, encoding: 'utf8' });
}
function setup(t) {
  const dir = tempDir();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

// Test the actual binary, not just exported functions.
test('help and version are available', (t) => {
  const dir = setup(t);
  const help = invoke(dir, '--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /feature.*--approved/);
  const version = invoke(dir, '--version');
  assert.equal(version.status, 0);
  assert.equal(version.stdout.trim(), pkg.version);
});

test('init creates all baseline files and no speculative feature or ADR', (t) => {
  const dir = setup(t);
  const run = invoke(dir, 'init');
  assert.equal(run.status, 0, run.stderr);
  for (const file of [
    'AGENTS.md', 'CLAUDE.md', 'docs/WORKFLOW.md',
    'docs/adr/README.md', 'docs/features/README.md',
    '.agent-specs/templates/adr/ADR.md',
    '.agent-specs/templates/feature/PLAN.md',
    '.agent-specs/templates/feature/DESIGN.md',
    '.agent-specs/templates/feature/RESEARCH.md',
    '.agent-specs/templates/project/ARCHITECTURE.md',
    '.agent-specs/templates/project/GLOSSARY.md',
  ]) assert.ok(fs.existsSync(path.join(dir, file)), file);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'docs', 'features')), ['README.md']);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'docs', 'adr')), ['README.md']);
  assert.ok(!fs.existsSync(path.join(dir, 'docs', 'conventions')));
});

test('init is safe to rerun and preserves customized files', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const dest = path.join(dir, 'AGENTS.md');
  fs.writeFileSync(dest, '# My customized rules\n');
  const rerun = invoke(dir, 'init');
  assert.equal(rerun.status, 0);
  assert.equal(fs.readFileSync(dest, 'utf8'), '# My customized rules\n');
  assert.match(rerun.stdout, /15 skipped/);
});

test('init --dry-run creates nothing', (t) => {
  const dir = setup(t);
  const result = invoke(dir, 'init', '--dry-run');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /would create AGENTS.md/);
  assert.deepEqual(fs.readdirSync(dir), []);
});

test('feature requires approval and preserves clean state when refused', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const result = invoke(dir, 'feature', 'User statistics page');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /approved/);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'docs', 'features')), ['README.md']);
});

test('feature creates numbered docs, substitutes titles/IDs/dates, and leaves optional docs out', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const result = invoke(dir, 'feature', 'User statistics page', '--approved');
  assert.equal(result.status, 0, result.stderr);
  const feature = path.join(dir, 'docs/features/feature-001-user-statistics-page');
  assert.deepEqual(fs.readdirSync(feature).sort(), ['ACCEPTANCE_MATRIX.md', 'PLAN.md', 'TASKS.md']);
  const plan = fs.readFileSync(path.join(feature, 'PLAN.md'), 'utf8');
  assert.match(plan, /# Feature 001: User statistics page/);
  assert.match(plan, /feature-001-user-statistics-page/);
  assert.doesNotMatch(plan, /\[YYYY-MM-DD\]/);
  assert.match(plan, /FR-001/);
  assert.match(result.stdout, /stop before implementation/);
});

test('feature numbering chooses highest existing number and supports optional templates', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  fs.mkdirSync(path.join(dir, 'docs/features/feature-007-older'));
  const result = invoke(dir, 'feature', 'Billing overview', '--approved', '--design', '--research', '--handoff');
  assert.equal(result.status, 0, result.stderr);
  const feature = path.join(dir, 'docs/features/feature-008-billing-overview');
  assert.deepEqual(fs.readdirSync(feature).sort(), [
    'ACCEPTANCE_MATRIX.md', 'DESIGN.md', 'HANDOFF.md', 'PLAN.md', 'RESEARCH.md', 'TASKS.md',
  ]);
});

test('feature reads customized templates from the target repo', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const template = path.join(dir, '.agent-specs/templates/feature/TASKS.md');
  fs.appendFileSync(template, '\nMy task footer: [Feature title]\n');
  assert.equal(invoke(dir, 'feature', 'Audit log', '--approved').status, 0);
  const tasks = fs.readFileSync(path.join(dir, 'docs/features/feature-001-audit-log/TASKS.md'), 'utf8');
  assert.match(tasks, /My task footer: Audit log/);
});

test('feature dry-run does not need approval or create files', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const result = invoke(dir, 'feature', 'User statistics page', '--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /would create docs\/features\/feature-001-user-statistics-page\/PLAN.md/);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'docs', 'features')), ['README.md']);
});

test('missing template prevents partial feature creation', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  fs.rmSync(path.join(dir, '.agent-specs/templates/feature/TASKS.md'));
  const result = invoke(dir, 'feature', 'Thing', '--approved');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /template missing/);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'docs', 'features')), ['README.md']);
});

test('init refuses to write through symlinked docs directory', (t) => {
  const dir = setup(t);
  const outside = setup(t);
  fs.symlinkSync(outside, path.join(dir, 'docs'), 'dir');
  const result = invoke(dir, 'init');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /symlink/);
  assert.deepEqual(fs.readdirSync(outside), []);
});

test('invalid arguments are rejected without modifying the directory', (t) => {
  const dir = setup(t);
  const result = invoke(dir, 'init', '--force');
  assert.notEqual(result.status, 0);
  assert.deepEqual(fs.readdirSync(dir), []);
});

const bundled = fileURLToPath(new URL('../scaffold/', import.meta.url));
const released = JSON.parse(fs.readFileSync(new URL('../lib/released-fingerprints.json', import.meta.url), 'utf8'));
test('every bundled scaffold file is recorded in released-fingerprints.json', async () => {
  const { getBundledFingerprints } = await import('../lib/scaffold.js');
  for (const [rel, hash] of Object.entries(getBundledFingerprints())) {
    assert.ok(released[rel]?.includes(hash), `${rel} changed; run node scripts/record-fingerprints.js`);
  }
});

test('update replaces files from an older release and creates missing ones', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  fs.copyFileSync(new URL('./fixtures/v0.1.1/AGENTS.md', import.meta.url), path.join(dir, 'AGENTS.md'));
  fs.rmSync(path.join(dir, 'docs/WORKFLOW.md'));

  const result = invoke(dir, 'update');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /update AGENTS.md/);
  assert.match(result.stdout, /create docs\/WORKFLOW.md/);
  assert.match(result.stdout, /1 updated, 1 created, 13 already current, 0 skipped/);
  assert.equal(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), fs.readFileSync(path.join(bundled, 'AGENTS.md'), 'utf8'));
});

test('update treats a reformatted released file as unmodified', async (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const rel = 'docs/WORKFLOW.md';
  const reformatted = fs.readFileSync(path.join(bundled, rel), 'utf8')
    .replaceAll('| --- |', '| ------ |').replaceAll('*', '_');
  fs.writeFileSync(path.join(dir, rel), reformatted);
  const result = invoke(dir, 'update');
  assert.equal(result.status, 0, result.stderr);
  // Same content apart from formatting: left alone, not counted as modified.
  assert.match(result.stdout, /0 updated, 0 created, 15 already current, 0 skipped/);
  assert.equal(fs.readFileSync(path.join(dir, rel), 'utf8'), reformatted);
});

test('update skips locally modified files unless --force', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const dest = path.join(dir, 'AGENTS.md');
  fs.appendFileSync(dest, '\n## Our team rules\n');
  const customized = fs.readFileSync(dest, 'utf8');

  const skipped = invoke(dir, 'update');
  assert.equal(skipped.status, 0, skipped.stderr);
  assert.match(skipped.stdout, /skip {3}AGENTS.md \(modified locally\)/);
  assert.match(skipped.stdout, /--force/);
  assert.equal(fs.readFileSync(dest, 'utf8'), customized);

  const forced = invoke(dir, 'update', '--force');
  assert.equal(forced.status, 0, forced.stderr);
  assert.match(forced.stdout, /overwrite AGENTS.md \(local changes discarded\)/);
  assert.equal(fs.readFileSync(dest, 'utf8'), fs.readFileSync(path.join(bundled, 'AGENTS.md'), 'utf8'));
});

test('update --dry-run writes nothing and leaves feature docs alone', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  assert.equal(invoke(dir, 'feature', 'Thing', '--approved').status, 0);
  fs.rmSync(path.join(dir, 'CLAUDE.md'));
  const result = invoke(dir, 'update', '--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /would create CLAUDE.md/);
  assert.ok(!fs.existsSync(path.join(dir, 'CLAUDE.md')));
  assert.doesNotMatch(result.stdout, /feature-001/);
});
