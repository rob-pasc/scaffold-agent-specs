import fs from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { initProject, createFeature, updateProject, projectProfile } from './scaffold.js';

const help = `scaffold-agent-specs: spec-driven scaffolding for coding agents

Usage:
  scaffold-agent-specs init [--profile basic|opinionated] [--dir PATH] [--dry-run]
  scaffold-agent-specs update [--profile basic|opinionated] [--dir PATH] [--dry-run] [--force]
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

Profiles: init prompts in a terminal; otherwise defaults to basic.
Existing installations keep their profile. update --profile switches explicitly.

Options for update:
  --dry-run     Preview without writing
  --force       Also overwrite files that were modified locally
  --dir PATH    Target repository root (default: current directory)

The CLI copies templates, but does not generate a specification or implement code.
Your agent must fill the documents from the approved discussion and stop before implementation.
Existing files are never overwritten by init. update replaces only files that
still match a released version; locally modified files are skipped unless --force.
Feature documents in docs/features/feature-*/ are never touched.
`;

export async function run(args) {
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
  if (!['init', 'update', 'feature'].includes(command)) throw new Error(`Unknown command: ${command}. Try --help.`);

  const flags = new Set();
  const positionals = [];
  let dir = process.cwd();
  let profile;
  const allowed = new Set({
    init: ['--dry-run'],
    update: ['--dry-run', '--force'],
    feature: ['--dry-run', '--approved', '--design', '--research', '--handoff'],
  }[command]);

  for (let i = 0; i < rest.length; i++) {
    const argument = rest[i];
    if (argument === '--profile' || argument.startsWith('--profile=')) {
      if (command === 'feature') throw new Error('--profile is only supported by init and update.');
      profile = argument === '--profile' ? rest[++i] : argument.slice(10);
      if (!['basic', 'opinionated'].includes(profile)) throw new Error('Profile must be basic or opinionated.');
    } else if (argument === '--dir') {
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
    if (!profile && !projectProfile(dir) && process.stdin.isTTY && process.stdout.isTTY) {
      const prompt = createInterface({ input: process.stdin, output: process.stdout });
      try {
        const answer = (await prompt.question('Profile: basic (quality safeguards) or opinionated (formal specs, approval gates, milestone commits) [basic]: ')).trim();
        profile = answer || 'basic';
        if (!['basic', 'opinionated'].includes(profile)) throw new Error('Profile must be basic or opinionated.');
      } finally { prompt.close(); }
    }
    initProject(dir, { profile, dryRun: flags.has('--dry-run') });
    return;
  }
  if (command === 'update') {
    if (positionals.length) throw new Error('update takes no positional arguments.');
    updateProject(dir, { profile, dryRun: flags.has('--dry-run'), force: flags.has('--force') });
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
