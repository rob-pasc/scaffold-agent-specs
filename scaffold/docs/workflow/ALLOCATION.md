# Feature allocation

Read this procedure before creating a feature directory or resolving a duplicate feature number. Scope must already be approved under the [feature workflow](../WORKFLOW.md#phase-3-specify-after-accepted-scope). Paths in code spans are relative to the repository root.

## Creating a feature directory

Use `scaffold-agent-specs feature "Title" --approved` (or the equivalent `scaffold-agent-workflow` command) when it is available. It chooses the number, creates the directory, and copies the local templates with identifiers filled in. It does not write the specification or verify approval. Do not require a network install just to create documents; copy the templates by hand instead:

1. **Number:** list the `docs/features/feature-NNN-*` directories and choose the next number above the highest (start at `001`). Never reuse an existing number.
2. **Create:** run `mkdir docs/features/feature-NNN-kebab-case` without `-p`, so that it fails rather than reusing an existing directory. If it fails, list the directories again and choose another number.
3. **Copy:** copy `PLAN.md`, `ACCEPTANCE_CRITERIA.md`, and `TASKS.md` from `.agent-specs/templates/feature/`, plus any optional templates needed. In every copied file, replace `feature-NNN-kebab-case`, the `NNN` in `Feature NNN:`, `[Feature title]`, and `[YYYY-MM-DD]` with the directory name, number, title, and current date.
4. **Populate:** replace the remaining bracketed prompts from the approved discussion and delete template guidance that does not apply. No prompts may remain in the finished specification.

Before committing a new feature, list the feature directories again. If another directory now uses the same number, resolve it as described in the next section before committing; do not commit a duplicate number.

The CLI serializes its own runs with a short-lived `docs/features/.agent-specs-feature.lock/` directory. Manual creators do not use it. If the CLI reports this lock after a crash, remove it only after confirming that no `feature` command is still running.

## Duplicate numbers

Separate branches, clones, and worktrees choose numbers independently, so two features can end up with the same number. No coordination is needed in advance. Check the combined `docs/features/` for duplicate numbers, even when the slugs differ, before committing a new feature and after merging or rebasing a branch that adds features. If you find one:

- Keep the number of the feature that is already committed on the target branch. Give the other feature the next free number: rename its directory and update its embedded feature ID and every reference to it, including feature index rows and supersession links. Record the old and new IDs in its plan's scope change log, and refresh its index row's "Last checked" cell.
- Preserve its requirement, acceptance, and task IDs, and its approval and verification history.
- If the merge or rebase stopped for conflicts, renumber before completing it. If it was already committed, renumber in an immediate follow-up commit; do not reset or rewrite history to avoid the intermediate commit. Never push, or report the merge as done, while a duplicate remains.
- Never renumber a feature already on the target branch or rewrite published history. If it is unclear which feature is established, ask before integrating.

Pushing, switching branches, and merging still need authorization; if you cannot perform the check yourself, report the possible duplicate instead.

If the user re-scopes or splits a feature before any of it is implemented, restructure its documents in a new commit; it may keep its number and take a new slug. Create any additional features with the same procedure.
