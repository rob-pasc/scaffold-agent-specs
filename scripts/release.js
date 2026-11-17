import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const names = ['scaffold-agent-specs', 'scaffold-agent-workflow'];
const [command, ...args] = process.argv.slice(2);
if (!['pack', 'publish'].includes(command) || args.some(arg => arg !== '--dry-run' && !names.includes(arg))) {
  throw new Error('Usage: node scripts/release.js pack|publish [--dry-run] [scaffold-agent-specs|scaffold-agent-workflow]');
}
const selected = args.filter(arg => names.includes(arg));
if (selected.length > 1) throw new Error('Select at most one package name. Omit it to release both.');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-specs-release-'));
try {
  for (const name of selected.length ? selected : names) {
    const stage = path.join(temp, name);
    fs.mkdirSync(stage);
    for (const entry of new Set([...manifest.files, 'LICENSE'])) {
      fs.cpSync(path.join(root, entry), path.join(stage, entry), { recursive: true });
    }
    const pkg = { ...manifest, name, bin: { [name]: 'bin/scaffold-agent-specs.js' } };
    delete pkg.scripts;
    fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
    console.log(`${command}: ${name}@${pkg.version}`);
    const npmArgs = [command, '--ignore-scripts', ...(args.includes('--dry-run') ? ['--dry-run'] : [])];
    if (command === 'pack') npmArgs.push('--pack-destination', process.cwd());
    else npmArgs.push('--access', 'public');
    // npm's Windows .cmd shim requires a shell.
    const npmCli = process.env.npm_execpath;
    const result = spawnSync(npmCli ? process.execPath : 'npm', npmCli ? [npmCli, ...npmArgs] : npmArgs, {
      cwd: stage, stdio: 'inherit', shell: !npmCli && process.platform === 'win32',
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`${command} failed for ${name}@${pkg.version}. After fixing the cause, retry only this package by appending ${name}.`);
    }
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
