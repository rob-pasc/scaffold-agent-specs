# Spec-driven Feature Workflow

This document expands the feature lifecycle required by [`AGENTS.md`](../AGENTS.md). Feature specifications live in `docs/features/`; reusable templates live in `.agent-specs/templates/`.

## Phase 1: Discover (conversation only)

- Read existing code and documentation when relevant, then explore the user's idea collaboratively.
- Ask focused clarifying questions, using the agent's interactive question interface where available or normal chat otherwise. Prefer small, purposeful batches over long questionnaires.
- Establish the problem, target users, expected behaviors, important edge cases, constraints, dependencies, and exclusions.
- Offer sensible defaults and surface tradeoffs; do not silently make consequential product decisions.
- Do **not** create a feature directory, commit a spec, or implement the feature yet.

## Phase 2: Propose and decide (human gate)

Present a readable summary with:

1. **Goal and motivation**: what problem the feature solves.
2. **Expected behavior**: key user journeys and observable outcomes.
3. **Scope**: clearly distinguished in-scope and out-of-scope work.
4. **Acceptance expectations**: how success will be recognized.
5. **Assumptions, risks, and open questions**: especially choices that affect cost or design.

Ask the user to **accept, revise, or discard**.

- **Accept:** proceed to specification.
- **Revise:** discuss, re-propose, and seek explicit approval again.
- **Discard:** stop without creating feature artifacts.
- Silence, vague assent, or approval of a different subject does not count as approval.

## Phase 3: Specify (after accepted scope)

Create the feature directory by hand:

1. **Number:** find the highest `NNN` among the existing `docs/features/feature-NNN-*` directories and add one (start at `001`). Never reuse a number.
2. **Name:** `docs/features/feature-NNN-kebab-case/`, where `kebab-case` is a short slug of the feature title (for example `feature-007-user-statistics-page`).
3. **Copy:** `PLAN.md`, `ACCEPTANCE_MATRIX.md`, and `TASKS.md` from `.agent-specs/templates/feature/`, plus any optional templates needed (see the table below).
4. **Fill identifiers:** in every copied file, replace `feature-NNN-kebab-case` with the directory name, the `NNN` in `Feature NNN:` with the number, `[Feature title]` with the title, and `[YYYY-MM-DD]` with today's date.
5. **Fill content:** replace every remaining bracketed prompt, such as `[First actionable implementation step]`, with content from the approved discussion, and delete template guidance that doesn't apply. No prompts may remain.

(The `scaffold-agent-specs feature` command performs steps 1–4 for people who prefer it; agents don't need it.)

Required and optional documents:

| File                   | Purpose                                                                        | Required?      |
| ---------------------- | ------------------------------------------------------------------------------ | -------------- |
| `PLAN.md`              | Approved product scope, requirements, constraints, proposed technical approach | Yes            |
| `ACCEPTANCE_MATRIX.md` | Testable criteria plus verification methods, results, and evidence             | Yes            |
| `TASKS.md`             | Ordered, actionable implementation checklist, mapped to criteria               | Yes            |
| `DESIGN.md`            | Detailed technical/UX design when complexity warrants it                       | Optional       |
| `RESEARCH.md`          | Durable findings from meaningful investigation                                 | Optional       |
| `HANDOFF.md`           | Short-lived context for work that will resume elsewhere                        | Only if useful |

Write the approved scope into `PLAN.md`. Draft acceptance criteria and tasks that correspond to that scope. Cross-reference IDs where practical. Put unresolved technical questions in the plan, rather than inventing answers. Add `DESIGN.md` only for substantial design detail, and `RESEARCH.md` only when research findings are worth retaining. Do not write an ADR for an unimplemented option.

**Then stop.** Tell the user what was scaffolded, identify open decisions or blockers, and wait for an explicit implementation request. Feature approval is **not** implementation authorization.

## Phase 4: Implement (separate explicit request)

- Re-read the active feature's plan, acceptance matrix, and tasks, plus any optional design/research documents; inspect relevant code and applicable `docs/conventions/` documentation.
- Check readiness: requirements coherent, blockers identified, implementation direction sensible, verification approach practical. Record any blockers under "Dependencies and blockers" in `TASKS.md`, then set its status to `Ready`, and to `In progress` once work starts.
- Seek human input before significant new dependencies, migrations that modify or delete existing data, security-sensitive choices, or changes to approved behavior. Purely additive migrations (for example, a new table or store that leaves existing data untouched) need no prior approval, but record them in the plan and report them. Technical refinement that stays within scope usually needs no additional approval.
- Work through `TASKS.md`, updating checked items to reflect reality. Keep plan notes synchronized when implementation choices change.
- Add or update tests and record concrete results in `ACCEPTANCE_MATRIX.md`.
- If interrupted, add or refresh `HANDOFF.md` with the current task, blockers, commands run, and the next actionable step.

## Phase 5: Verify and close

- Review each acceptance criterion against observable evidence. Use `Pass`, `Fail`, `Blocked`, or `Not run`; never invent a result. If a criterion is waived or removed, record the user's approval and update scope accordingly.
- Run applicable checks and document anything not run.
- Update affected user/developer/project documentation in the same change. Maintain `docs/ARCHITECTURE.md`, `docs/GLOSSARY.md`, and `docs/conventions/` when they exist and are affected by the change.
- Create ADRs for meaningful architectural decisions **actually adopted**. Normally do this after the implementation is known; for a consequential choice adopted earlier, record it at that point.
- Report what shipped, what was validated, any limitations, and whether the feature is complete. A feature is not complete while required acceptance criteria remain failing, blocked, or unverified.
- Set the `TASKS.md` status to `Complete` only when that holds; otherwise use `Implemented (verification pending)` and list what remains.

## Maintaining the source of truth

- `PLAN.md` owns agreed scope, not task completion.
- `ACCEPTANCE_MATRIX.md` owns acceptance and verification evidence, not general project notes.
- `TASKS.md` owns implementation progress and the feature's lifecycle status, not architectural rationale.
- `DESIGN.md`, if present, owns detailed technical and UX design, not user-approved scope.
- `RESEARCH.md`, if present, preserves meaningful investigation and uncertainty, not decisions.
- `HANDOFF.md`, if present, is a snapshot for resumption and may be deleted once unnecessary.
- ADRs document _adopted_, broadly relevant architecture decisions; feature plans retain proposals and feature-local tradeoffs.
- `docs/ARCHITECTURE.md` describes the implemented system; `docs/GLOSSARY.md` defines shared domain terminology; `docs/conventions/` records reusable project practices. Create these documents only when they provide value. Templates are under `.agent-specs/templates/`.

Approved scope changes must be brought back to the user before being incorporated as commitments. Keep artifacts understandable to someone resuming the project without the original chat history. **Progressive documentation:** do not create an optional document just because a template exists; prefer updating a single authoritative source over duplicating content.
