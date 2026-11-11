import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('npm tarball includes hidden templates and supports init and feature creation', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-specs-package-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  function run(command, args, cwd = dir) {
    const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
    assert.equal(result.status, 0, `${command}: ${result.error ?? result.stderr}`);
    return result;
  }
  run('npm', ['pack', '--ignore-scripts', '--pack-destination', dir, '--cache', path.join(dir, 'cache')], root);
  const archives = fs.readdirSync(dir).filter(name => name.endsWith('.tgz'));
  assert.equal(archives.length, 1);
  run('tar', ['-xzf', path.join(dir, archives[0]), '-C', dir]);
  const packaged = path.join(dir, 'package');
  const templates = fs.readdirSync(path.join(root, 'scaffold/.agent-specs/templates'), { recursive: true });
  for (const template of templates) {
    const rel = path.join('scaffold/.agent-specs/templates', template);
    if (fs.statSync(path.join(root, rel)).isFile()) {
      assert.deepEqual(fs.readFileSync(path.join(packaged, rel)), fs.readFileSync(path.join(root, rel)), rel);
    }
  }
  const project = path.join(dir, 'project');
  fs.mkdirSync(project);
  const cli = path.join(packaged, 'bin/scaffold-agent-specs.js');
  run(process.execPath, [cli, 'init', '--profile', 'opinionated'], project);
  run(process.execPath, [cli, 'feature', 'Packaged example', '--approved'], project);
  assert.match(fs.readFileSync(path.join(project, 'docs/features/feature-001-packaged-example/PLAN.md'), 'utf8'), /Feature 001: Packaged example/);
});
