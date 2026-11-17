# Feature allocation

Read and follow this procedure before creating feature directories or reconciling duplicate feature IDs. Scope must already be approved under the [feature workflow](../WORKFLOW.md#phase-3-specify-after-accepted-scope). Paths in code spans are relative to the repository root.

Use `scaffold-agent-specs feature "Title" --approved` (or the equivalent `scaffold-agent-workflow` command) when available. The command acquires the shared allocation lock, selects the number, and copies local templates with identifiers filled. It does not fill the specification or verify conversational approval. Do not require a network install just to create documents; use the manual protocol below when the CLI is unavailable.

## Shared allocation protocol

All creators in the same checkout, including agents copying templates manually, must use `docs/features/.agent-specs-feature.lock/`:

1. **Acquire:** create the lock directory with one exclusive directory-creation operation (for example `mkdir docs/features/.agent-specs-feature.lock`, without `-p`). Do not check for absence and then assume ownership. If creation fails, do not allocate or remove the lock; retry after its owner finishes. A dry-run number is not a reservation.
2. **Number under the lock:** re-read the existing `docs/features/feature-NNN-*` directories and choose one above the highest number (start at `001`). Never reuse an existing number or rely on a scan made before acquiring the lock.
3. **Create exclusively:** create `docs/features/feature-NNN-kebab-case/` without overwriting an existing directory. Copy `PLAN.md`, `ACCEPTANCE_CRITERIA.md`, and `TASKS.md` from `.agent-specs/templates/feature/`, plus needed optional templates. In every copied file, replace `feature-NNN-kebab-case`, the `NNN` in `Feature NNN:`, `[Feature title]`, and `[YYYY-MM-DD]` with the directory name, number, title, and current date.
4. **Release:** after the copied files and identifiers are complete, remove only the lock acquired by this operation, using cleanup that runs on success or failure. On copying failure, remove only the partial feature directory created by this operation before releasing the lock. Never remove another creator's files. Do not hold the lock during discussion, specification writing, implementation, or commits. Do not commit the temporary lock.
5. **Populate:** the allocating agent owns the new feature documents until it explicitly hands them off. Replace remaining bracketed prompts from the approved discussion and delete irrelevant template guidance. Other agents must not edit the same feature without coordinating ownership. No prompts may remain in the finished specification.

Both CLI and manual creators respect the same lock. After a crash, remove a leftover lock only after confirming no CLI or manual creator still owns it; elapsed time alone does not establish that. If ownership is uncertain, report the blocker instead of deleting it. Inspect any partial feature directory before recovery; preserve work whose ownership is unclear.

## Separate branches and worktrees

The lock protects one filesystem checkout only. Before parallel feature specification in separate clones, branches, or worktrees, designate one allocation owner in a shared integration checkout. Allocate approved feature folders there serially, then distribute the reservation/specification commits to workers through the repository's authorized Git process before they allocate more IDs. Do not push, change branches, or merge without authorization. If coordination is unavailable, defer new number allocation; implementation of already assigned features can continue.

Before integration, check the combined feature directories for duplicate numeric IDs, even when slugs differ. If independent branches already allocated the same number, coordinate with their owners: retain the established target-branch ID, assign the incoming feature a fresh ID under the shared lock, update its directory, embedded feature IDs, and all incoming references (including feature index entries), and record the old-to-new mapping in its plan. Preserve requirements, acceptance/task IDs, approval and verification history. Do not silently renumber an established target-branch feature or rewrite published history; escalate ambiguous ownership before integrating.

If the user re-scopes or splits a feature before any of it is implemented, restructure its documents in a new commit; it may keep its number and take a new slug. Allocate any additional features through the same protocol.
