# Feature Specifications

Create a directory here **only after the user explicitly accepts the feature scope**. Do not create speculative feature directories during discovery.

After approval, use `scaffold-agent-specs feature "Feature title" --approved` when available, then fill all required documents from the accepted discussion. If the CLI is unavailable, copy the templates using the same exclusive allocation lock as described in [Feature allocation](../workflow/ALLOCATION.md#shared-allocation-protocol). The CLI only creates templated files and fills identifiers, titles, and dates.

Each feature is named `feature-NNN-kebab-case`, for example `feature-007-user-statistics-page`. Start at `001` and choose the next number above the highest existing feature ID while holding the allocation lock; do not reuse numbers. The lock covers only this checkout. Separate branches/worktrees must coordinate allocations and check for duplicate IDs before integration, following the workflow.

Required documents (copied from `.agent-specs/templates/feature/`):

- `PLAN.md`: approved scope and proposed approach.
- `ACCEPTANCE_CRITERIA.md`: testable outcomes and verification evidence.
- `TASKS.md`: implementation checklist.

`DESIGN.md` is optional for substantial technical or interaction design. `RESEARCH.md` is optional for reusable investigation findings. `HANDOFF.md` is optional and should be created when an agent or session needs to transfer working context. Do not create empty optional documents just to satisfy a checklist.

After creating and populating the specs, **stop** and await a separate implementation request. See [`docs/WORKFLOW.md`](../WORKFLOW.md) for the full lifecycle.
