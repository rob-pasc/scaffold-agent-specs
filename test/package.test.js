import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

for (const name of ['scaffold-agent-specs', 'scaffold-agent-workflow']) {
  test(`${name} tarball includes templates and supports its CLI`, (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-specs-package-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    const windows = process.platform === 'win32';
    function run(command, args, cwd = dir) {
      // npm is a .cmd shim on Windows, which Node only runs through a shell.
      const result = spawnSync(command, args, { cwd, encoding: 'utf8', shell: windows && command === 'npm' });
      assert.equal(result.status, 0, `${command}: ${result.error ?? result.stderr}`);
      return result;
    }
    run(process.execPath, [path.join(root, 'scripts/release.js'), 'pack', name]);
    const archives = fs.readdirSync(dir).filter(name => name.endsWith('.tgz'));
    assert.equal(archives.length, 1);
    // Use Windows' own bsdtar: a GNU tar earlier on PATH reads "C:" as a remote host.
    const tar = windows ? path.join(process.env.SystemRoot, 'System32', 'tar.exe') : 'tar';
    run(tar, ['-xzf', path.join(dir, archives[0]), '-C', dir]);
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
    const manifest = JSON.parse(fs.readFileSync(path.join(packaged, 'package.json'), 'utf8'));
    assert.equal(manifest.name, name);
    assert.equal(manifest.version, JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version);
    assert.deepEqual(Object.keys(manifest.bin), [name]);
    const cli = path.join(packaged, manifest.bin[name]);
    assert.match(run(process.execPath, [cli, '--help']).stdout, new RegExp(`${name} init`));
    assert.equal(run(process.execPath, [cli, '--version']).stdout.trim(), manifest.version);
    run(process.execPath, [cli, 'init', ...(name === 'scaffold-agent-workflow' ? [] : ['--profile', 'opinionated'])], project);
    run(process.execPath, [cli, 'feature', 'Packaged example', '--approved'], project);
    assert.match(fs.readFileSync(path.join(project, 'docs/features/feature-001-packaged-example/PLAN.md'), 'utf8'), /Feature 001: Packaged example/);
    const basic = path.join(dir, 'basic');
    fs.mkdirSync(basic);
    run(process.execPath, [cli, 'init', '--profile', 'basic'], basic);
    run(process.execPath, [cli, 'init'], basic);
    run(process.execPath, [cli, 'update'], basic);
    assert.equal(JSON.parse(fs.readFileSync(path.join(basic, '.agent-specs/profile.json'), 'utf8')).profile, 'basic');
    assert.equal(fs.existsSync(path.join(basic, 'docs')), false);
  });
}
