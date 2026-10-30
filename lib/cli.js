import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initProject, createFeature } from './scaffold.js';

const help = `scaffold-agent-specs: spec-driven scaffolding for coding agents

Usage:
  scaffold-agent-specs init [--dir PATH] [--dry-run]
  scaffold-agent-specs feature "Feature title" --approved [options]
  scaffold-agent-specs --version
  scaffold-agent-specs --help

Options for feature:
  --approved    Confirm the user explicitly approved the feature's scope
  --design      Include optional DESIGN.md
  --research    Include optional RESEARCH.md
  --handoff     Include optional HANDOFF.md
  --dry-run     Preview without writing; approval not required for a preview
  --dir PATH    Target repository root (default: current directory)

The CLI copies templates, but does not generate a specification or implement code.
Your agent must fill the documents from the approved discussion and stop before implementation.
Existing files are never overwritten by init.
`;

export function run(args) {
  if (!args.length || args.includes('--help') || args.includes('-h') || args[0] === 'help') {
    console.log(help);
    return;
  }
  if (args.length === 1 && (args[0] === '--version' || args[0] === '-v')) {
    const pkg = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'));
    console.log(pkg.version);
    return;
  }
  const [command, ...rest] = args;
  if (!['init', 'feature'].includes(command)) throw new Error(`Unknown command: ${command}. Try --help.`);

  const flags = new Set();
  const positionals = [];
  let dir = process.cwd();
  const allowed = command === 'init' ? new Set(['--dry-run']) : new Set(['--dry-run', '--approved', '--design', '--research', '--handoff']);

  for (let i = 0; i < rest.length; i++) {
    const argument = rest[i];
    if (argument === '--dir') {
      if (i + 1 >= rest.length || rest[i + 1].startsWith('--')) throw new Error('Missing path after --dir.');
      dir = rest[++i];
    } else if (argument.startsWith('--dir=')) {
      dir = argument.slice('--dir='.length);
      if (!dir) throw new Error('Missing path after --dir=.');
    } else if (allowed.has(argument)) {
      flags.add(argument);
    } else if (argument.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      positionals.push(argument);
    }
  }
  if (command === 'init') {
    if (positionals.length) throw new Error('init takes no positional arguments.');
    initProject(dir, { dryRun: flags.has('--dry-run') });
    return;
  }
  if (!positionals.length) throw new Error('Missing feature title. Try `feature "User statistics page" --approved`.');
  createFeature(dir, positionals.join(' '), {
    approved: flags.has('--approved'),
    design: flags.has('--design'),
    research: flags.has('--research'),
    handoff: flags.has('--handoff'),
    dryRun: flags.has('--dry-run'),
  });
}
