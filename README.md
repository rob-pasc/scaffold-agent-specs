# scaffold-agent-specs

A deliberately small, dependency-free CLI for **spec-driven agentic coding**. It installs reusable Markdown instructions and templates into an existing repository, then creates numbered feature folders only after scope approval.

## Requirements

Node.js 20 or newer and npm (for installation or `npx`). The scaffolded repository itself can use **any** programming language or framework.

## Usage

From the root of any project:

```sh
npx scaffold-agent-specs init --profile opinionated
```

When the user and agent have discussed a feature and the user **explicitly accepts its scope**:

```sh
npx scaffold-agent-specs feature "User statistics page" --approved
```

This creates `docs/features/feature-001-user-statistics-page/` with these files:

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

For a complete request-to-verification walkthrough with runnable code, see the [worked example](examples/feature-workflow/README.md).

## Install profiles

Run `npx scaffold-agent-specs init` to choose interactively between **basic** (quality safeguards and existing project conventions) and **opinionated** (formal feature specs, approval gates, acceptance tracking, and milestone commits). Noninteractive installs default to basic. Select explicitly with `--profile basic` or `--profile opinionated`.

Basic installs `AGENTS.md` and the thin `CLAUDE.md` adapter. Opinionated installs the full scaffold below. Both record the selection in `.agent-specs/profile.json`; commit this file so updates preserve the profile. Older installations without this file retain opinionated behavior when their workflow or template directory exists.

Use `update --profile opinionated` or `update --profile basic` to switch. Released instructions are replaced, customized files are skipped, and `--dry-run` previews without changing the profile. Switching to basic leaves existing templates and feature documents in place; its instructions no longer require the formal workflow. Review skipped instructions when switching, since they can still describe the previous profile. `init` never switches an existing profile; use `update` instead.

The `feature` command requires the opinionated templates. Basic users can install them with `update --profile opinionated`.

## Opinionated `init` installs

```text
AGENTS.md
CLAUDE.md
.agent-specs/
  templates/
    adr/ADR.md
    conventions/CONVENTION.md
    feature/{PLAN,ACCEPTANCE_MATRIX,TASKS,DESIGN,RESEARCH,HANDOFF}.md
    project/{ARCHITECTURE,GLOSSARY,VISUAL_DESIGN}.md
docs/
  WORKFLOW.md
  adr/README.md
  features/README.md
```

No speculative feature, ADR, architecture document, glossary, visual design reference, or convention document is created. Those appear only when needed. The templates in `.agent-specs/` are yours to edit; **the `feature` command reads your repository's copy**, including your customizations, not the package's default templates.

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

Feature IDs are allocated above the **largest existing** feature ID, starting at `001`. Feature creation uses a shared lock so concurrent commands cannot allocate the same ID. If another command holds the lock, retry after it finishes. After a crash, remove `docs/features/.agent-specs-feature.lock/` only after confirming no feature command is running. Dry runs do not reserve IDs. Running `init` again adds newly missing files but never replaces existing ones. `init` refuses to write through symlinked paths under the chosen root.

## Updating an existing repository

```sh
npx scaffold-agent-specs@latest update --dry-run   # preview
npx scaffold-agent-specs@latest update
```

`update` compares each scaffold file in your repository with every released version of it. A file that still matches a released version is replaced with the current one, and a file that is missing is created. A file you have customized is skipped and reported, so you can merge the changes by hand or rerun with `--force`. Matching is exact: formatting changes also count as customizations, because whitespace and punctuation can affect meaning. Historical releases are recognized using hashes of their original contents; previously reformatted copies may need a manual merge. Feature documents in `docs/features/feature-*/` are never touched, so existing features keep the layout they were written with.

There is intentionally no `implement` command: an agent should follow `AGENTS.md` and `docs/WORKFLOW.md` and wait for a separate implementation instruction. ADRs can be created from `.agent-specs/templates/adr/ADR.md` once architectural decisions are adopted.

## Develop

To run the CLI from a clone of this repository:

```sh
npm test
node bin/scaffold-agent-specs.js --help
node bin/scaffold-agent-specs.js init --dir /path/to/your/repo --dry-run
```

Or use `npm link` to put the development command on your PATH, and `npm unlink -g scaffold-agent-specs` to remove it later.

```sh
npm test                # Built-in Node.js test runner
npm run format          # Format scaffold Markdown with Prettier
npm run fingerprints    # Record scaffold fingerprints for `update` (before each release)
npm run pack:check      # Preview npm-published file manifest
npm pack                # Produce local npm tarball for testing
```

For the release steps, see [`PUBLISHING.md`](PUBLISHING.md).

Pull requests run tests (including an actual npm tarball smoke test) and scaffold formatting checks on Node.js 20, 22, and 24. Publishing remains manual.

## License

MIT
