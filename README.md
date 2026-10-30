# scaffold-agent-specs

A deliberately small, dependency-free CLI for **spec-driven agentic coding**. It installs reusable Markdown instructions and templates into an existing repository, then creates numbered feature folders only after scope approval.

## Requirements

Node.js 20 or newer and npm (for installation or `npx`). The scaffolded repository itself can use **any** programming language or framework.

## Use locally before publishing

Download and extract this project, then run:

```sh
cd scaffold-agent-specs
npm test
node bin/scaffold-agent-specs.js --help

# Preview what will be created in any repo:
node bin/scaffold-agent-specs.js init --dir /path/to/your/repo --dry-run

# Actually initialize the repo:
node bin/scaffold-agent-specs.js init --dir /path/to/your/repo
```

Or use `npm link` from this package directory to install the development command into your PATH:

```sh
npm link
cd /path/to/your/repo
scaffold-agent-specs init
```

Unlink later with `npm unlink -g scaffold-agent-specs`.

## After publishing to npm

From the root of any project:

```sh
npx scaffold-agent-specs init
```

When the user and agent have discussed a feature and the user **explicitly accepts its scope**:

```sh
npx scaffold-agent-specs feature "User statistics page" --approved
```

This would create `docs/features/feature-001-user-statistics-page/` with these files:

- `PLAN.md` for the approved scope, constraints, requirements and proposed approach.
- `ACCEPTANCE_MATRIX.md` for objective acceptance criteria and verification evidence.
- `TASKS.md` for the implementation checklist.

Optional files can be requested explicitly:

```sh
npx scaffold-agent-specs feature "Account dashboard" --approved --design --research
```

`--handoff` additionally creates the optional short-lived `HANDOFF.md`.

**Important:** The CLI copies and personalizes headings, IDs, titles, and dates. It **does not invent a feature spec**. Your coding agent must populate the remaining placeholders from the approved conversation, then **stop** until you separately authorize implementation. The `--approved` flag is an acknowledgment; the CLI cannot verify the conversation itself.

The `feature` command is a convenience for people. Agents are told to create feature directories by copying the templates themselves, following the steps in `docs/WORKFLOW.md`, so they don't depend on the CLI being installed or reachable from a sandbox.

## `init` installs

```text
AGENTS.md
CLAUDE.md
.agent-specs/
  templates/
    adr/ADR.md
    conventions/CONVENTION.md
    feature/{PLAN,ACCEPTANCE_MATRIX,TASKS,DESIGN,RESEARCH,HANDOFF}.md
    project/{ARCHITECTURE,GLOSSARY}.md
docs/
  WORKFLOW.md
  adr/README.md
  features/README.md
```

No speculative feature, ADR, architecture document, glossary, or convention document is created. Those appear only when needed. The templates in `.agent-specs/` are yours to edit; **the `feature` command reads your repository's copy**, including your customizations, not the package's default templates.

## Commands and safety

| Command | Behavior |
| --- | --- |
| `init` | Copy the initial scaffold into the current directory. Never overwrite existing files. |
| `init --dry-run` | Preview which files would be created or skipped. |
| `update` | Bring scaffold files up to this version. Replace only files that are unmodified; skip customized ones. |
| `update --dry-run` | Preview which files would be updated, created, or skipped. |
| `update --force` | Also overwrite customized scaffold files, discarding local changes. |
| `feature "Title" --approved` | Create the next `feature-NNN-title/` and its three required docs. |
| `feature "Title" --approved --design` | Include optional detailed design. |
| `feature "Title" --approved --research` | Include optional research. |
| `feature "Title" --approved --handoff` | Include optional handoff. |
| `feature "Title" --dry-run` | Preview feature creation without confirming approval or writing files. |
| `--dir PATH` | Work in a specified repository root instead of the current directory. |
| `--help` / `--version` | Show help or the CLI version. |

Feature IDs are allocated above the **largest existing** feature ID, starting at `001`. Running `init` again adds newly missing files but never replaces existing ones. `init` refuses to write through symlinked paths under the chosen root.

## Updating an existing repository

```sh
npx scaffold-agent-specs@latest update --dry-run   # preview
npx scaffold-agent-specs@latest update
```

`update` compares each scaffold file in your repository with every released version of it. A file that still matches a released version is replaced with the current one, and a file that is missing is created. A file you have customized is skipped and reported, so you can merge the changes by hand or rerun with `--force`. Formatting-only differences (for example, Prettier padding tables) don't count as customizations. Feature documents in `docs/features/feature-*/` are never touched, so existing features keep the layout they were written with.

There is intentionally no `implement` command: an agent should follow `AGENTS.md` and `docs/WORKFLOW.md` and wait for a separate implementation instruction. ADRs can be created from `.agent-specs/templates/adr/ADR.md` once architectural decisions are adopted.

## Develop

```sh
npm test                # Built-in Node.js test runner
npm run format          # Format scaffold Markdown with Prettier
npm run fingerprints    # Record scaffold fingerprints for `update` (before each release)
npm run pack:check      # Preview npm-published file manifest
npm pack                # Produce local npm tarball for testing
```

For publication instructions, see [`PUBLISHING.md`](PUBLISHING.md).

## License

MIT
