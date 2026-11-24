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

Separate branches, clones, and worktrees choose numbers independently, so two features can end up with the same number. No coordination is needed in advance, but when several people will build features in parallel, specifying and numbering them on the shared branch before branching avoids collisions entirely. Check the combined `docs/features/` for duplicate numbers, even when the slugs differ, before committing a new feature and after merging or rebasing a branch that adds features. If you find one:

- Keep the number of the feature that is already committed on the target branch. Give the other feature the next free number: rename its directory and update its embedded feature ID and every reference to it, including feature index rows and supersession links. Record the old and new IDs in its plan's scope change log, and refresh its index row's "Last checked" cell.
- Preserve its requirement, acceptance, and task IDs, and its approval and verification history.
- If the merge or rebase stopped for conflicts, renumber before completing it. If it was already committed, renumber in an immediate follow-up commit; do not reset or rewrite history to avoid the intermediate commit. Never push, or report the merge as done, while a duplicate remains.
- Never renumber a feature already on the target branch or rewrite published history. If it is unclear which feature is established, ask before integrating.

Pushing, switching branches, and merging still need authorization; if you cannot perform the check yourself, report the possible duplicate instead.

## Checks after merging

Feature numbers are not the only thing branches can collide on. After merging or rebasing a branch that changed anything under `docs/features/`, and before pushing or reporting the merge as done, also check:

1. **Duplicate requirement, criterion, and task IDs within a feature.** Two branches that amended the same feature may have appended the same next IDs. Keep the IDs already committed on the target branch and give the incoming ones the next free IDs: update every reference to them (tasks, criteria, index rows, other features' links, tests that name them) and record the old and new IDs in the plan's scope change log. Preserve all approval and verification history.
2. **The feature index.** Every feature directory needs a row in `INDEX.md`, and rows are duplicated only where [the index rules](../features/README.md#maintaining-the-feature-index) allow split rows. Read the merge's diff of `INDEX.md` as well: a row that lost search terms or requirement IDs, or that reverted to older content, was probably overwritten from a stale copy. Restore it from the plans.

This command, run from the repository root, lists duplicate IDs and features without an index row. The patterns match the template formats (`- **FR-001:**`, `| AC-001 |`, `- [ ] **T-001:**`); requirements are read only from the "Functional requirements" section, so references to other features' IDs are not counted. It cannot detect reverted rows; only reading the diff catches those.

```sh
for d in docs/features/feature-*/; do
  f=$(basename "$d")
  { awk '/^## Functional requirements/{s=1;next} /^## /{s=0} s' "$d/PLAN.md"
    cat "$d/ACCEPTANCE_CRITERIA.md" "$d/TASKS.md"
  } 2>/dev/null | grep -oE '^(- \*\*FR-[0-9]{3}|\| AC-[0-9]{3} |- \[.\] \*\*T-[0-9]{3})' |
    grep -oE '[A-Z]+-[0-9]{3}' | sort | uniq -d | sed "s|^|$f: duplicate |"
  grep -q "($f/PLAN.md" docs/features/INDEX.md 2>/dev/null || echo "$f: no row in INDEX.md"
done
```

No output means neither problem was found. Resolve findings in the merge (when it stopped for conflicts) or in an immediate follow-up commit, as for duplicate feature numbers.

If the user re-scopes or splits a feature before any of it is implemented, restructure its documents in a new commit; it may keep its number and take a new slug. Create any additional features with the same procedure.
