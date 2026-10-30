import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/scaffold-agent-specs.js', import.meta.url));
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
  assert.match(version.stdout, /0\.1\.0/);
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
