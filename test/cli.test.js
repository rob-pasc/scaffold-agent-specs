import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/scaffold-agent-specs.js', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
function tempDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'agent-specs-test-')); }
function invoke(dir, ...args) {
  return spawnSync(process.execPath, [cli, ...args, ...(args[0] === 'init' && !args.some(arg => arg.startsWith('--profile')) ? ['--profile', 'opinionated'] : [])], { cwd: dir, encoding: 'utf8' });
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
    '.agent-specs/templates/project/VISUAL_DESIGN.md',
    '.agent-specs/templates/project/TESTING.md',
    '.agent-specs/templates/project/PRODUCT.md',
    '.agent-specs/templates/project/DEPLOYMENT.md',
  ]) assert.ok(fs.existsSync(path.join(dir, file)), file);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'docs', 'features')), ['README.md']);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'docs', 'adr')), ['README.md']);
  assert.ok(!fs.existsSync(path.join(dir, 'docs', 'conventions')));
  assert.ok(!fs.existsSync(path.join(dir, 'docs', 'VISUAL_DESIGN.md')));
  assert.ok(!fs.existsSync(path.join(dir, 'docs', 'TESTING.md')));
  assert.ok(!fs.existsSync(path.join(dir, 'docs', 'PRODUCT.md')));
  assert.ok(!fs.existsSync(path.join(dir, 'docs', 'DEPLOYMENT.md')));
});

test('init is safe to rerun and preserves customized files', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const dest = path.join(dir, 'AGENTS.md');
  fs.writeFileSync(dest, '# My customized rules\n');
  const rerun = invoke(dir, 'init');
  assert.equal(rerun.status, 0);
  assert.equal(fs.readFileSync(dest, 'utf8'), '# My customized rules\n');
  assert.match(rerun.stdout, /19 skipped/);
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
  assert.deepEqual(fs.readdirSync(feature).sort(), ['ACCEPTANCE_CRITERIA.md', 'PLAN.md', 'TASKS.md']);
  const plan = fs.readFileSync(path.join(feature, 'PLAN.md'), 'utf8');
  assert.match(plan, /# Feature 001: User statistics page/);
  assert.match(plan, /feature-001-user-statistics-page/);
  assert.doesNotMatch(plan, /\[YYYY-MM-DD\]/);
  assert.match(plan, /FR-001/);
  assert.match(result.stdout, /stop before implementation/);
});

test('feature titles preserve replacement tokens and template-like text literally', async (t) => {
  const dir = setup(t);
  const { initProject, createFeature } = await import('../lib/scaffold.js');
  initProject(dir, { profile: 'opinionated', log: () => {} });
  const title = "Support $$ $& $` $' [YYYY-MM-DD] Feature NNN:";
  const { featureDir } = createFeature(dir, title, {
    approved: true, design: true, research: true, handoff: true, log: () => {},
  });
  for (const file of fs.readdirSync(featureDir)) {
    const heading = fs.readFileSync(path.join(featureDir, file), 'utf8').split('\n')[0];
    assert.ok(heading.endsWith(title), `${file}: ${heading}`);
  }
});

test('feature numbering chooses highest existing number and supports optional templates', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  fs.mkdirSync(path.join(dir, 'docs/features/feature-007-older'));
  const result = invoke(dir, 'feature', 'Billing overview', '--approved', '--design', '--research', '--handoff');
  assert.equal(result.status, 0, result.stderr);
  const feature = path.join(dir, 'docs/features/feature-008-billing-overview');
  assert.deepEqual(fs.readdirSync(feature).sort(), [
    'ACCEPTANCE_CRITERIA.md', 'DESIGN.md', 'HANDOFF.md', 'PLAN.md', 'RESEARCH.md', 'TASKS.md',
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
  const { getBundledFingerprints, fingerprint } = await import('../lib/scaffold.js');
  assert.ok(released['AGENTS.md'].includes(fingerprint(fs.readFileSync(new URL('../lib/basic-AGENTS.md', import.meta.url), 'utf8'))), 'Basic profile changed; run npm run fingerprints');
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
  assert.match(result.stdout, /1 updated, 1 created, 17 already current, 0 skipped/);
  assert.equal(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), fs.readFileSync(path.join(bundled, 'AGENTS.md'), 'utf8'));
});

test('update preserves and reports reformatted files as customized', async (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const rel = 'docs/WORKFLOW.md';
  const reformatted = fs.readFileSync(path.join(bundled, rel), 'utf8')
    .replaceAll('| --- |', '| ------ |').replaceAll('*', '_');
  fs.writeFileSync(path.join(dir, rel), reformatted);
  const result = invoke(dir, 'update');
  assert.equal(result.status, 0, result.stderr);
  // Even formatting changes require a manual merge with exact fingerprints.
  assert.match(result.stdout, /0 updated, 0 created, 18 already current, 1 skipped/);
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

 test('basic installs only instructions and remembers its profile', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init', '--profile', 'basic').status, 0);
  assert.ok(!fs.existsSync(path.join(dir, 'docs')));
  assert.ok(!fs.existsSync(path.join(dir, '.agent-specs/templates')));
  assert.equal(invoke(dir, 'update').status, 0);
  assert.ok(!fs.existsSync(path.join(dir, 'docs')));
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, '.agent-specs/profile.json'))).profile, 'basic');
  const agent = path.join(dir, 'AGENTS.md');
  fs.appendFileSync(agent, '\nCustom rule.\n');
  const switched = invoke(dir, 'update', '--profile', 'opinionated');
  assert.equal(switched.status, 0);
  assert.match(fs.readFileSync(agent, 'utf8'), /Custom rule/);
  assert.ok(fs.existsSync(path.join(dir, 'docs/WORKFLOW.md')));
 });

 test('profile switches update known instructions and dry runs preserve profile', (t) => {
  const dir = setup(t);
  invoke(dir, 'init', '--profile', 'basic');
  invoke(dir, 'update', '--profile', 'opinionated', '--dry-run');
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, '.agent-specs/profile.json'))).profile, 'basic');
  assert.equal(invoke(dir, 'update', '--profile', 'opinionated').status, 0);
  assert.match(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), /Feature workflow and approval gates/);
  assert.equal(invoke(dir, 'update', '--profile', 'basic').status, 0);
  assert.doesNotMatch(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), /Feature workflow and approval gates/);
  assert.ok(fs.existsSync(path.join(dir, 'docs/WORKFLOW.md')));
 });

 test('noninteractive init defaults to basic and invalid profiles do not write', (t) => {
  const dir = setup(t);
  assert.notEqual(invoke(dir, 'init', '--profile', 'unknown').status, 0);
  assert.deepEqual(fs.readdirSync(dir), []);
  assert.equal(spawnSync(process.execPath, [cli, 'init'], { cwd: dir, encoding: 'utf8' }).status, 0);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, '.agent-specs/profile.json'))).profile, 'basic');
 });

 test('legacy installations retain opinionated behavior', (t) => {
  const dir = setup(t);
  invoke(dir, 'init');
  fs.unlinkSync(path.join(dir, '.agent-specs/profile.json'));
  assert.equal(invoke(dir, 'update').status, 0);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, '.agent-specs/profile.json'))).profile, 'opinionated');
 });


test('fingerprints preserve meaningful punctuation and whitespace', async () => {
  const { fingerprint } = await import('../lib/scaffold.js');
  for (const [a, b] of [
    ['Use --force to overwrite.', 'Use force to overwrite.'],
    ['Read docs/feature-001/PLAN.md', 'Read docs/feature001/PLAN.md'],
    ['Read PLAN.md', 'Read P LAN.md'],
    ['Use user_id', 'Use userid'],
    ['Match *.md', 'Match .md'],
  ]) assert.notEqual(fingerprint(a), fingerprint(b));
});

test('update preserves meaningful edits to an old release, including dry runs', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const dest = path.join(dir, 'AGENTS.md');
  const old = fs.readFileSync(new URL('./fixtures/v0.1.1/AGENTS.md', import.meta.url), 'utf8');
  const customized = old.replaceAll('PLAN.md', 'P LAN.md');
  assert.notEqual(customized, old);
  fs.writeFileSync(dest, customized);
  for (const options of [['--dry-run'], []]) {
    const result = invoke(dir, 'update', ...options);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /AGENTS.md \(modified locally\)/);
    assert.equal(fs.readFileSync(dest, 'utf8'), customized);
  }
});

test('feature lock prevents allocation and is released after success', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const features = path.join(dir, 'docs/features');
  const lock = path.join(features, '.agent-specs-feature.lock');
  fs.mkdirSync(lock);
  const blocked = invoke(dir, 'feature', 'Different title', '--approved');
  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /Feature creation is locked/);
  assert.deepEqual(fs.readdirSync(features).sort(), ['.agent-specs-feature.lock', 'README.md']);
  assert.equal(invoke(dir, 'feature', 'Preview', '--dry-run').status, 0);
  assert.ok(fs.existsSync(lock), 'dry run must not remove another process lock');
  fs.rmdirSync(lock);
  assert.equal(invoke(dir, 'feature', 'Different title', '--approved').status, 0);
  assert.ok(!fs.existsSync(lock));
});

test('concurrent feature commands never allocate duplicate IDs', async (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  const results = await Promise.all(Array.from({ length: 8 }, (_, i) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, 'feature', `Concurrent ${i}`, '--approved'], { cwd: dir, stdio: 'ignore' });
    child.on('error', reject);
    child.on('close', resolve);
  })));
  const folders = fs.readdirSync(path.join(dir, 'docs/features')).filter(name => name.startsWith('feature-'));
  assert.ok(folders.length > 0);
  assert.equal(folders.length, results.filter(code => code === 0).length);
  assert.equal(new Set(folders.map(name => name.split('-')[1])).size, folders.length);
  for (const folder of folders) {
    assert.deepEqual(fs.readdirSync(path.join(dir, 'docs/features', folder)).sort(), ['ACCEPTANCE_CRITERIA.md', 'PLAN.md', 'TASKS.md']);
  }
  assert.ok(!fs.existsSync(path.join(dir, 'docs/features/.agent-specs-feature.lock')));
});

test('init rejects invalid destination types without partial writes, including previews', async (t) => {
  const { initProject } = await import('../lib/scaffold.js');
  for (const profile of ['basic', 'opinionated']) {
    for (const dryRun of [false, true]) {
      const dir = setup(t);
      fs.mkdirSync(path.join(dir, 'CLAUDE.md'));
      assert.throws(() => initProject(dir, { profile, dryRun, log: () => {} }), /Not a file/);
      assert.deepEqual(fs.readdirSync(dir), ['CLAUDE.md']);
    }
  }
  for (const dryRun of [false, true]) {
    const dir = setup(t);
    fs.writeFileSync(path.join(dir, 'docs'), 'Existing content');
    assert.throws(() => initProject(dir, { profile: 'opinionated', dryRun, log: () => {} }), /Not a directory/);
    assert.deepEqual(fs.readdirSync(dir), ['docs']);
    assert.equal(fs.readFileSync(path.join(dir, 'docs'), 'utf8'), 'Existing content');
  }
});

test('update rejects a directory where a file belongs before changing other files', (t) => {
  const dir = setup(t);
  assert.equal(invoke(dir, 'init').status, 0);
  fs.unlinkSync(path.join(dir, 'AGENTS.md'));
  fs.unlinkSync(path.join(dir, 'docs/WORKFLOW.md'));
  fs.mkdirSync(path.join(dir, 'docs/WORKFLOW.md'));
  const result = invoke(dir, 'update');
  assert.notEqual(result.status, 0);
  assert.ok(!fs.existsSync(path.join(dir, 'AGENTS.md')), 'preflight must prevent partial updates');
});

test('failed feature writes remove partial files and release the allocation lock', async (t) => {
  const dir = setup(t);
  const { initProject, createFeature } = await import('../lib/scaffold.js');
  initProject(dir, { profile: 'opinionated', log: () => {} });
  const original = fs.writeFileSync;
  try {
    fs.writeFileSync = (file, ...args) => {
      if (String(file).endsWith('feature-001-failure/TASKS.md')) {
        throw new Error('Simulated disk write failure');
      }
      return original(file, ...args);
    };
    assert.throws(() => createFeature(dir, 'Failure', { approved: true, log: () => {} }), /Simulated disk write failure/);
  } finally {
    fs.writeFileSync = original;
  }
  assert.deepEqual(fs.readdirSync(path.join(dir, 'docs/features')), ['README.md']);
  createFeature(dir, 'Recovery', { approved: true, log: () => {} });
  assert.ok(fs.existsSync(path.join(dir, 'docs/features/feature-001-recovery/TASKS.md')));
});

test('legacy acceptance templates remain usable and existing evidence survives updates', async (t) => {
  const { initProject, createFeature, updateProject } = await import('../lib/scaffold.js');
  const dir = setup(t);
  const log = () => {};
  initProject(dir, { profile: 'opinionated', log });
  const templates = path.join(dir, '.agent-specs/templates/feature');
  const current = path.join(templates, 'ACCEPTANCE_CRITERIA.md');
  const legacy = path.join(templates, 'ACCEPTANCE_MATRIX.md');
  fs.renameSync(current, legacy);
  fs.appendFileSync(legacy, '\nCustom acceptance requirement.\n');
  const legacyContent = fs.readFileSync(legacy, 'utf8');
  const preview = createFeature(dir, 'Legacy feature', { dryRun: true, log });
  assert.ok(preview.created.some(file => file.endsWith('ACCEPTANCE_MATRIX.md')));
  assert.ok(!fs.existsSync(preview.featureDir));
  const oldFeature = createFeature(dir, 'Legacy feature', { approved: true, log });
  const evidence = path.join(oldFeature.featureDir, 'ACCEPTANCE_MATRIX.md');
  assert.match(fs.readFileSync(evidence, 'utf8'), /Custom acceptance requirement/);
  fs.appendFileSync(evidence, '\nHistorical verification evidence.\n');
  const recorded = fs.readFileSync(evidence, 'utf8');
  updateProject(dir, { dryRun: true, log });
  assert.ok(!fs.existsSync(current));
  updateProject(dir, { log });
  assert.equal(fs.readFileSync(legacy, 'utf8'), legacyContent);
  assert.equal(fs.readFileSync(evidence, 'utf8'), recorded);
  assert.ok(!fs.existsSync(path.join(oldFeature.featureDir, 'ACCEPTANCE_CRITERIA.md')));
  const newFeature = createFeature(dir, 'New feature', { approved: true, log });
  assert.ok(fs.existsSync(path.join(newFeature.featureDir, 'ACCEPTANCE_CRITERIA.md')));
  assert.ok(!fs.existsSync(path.join(newFeature.featureDir, 'ACCEPTANCE_MATRIX.md')));
});

test('missing acceptance templates and unsafe legacy templates fail before feature creation', async (t) => {
  const { initProject, createFeature } = await import('../lib/scaffold.js');
  const dir = setup(t);
  const log = () => {};
  initProject(dir, { profile: 'opinionated', log });
  const templates = path.join(dir, '.agent-specs/templates/feature');
  fs.unlinkSync(path.join(templates, 'ACCEPTANCE_CRITERIA.md'));
  assert.throws(() => createFeature(dir, 'Missing', { approved: true, log }), /Feature template missing/);
  fs.symlinkSync(path.join(templates, 'PLAN.md'), path.join(templates, 'ACCEPTANCE_MATRIX.md'));
  assert.throws(() => createFeature(dir, 'Unsafe', { approved: true, log }), /symlink/);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'docs/features')), ['README.md']);
});
