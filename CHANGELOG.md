# Changelog

Notable changes to `scaffold-agent-specs`. Versions follow semantic versioning; before 1.0, a minor version can contain breaking changes, which are marked **Breaking** with their migration steps.

Changes to the installed Markdown reach an existing repository only when you run `npx scaffold-agent-specs@latest update` there.

## Unreleased

### Changed

- The feature index's last column is now "Last checked (date @ revision)", with an example such as `2026-11-17 @ 263c0e8`. Lifecycle and verification states don't belong there. Existing `INDEX.md` files are project-owned and are not changed by `update`; rename the column by hand if you want.
- Agents must write the complete proposal in the conversation before asking to accept, revise or discard. A question dialog can collect open choices, but it can't stand in for the proposal.
- When a review accepts a deviation from a written requirement, the agent either fixes the code or updates the requirement and its acceptance criterion. If the change alters approved behavior, the user must approve it and it gets a scope change log entry.
- Agents copying templates by hand no longer take the allocation lock. They create the feature directory with a plain `mkdir` (which fails if it already exists) and check for duplicate numbers before committing and before integrating. In the 0.4.2 trial, improvised lock commands left a stale lock once, and under contention two of the four would have broken the protocol. The `feature` CLI still serializes its own runs with the lock.
- Separate branches and worktrees no longer need a designated allocation owner. They choose numbers independently, and before integration the incoming feature takes the next free number if there is a clash, with its old and new IDs recorded. `docs/workflow/ALLOCATION.md` is shorter and has no lock protocol. `WORKFLOW.md` no longer has the "Shared allocation protocol" and "Separate branches and worktrees" forwarding sections; link to `docs/workflow/ALLOCATION.md` instead.
- `AGENTS.md` now tells agents to check for duplicate feature numbers after merging or rebasing a branch that adds features, and to renumber the incoming feature before pushing or reporting the merge as done. A conflicted merge is renumbered before it is completed. An already committed merge is fixed in a follow-up commit rather than by rewriting history. In the 0.4.2 trial, agents always ran a plain `git merge` first, and one merge committed two features with the same number. A duplicate found before committing a new feature must also be resolved before the commit.

## 0.4.2 - 2026-11-17

### Changed

- Feature discovery searches document contents and traces effective requirement ownership instead of filtering only by folder names. Agents maintain a project-owned navigation index during authorized feature work, with explicit handling for stale entries, partial replacements, and staged rollouts.

- Split allocation, feature change history, and the project document catalog into linked `docs/workflow/` references. The main workflow retains classification, lifecycle gates, ownership, and forwarding sections for older links. Customized workflows need their reading triggers merged after update.

### Added

- Agents use the CLI feature allocator when available or follow its exclusive lock protocol when copying templates manually. The workflow defines allocation ownership across worktrees and duplicate-ID reconciliation before integration.

- Opinionated features define review and integration requirements and an explicit completion boundary. Final diff review, finding resolution, and required CI/merge evidence are tracked in existing feature documents; self-review is distinguished from independent approval.

- `init` and `update` report instruction integration separately from installation, with merge guidance for preserved agent entry points and workflow instructions that differ from the selected profile. Dry runs preview the same review needs; profile selection and matching files are not presented as proof of active agent behavior.

## 0.4.1 - 2026-11-17

### Added

- Dual-package release scripts distribute the same dependency-free CLI as `scaffold-agent-specs` and `scaffold-agent-workflow`, with matching versions and package-specific command names and help. `scaffold-agent-workflow init` defaults to the opinionated profile, while explicit profiles and existing installations retain their selection.

## 0.4.0 - 2026-11-15

### Changed

- **Breaking:** Node.js 22 or newer is required. Node.js 20 has reached end-of-life.
- **Breaking:** `update` refuses to run in a directory without an installation instead of installing the opinionated scaffold there. Run `init` first, or pass `--profile` to install explicitly.
- `CLAUDE.md` imports `AGENTS.md` with Claude Code's `@AGENTS.md` syntax, so the shared instructions load automatically instead of relying on the agent to open the file.
- Feature directory slugs keep letters and digits of every script; previously a title without ASCII letters was rejected and letters such as `ß` or `ø` were dropped. Whitespace in a title, including line breaks, collapses to single spaces.
- Command output uses forward slashes in paths on every platform.

### Added

- `update` reports files that an earlier release installed and the current one no longer ships (such as `ACCEPTANCE_MATRIX.md`) as `stale`, and says whether each is unmodified or carries local changes. It never deletes them.
- Continuous integration runs on Linux, Windows, and macOS with Node.js 22, 24, and 26.

### Fixed

- `update` no longer treats files checked out with CRLF line endings (the Git for Windows default) as locally modified. Updated files keep the line endings they had.
- An unrelated `docs/WORKFLOW.md` is no longer mistaken for an existing opinionated installation.
- `docs/WORKFLOW.md` still called acceptance criteria documents "matrices" in two places.
- A malformed `.agent-specs/profile.json`, or a file where `update` needs a directory, now produces a clear error instead of a raw JSON or `ENOTDIR` message.

## 0.3.0 - 2026-11-13

### Changed

- **Breaking:** `ACCEPTANCE_CRITERIA.md` replaces `ACCEPTANCE_MATRIX.md`, and the old filename is no longer supported. `update` does not rename files or rewrite links. In an existing installation:
  1. Rename `.agent-specs/templates/feature/ACCEPTANCE_MATRIX.md` and each `docs/features/feature-*/ACCEPTANCE_MATRIX.md` to `ACCEPTANCE_CRITERIA.md`.
  2. Update references to the old filename in your feature documents and any customized scaffold files.
  3. Run `update`, then merge the current scaffold instructions into files it skipped as customized, preserving your changes and verification evidence.

### Added

- Guidance in `AGENTS.md` on writing useful code comments.

## 0.2.3 - 2026-11-12

### Fixed

- `init` validates every destination before writing, so a directory or file of the wrong type no longer causes a partial install.
- Feature titles containing replacement tokens such as `$&` are inserted literally.
- `CLAUDE.md` again forbids AI attribution trailers in commits.

## 0.2.2 - 2026-11-11

### Fixed

- Change classification is an ordered procedure, and amendments preserve earlier completion events and verification evidence.

## 0.2.1 - 2026-11-11

### Added

- A procedure for amending existing features, and a rule that behavior changes get automated tests whenever the project has a test suite.

### Changed

- Clarified how directly requested capabilities are classified, how to cite commits for implemented replacements, and when to commit at milestones.

## 0.2.0 - 2026-11-11

Includes the changes tagged as 0.1.9, which was not published to npm.

### Added

- `basic` and `opinionated` install profiles, recorded in `.agent-specs/profile.json`. Noninteractive `init` defaults to basic.
- Release and recovery guidance, and an optional project document catalog with templates for testing, product context, visual design, and deployment.
- Rules for superseding earlier feature specifications while preserving their history.

### Fixed

- `update` matches files by exact content, so a meaningful local edit is never overwritten as if it were a released version.
- Concurrent `feature` commands can no longer allocate the same feature ID.

## 0.1.8 - 2026-10-31

Includes the changes tagged as 0.1.7, which was not published to npm.

### Changed

- The workflow sizes features, defers the choice of test tooling, and reconciles plans with what shipped.
- The README leads with `npx` usage.

## 0.1.6 - 2026-10-30

Includes the changes tagged as 0.1.5, which was not published to npm.

### Changed

- Agents report useful document recommendations, check for overlap with existing features, and link feature-specific rules from conventions instead of restating them.

## 0.1.4 - 2026-10-30

### Changed

- Agents are prompted to propose convention and glossary documents when useful.

## 0.1.3 - 2026-10-30

### Changed

- Documented creating feature directories by hand and committing at milestones.

## 0.1.2 - 2026-10-30

### Added

- The `update` command.

## 0.1.1 - 2026-10-30

First version published to npm: `init` and `feature` commands with the scaffold's instructions and templates.
