# Feature Specifications

Create a directory here **only after the user explicitly accepts the feature scope**. Do not create speculative feature directories during discovery.

After approval, use `scaffold-agent-specs feature "Feature title" --approved` when available, then fill all required documents from the accepted discussion. If the CLI is unavailable, copy the templates by hand as described in [Feature allocation](../workflow/ALLOCATION.md#creating-a-feature-directory). The CLI only creates templated files and fills identifiers, titles, and dates.

Each feature is named `feature-NNN-kebab-case`, for example `feature-007-user-statistics-page`. Start at `001` and choose the next number above the highest existing feature ID; do not reuse numbers. Separate branches and worktrees choose numbers independently, so check for [duplicate numbers](../workflow/ALLOCATION.md#duplicate-numbers) before committing and before integration.

Required documents (copied from `.agent-specs/templates/feature/`):

- `PLAN.md`: approved scope and proposed approach.
- `ACCEPTANCE_CRITERIA.md`: testable outcomes and verification evidence.
- `TASKS.md`: implementation checklist.

`DESIGN.md` is useful when technical or interaction choices benefit from a separate explanation for implementation or review. `RESEARCH.md` is useful when recorded findings would avoid repeated investigation. Short, focused documents are welcome. `HANDOFF.md` is optional and should be created when an agent or session needs to transfer working context. Do not create empty optional documents just to satisfy a checklist.

After creating and populating the specs, **stop** and await a separate implementation request. See [`docs/WORKFLOW.md`](../WORKFLOW.md) for the full lifecycle.

## Finding the current contract

Before classifying a change, use `INDEX.md` in this directory when present, then search feature contents. Folder names and index entries are discovery aids, not evidence that a requirement is current or implemented.

1. Search domain terms, synonyms, user outcomes, commands/routes, and relevant code symbols in plans and acceptance documents, including exclusions and scope-change notes. For example, from the repository root:

   ```sh
   rg -n -i 'export|csv|delimiter' docs/features -g PLAN.md -g ACCEPTANCE_CRITERIA.md
   ```

   Substitute terms from the request; use equivalent content search if `rg` is unavailable. Search relevant code, tests, and existing product documentation too. No index match is not proof that no owning feature exists.

2. Read matching scope, requirements, exclusions, amendment entries, and replacement notes. Follow replacement links in both directions and through later replacements, using feature-qualified requirement IDs. Read task state and applicable verification runs when they affect whether behavior was implemented or verified. Do not load every feature folder indiscriminately.
3. Distinguish agreed behavior from observed implementation and release state. Approval of a replacement does not make it effective; feature completion alone does not prove deployment. For partial or staged replacements, identify the affected requirement IDs and version/environment, retaining unaffected requirements from earlier plans. Old passing results remain historical evidence only.
4. Before proposing overlapping scope, summarize the relevant current contract with links to owning plans and requirement IDs, effective replacements, and any unresolved conflicts. If documents, tests, code, or rollout evidence disagree, surface the conflict rather than choosing the newest feature number or silently treating implementation as the agreed contract. Resolve uncertainty before dependent classification or implementation.

A missing, incomplete, or stale index must not stop content search. Broken links, missing reciprocal notes, and replacement cycles are uncertainties to resolve, not permission to invent ownership. Discovery itself remains read-only; repair documentation during authorized specification or implementation work.

## Maintaining the feature index

`docs/features/INDEX.md` is a compact, agent-maintained navigation index. Create it when specifying the first approved feature, or when next updating existing feature specifications if it is absent. Reuse an adequate existing feature registry instead of creating a duplicate. `init` and the `feature` CLI do not create or populate it: meaningful entries require the agent to inspect approved scope. `update`, including `--force`, leaves this project-owned file alone.

Use one row per owning feature, splitting rows by outcome only when partial replacements need it:

| Outcome / search terms | Owning plan and requirement IDs | Related amendments / replacements | Last checked (date @ revision) |
| ---------------------- | ------------------------------- | --------------------------------- | ------------------------------ |

Populate rows with actual feature links, concise domain terms and aliases, feature-qualified requirement IDs, and links to relevant scope-change or replacement sections. In the relationship column, distinguish **planned replacement** from **effective replacement**, identify affected IDs, and include version/environment qualifications when relevant. Link the source evidence rather than copying full requirements or test results. In the last column, record only the date and the source revision actually inspected, for example `2026-11-17 @ 263c0e8`; for uncommitted documents, name the base revision, for example `2026-11-17 @ 263c0e8 + working tree`. Do not put lifecycle or verification states such as "specified" or "implemented" there; `TASKS.md` owns them. State unknown details honestly.

The index owns navigation only. Plans own scope and replacement relationships, acceptance documents own evidence, and task files own lifecycle status. Do not add a second lifecycle status or use the index as approval, verification, or deployment evidence.

Update affected rows in the same change as specification, amendment, implemented replacement, rename/ID reconciliation, or a change to rollout applicability. On completion, check links and source references for the touched outcomes; preserve earlier plans and evidence. When backfilling an existing repository incrementally, label index coverage as partial and name what was inspected; never imply uninspected features are absent.

For concurrent work, feature owners propose their row updates and the integration owner reconciles them before merge, preserving unrelated rows and checking duplicate ownership and links. Avoid competing writes in a shared checkout; serialize edits or use separate changes and reconcile them through the authorized Git process.
