# scaffold-agent-specs

A deliberately small, dependency-free CLI that installs Markdown instructions and templates for AI coding agents into an existing repository. The **basic** profile adds shared quality safeguards. The **opinionated** profile adds a spec-driven feature workflow: approval gates, numbered feature folders with plans, acceptance criteria and tasks, and review and completion checks. `update` refreshes the installed files without overwriting your customizations.

The same CLI is also distributed as `scaffold-agent-workflow`, with matching versions and no additional dependencies:

```sh
npx scaffold-agent-workflow init
```

`scaffold-agent-workflow init` defaults to the opinionated profile; pass `--profile basic` to opt out. Existing installations retain their selected profile.

Use either name; both manage the same files and existing installations. This README uses `scaffold-agent-specs` as the default.

## Requirements

Node.js 22 or newer and npm (for installation or `npx`). The scaffolded repository itself can use **any** programming language or framework.

## Tested agents and models

The workflow has been tested on real projects with current models from OpenAI (GPT, through ChatGPT's Codex), Anthropic (Claude) and DeepSeek. The installed instructions are plain Markdown, so any coding agent that reads `AGENTS.md` or `CLAUDE.md` can follow them.

A moderate reasoning effort (for example *medium*) works especially well. At low effort, agents follow the approval gates but tend to write thin plans, acceptance criteria and task lists.

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
- `ACCEPTANCE_CRITERIA.md` for objective acceptance criteria and verification evidence.
- `TASKS.md` for the implementation checklist.

Optional files can be requested explicitly:

```sh
npx scaffold-agent-specs feature "Account dashboard" --approved --design --research
```

`--handoff` additionally creates the optional short-lived `HANDOFF.md`.

**Important:** The CLI copies and personalizes headings, IDs, titles, and dates. It **does not invent a feature spec**. Your coding agent must populate the remaining placeholders from the approved conversation, then **stop** until you separately authorize implementation. The `--approved` flag is an acknowledgment; the CLI cannot verify the conversation itself.

Agents use the `feature` command when available. When it is unavailable, they copy the local templates by hand, following `docs/workflow/ALLOCATION.md`; no network install is required. Separate branches and worktrees choose numbers independently, and agents check for duplicate numbers before committing and before integration; the incoming feature takes the next free number.

For a complete request-to-verification walkthrough with runnable code, see the [worked example](examples/feature-workflow/README.md).

## Install profiles

Run `npx scaffold-agent-specs init` to choose interactively between **basic** (quality safeguards and existing project conventions) and **opinionated** (formal feature specs, approval gates, acceptance tracking, and milestone commits). `scaffold-agent-specs` noninteractive installs default to basic; `scaffold-agent-workflow init` defaults to opinionated in both interactive and noninteractive use. Select explicitly with `--profile basic` or `--profile opinionated`.

Basic installs `AGENTS.md` and the thin `CLAUDE.md` adapter, which imports `AGENTS.md` with Claude Code's `@AGENTS.md` syntax so the shared instructions load automatically. Opinionated installs the full scaffold below. Both record the selection in `.agent-specs/profile.json`; commit this file so updates preserve the profile. Older installations without this file retain opinionated behavior when their `.agent-specs/templates/` directory or the scaffold's own `docs/WORKFLOW.md` exists; an unrelated `docs/WORKFLOW.md` is not treated as an installation.

Use `update --profile opinionated` or `update --profile basic` to switch. Released instructions are replaced, customized files are skipped, and `--dry-run` previews without changing the profile. Switching to basic leaves existing templates and feature documents in place; its instructions no longer require the formal workflow. Review skipped instructions when switching, since they can still describe the previous profile. `init` never switches an existing profile; use `update` instead.

The `feature` command requires the opinionated templates. Basic users can install them with `update --profile opinionated`.

### Integrating existing instructions

`init` and `update` report instruction integration separately from file installation. If preserved `AGENTS.md`, `CLAUDE.md`, or (for opinionated installs) `docs/WORKFLOW.md` or its `docs/workflow/` procedures differs from the selected profile's bundled instructions, the command reports **review required** and gives file-specific merge guidance. This includes existing instruction files skipped by `init` and customized instructions retained during profile switches. The profile marker records installation intent; it does not establish which rules an agent actually follows.

Preserve project-specific rules while merging the selected profile's instructions from the source paths printed by the CLI. For opinionated installs, ensure `AGENTS.md` directs agents to read and follow `docs/WORKFLOW.md`, and reconcile conflicting approval and commit rules. In `CLAUDE.md`, retain or add the shared `@AGENTS.md` import. When switching to basic, remove or reconcile old mandatory feature gates if you no longer want them. Review any preserved workflow document against the bundled procedure as well.

The check is conservative: custom instructions require review even if they contain the expected links. Matching files (ignoring CRLF line endings) establish only that the bundled instructions are present, not that an agent loads or obeys them. Confirm loading through your agent's instruction entry point. `--dry-run` reports the expected integration outcome without changing files; review notices do not change the command's successful exit status or overwrite local instructions.

## Opinionated `init` installs

```text
AGENTS.md
CLAUDE.md
.agent-specs/
  templates/
    adr/ADR.md
    conventions/CONVENTION.md
    feature/{PLAN,ACCEPTANCE_CRITERIA,TASKS,DESIGN,RESEARCH,HANDOFF}.md
    project/{ARCHITECTURE,GLOSSARY,VISUAL_DESIGN,TESTING,PRODUCT,DEPLOYMENT}.md
docs/
  WORKFLOW.md
  workflow/{ALLOCATION,CHANGE_HISTORY,PROJECT_DOCS}.md
  adr/README.md
  features/README.md
```

No speculative feature, ADR, architecture document, glossary, visual design reference, testing guide, product context, deployment guide, or convention document is created. Those appear only when needed. The templates in `.agent-specs/` are yours to edit; **the `feature` command reads your repository's copy**, including your customizations, not the package's default templates.

The workflow's [optional project document catalog](scaffold/docs/workflow/PROJECT_DOCS.md) lists creation triggers and ownership for architecture, glossary, visual design, testing, product context, deployment, conventions, and ADRs. Agents reuse adequate existing documentation and proactively create concise missing references when the catalog triggers fit authorized work. `AGENTS.md` links to this catalog instead of maintaining a separate list.

For applicable features, release and recovery considerations live in `PLAN.md`, required checks and evidence in `ACCEPTANCE_CRITERIA.md`, and release tasks in `TASKS.md`. Optional `docs/DEPLOYMENT.md` holds reusable rollout, migration, post-release verification, and recovery procedures when an existing publishing guide or runbook does not suffice. Implementation completion does not imply publication or deployment; required live checks must have evidence before the feature is marked complete.

## Review and completion

Opinionated features record their completion boundary and required review/integration checks in `PLAN.md`. Existing repository policy and user instructions determine whether completion means a locally verified handoff, reviewed change, merged change, or released behavior. The default is locally verified handoff with self-review; the workflow does not automatically require a PR or another reviewer.

Agents review the final diff against scope, record findings and resolutions in `ACCEPTANCE_CRITERIA.md`, and keep required review and integration tasks open until evidenced. Blocking findings or unavailable required reviewers prevent completion unless an allowed exception is explicitly accepted. Changes after review require affected checks and review to be reassessed. Local test results do not establish merge or release success, and a completion checklist does not authorize pushing or merging.

## Commands and safety

| Command | Behavior |
| --- | --- |
| `init` | Copy the initial scaffold into the current directory. Never overwrite existing files. |
| `init --dry-run` | Preview which files would be created or skipped. |
| `update` | Bring scaffold files up to this version. Replace only files that are unmodified; skip customized ones. Requires an existing installation, or an explicit `--profile`. |
| `update --dry-run` | Preview which files would be updated, created, or skipped. |
| `update --force` | Also overwrite customized scaffold files, discarding local changes. |
| `feature "Title" --approved` | Create the next `feature-NNN-title/` and its three required docs. |
| `feature "Title" --approved --design` | Include optional detailed design. |
| `feature "Title" --approved --research` | Include optional research. |
| `feature "Title" --approved --handoff` | Include optional handoff. |
| `feature "Title" --dry-run` | Preview feature creation without confirming approval or writing files. |
| `--dir PATH` | Work in a specified repository root instead of the current directory. |
| `--help` / `--version` | Show help or the CLI version. |

Feature directory slugs keep letters and digits from any script (`Статистика` becomes `статистика`); accents are removed from Latin letters only, and whitespace in a title, including line breaks, collapses to single spaces. Feature IDs are allocated above the **largest existing** feature ID, starting at `001`. Concurrent `feature` commands in one checkout serialize on a short-lived lock, so they cannot allocate the same ID. If another command holds the lock, retry after it finishes. After a crash, remove `docs/features/.agent-specs-feature.lock/` only after confirming no `feature` command is still running. Dry runs do not reserve IDs. Running `init` again adds newly missing files but never replaces existing ones. `init` refuses to write through symlinked paths under the chosen root.

## Updating an existing repository

```sh
npx scaffold-agent-specs@latest update --dry-run   # preview
npx scaffold-agent-specs@latest update
```

`update` compares each scaffold file in your repository with every released version of it. A file that still matches a released version is replaced with the current one, and a file that is missing is created. A file you have customized is skipped and reported, so you can merge the changes by hand or rerun with `--force`. Matching is exact: formatting changes also count as customizations, because whitespace and punctuation can affect meaning. Line endings are the one exception: a CRLF checkout (common with Git on Windows) still matches, and updated files keep the line endings they had. Historical releases are recognized using hashes of their original contents; previously reformatted copies may need a manual merge. Feature documents in `docs/features/feature-*/` are never touched, so existing features keep the layout they were written with.

**Breaking change:** `ACCEPTANCE_CRITERIA.md` replaces `ACCEPTANCE_MATRIX.md`; the old filename is no longer supported. `update` does not migrate renamed files or links. For existing installations, manually rename the acceptance template and feature documents, update their references, and merge the current scaffold instructions while preserving customizations and verification evidence. Running `update` alone is not a complete upgrade across this change. It does report files that earlier releases installed and this one no longer ships, such as the old acceptance template, as `stale`, and says whether each is unmodified (safe to delete) or carries local changes to merge first; it never deletes them.

There is intentionally no `implement` command: an agent should follow `AGENTS.md` and `docs/WORKFLOW.md` and wait for a separate implementation instruction. ADRs can be created from `.agent-specs/templates/adr/ADR.md` once architectural decisions are adopted.

## Workflow reference structure

`docs/WORKFLOW.md` keeps classification, the five-phase lifecycle, completion gates, and document ownership together. It directs agents to read supporting procedures when needed: `docs/workflow/ALLOCATION.md` before feature allocation, `CHANGE_HISTORY.md` before amendments or replacements, and `PROJECT_DOCS.md` when creating or reconciling shared documentation. These use ordinary Markdown links with explicit reading triggers, not tool-specific imports that load every procedure at startup. Former workflow section anchors remain as forwarding guidance for existing links.

`update` installs the supporting documents and updates unmodified instructions. If your workflow is customized, merge its reading triggers and links manually; existing feature documents need no rewrite.

## Finding current feature behavior

Agents consult a compact, project-owned `docs/features/INDEX.md` (or an adequate existing registry) and search feature contents, code, and tests. They trace amendments and partial replacements to the owning requirement IDs, distinguishing planned changes from effective behavior and local completion from deployment. Missing or stale index entries never replace content search.

The agent creates the index during approved specification work and updates affected entries with scope and replacement changes. It stores search terms, source links, qualified requirement IDs, and planned/effective relationships—not a second lifecycle status or verification record. Initialization and CLI feature creation do not invent index entries; updates leave the index untouched. The [feature discovery guide](scaffold/docs/features/README.md#finding-the-current-contract) defines search, conflict handling, incremental backfilling, and maintenance.

## Workflow classification

The opinionated workflow uses an ordered [classification procedure](scaffold/docs/WORKFLOW.md#classifying-a-change) for fixes, implementation details, minor revisions, behavioral replacements, amendments, and new features. A minor revision removes, narrows, or rewords a requirement inside one feature, when the user asked for it and no default, data, permission, security, recovery, shared contract, or other feature is affected; it is recorded in that feature instead of becoming a new one. Additions with their own page, screen, route, command, or settings surface are new features, and features are defined by user outcome rather than by layer. Amendments preserve earlier completion events and verification evidence while tracking the expanded scope honestly. Direct requests and sentence length do not bypass new-feature gates.

The [classification regression suite](examples/workflow-classification/README.md) defines controlled scenarios, approval boundaries, repeated cross-agent trials, and a completed-amendment walkthrough. It is an evaluation protocol; passing CLI tests does not establish cross-agent consistency.

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
npm run release:pack    # Produce both local npm tarballs for testing
```

For the release steps, see [`PUBLISHING.md`](PUBLISHING.md). Changes in each version, including migration steps for breaking ones, are listed in [`CHANGELOG.md`](CHANGELOG.md).

Pull requests run tests (including an actual npm tarball smoke test) and scaffold formatting checks on Node.js 22, 24, and 26 across Linux, Windows, and macOS. Publishing remains manual.

## License

MIT
