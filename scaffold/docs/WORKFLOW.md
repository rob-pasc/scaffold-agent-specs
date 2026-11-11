# Spec-driven Feature Workflow

This document expands the feature lifecycle required by [`AGENTS.md`](../AGENTS.md). Feature specifications live in `docs/features/`; reusable templates live in `.agent-specs/templates/`.

## Phase 1: Discover (conversation only)

- Read existing code and documentation when relevant, then explore the user's idea collaboratively. Consult `docs/PRODUCT.md` or the existing product reference when present to understand users, core journeys, and agreed boundaries; it does not authorize new feature scope.
- Check for overlap with existing features: list `docs/features/` and judge by folder names. Open a feature's `PLAN.md` only when its name suggests related scope, and read its summary, approved scope, and any supersession notes rather than the whole folder. Follow relevant replacement links to understand current behavior. If scope overlaps, say so in the proposal and settle with the user which feature owns it.
- Ask focused clarifying questions, using the agent's interactive question interface where available or normal chat otherwise. Prefer small, purposeful batches over long questionnaires.
- Establish the problem, target users, expected behaviors, important edge cases, constraints, dependencies, and exclusions.
- Ask how the user wants the feature verified when that affects effort or tooling, for example browser end-to-end tests or checks on a device or service the agent can't reach. Read `docs/TESTING.md` or the existing testing/contributing guide when present. If the project already has a test approach, follow it instead of asking.
- For changes with release or data-recovery implications, inspect the existing deployment/publishing guide or runbook. Establish whether release execution and live verification are part of the requested scope or a later handoff.
- Offer sensible defaults and surface tradeoffs; do not silently make consequential product decisions.
- Do **not** create a feature directory, commit a spec, or implement the feature yet.

## Phase 2: Propose and decide (human gate)

Present a readable summary with:

1. **Goal and motivation**: what problem the feature solves.
2. **Expected behavior**: key user journeys and observable outcomes.
3. **Scope**: clearly distinguished in-scope and out-of-scope work.
4. **Acceptance expectations**: how success will be recognized.
5. **Assumptions, risks, and open questions**: especially choices that affect cost or design.

**Size the feature.** A feature is one increment the user can review and verify in one sitting. If the scope contains parts that can be built and verified on their own, or would need more than about ten acceptance criteria, propose splitting it into several features: list them in build order with their dependencies, and let the user choose between the split and a single feature. Each feature gets its own directory; one approval can cover the whole set.

Ask the user to **accept, revise, or discard**.

- **Accept:** proceed to specification.
- **Revise:** discuss, re-propose, and seek explicit approval again.
- **Discard:** stop without creating feature artifacts.
- Silence, vague assent, or approval of a different subject does not count as approval.

## Phase 3: Specify (after accepted scope)

Create the feature directory by hand:

1. **Number:** find the highest `NNN` among the existing `docs/features/feature-NNN-*` directories and add one (start at `001`). Never reuse a number. If the user re-scopes or splits a feature before any of it is implemented, restructure its documents in a new commit; it may keep its number and take a new slug.
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

Write the approved scope into `PLAN.md`. Draft acceptance criteria and tasks that correspond to that scope. Use stable requirement (`FR-001`), acceptance (`AC-001`), and task (`T-001`) IDs and cross-reference them where practical. State each criterion's verification method as the observable check (for example "journey completes in a browser at 360 px width"), not a specific test tool, unless the user or the project has already chosen one; tooling is an implementation choice. Put unresolved technical questions in the plan, rather than inventing answers. Add `DESIGN.md` only for substantial design detail, and `RESEARCH.md` only when research findings are worth retaining. Do not write an ADR for an unimplemented option.

For applicable features, fill the plan's "Release and recovery" section: rollout order, compatibility, migrations, irreversible steps, recovery limits, and observable post-release checks. Link to shared procedures rather than copying them. Put required verification outcomes in `ACCEPTANCE_MATRIX.md` and execution work in `TASKS.md`; identify ownership and prerequisites for release work explicitly outside scope. Do not add a release process to features that do not need one.

If the approved scope changes behavior owned by an earlier feature, fill the plan's "Related and superseded features" section using the rules below. Treat the relationship as planned until the replacement is implemented.

**Then stop.** Tell the user what was scaffolded, identify open decisions or blockers, and wait for an explicit implementation request. Feature approval is **not** implementation authorization.

## Phase 4: Implement (separate explicit request)

- Re-read the active feature's plan, acceptance matrix, and tasks, plus any optional design/research documents; inspect relevant code and applicable `docs/conventions/` documentation.
- Check readiness: requirements coherent, blockers identified, implementation direction sensible, verification approach practical. Consult the existing testing guide for setup, check selection, and integration boundaries. Record any blockers under "Dependencies and blockers" in `TASKS.md`, then set its status to `Ready`, and to `In progress` once work starts.
- Seek human input before significant new dependencies, migrations that modify or delete existing data, security-sensitive choices, or changes to approved behavior. Purely additive migrations (for example, a new table or store that leaves existing data untouched) need no prior approval, but record them in the plan and report them. Technical refinement that stays within scope usually needs no additional approval.
- Treat an independent user-facing capability beyond the approved requirements as a scope change, however small (for example, undoing an action or an extra management capability): ask before building it, then add it to the plan's requirements and scope change log. A direct user request for it counts as approval; follow the rule for requested capabilities in `AGENTS.md`. Validation and error feedback necessary to fulfill agreed outcomes may proceed without another gate; document meaningful choices in the plan. For example, an agreed form needs feedback when submission fails, but adding a new retry policy or recovery workflow may change the product contract. Supporting work that leaves behavior unchanged, such as operator scripts or security hardening, needs no approval but belongs in the plan's technical approach.
- Prepare and verify release/recovery steps within the approved scope. Use the project's existing authorization process before deploying, publishing, or modifying production data; a written procedure or implementation request alone is not authorization. Reuse explicit authorization already given rather than asking again.
- Work through `TASKS.md`, updating checked items to reflect reality. Keep plan notes synchronized when implementation choices change.
- Add or update tests and record concrete results in `ACCEPTANCE_MATRIX.md`.
- If interrupted, add or refresh `HANDOFF.md` with the current task, blockers, commands run, and the next actionable step.

## Phase 5: Verify and close

- Review each acceptance criterion against observable evidence. Use `Pass`, `Fail`, `Blocked`, or `Not run`; never invent a result. If a criterion is waived or removed, record the user's approval and update scope accordingly.
- Run applicable checks and document anything not run.
- Reconcile `PLAN.md` with what shipped: its technical approach, assumptions, and references (ADRs, related features) must describe the implementation, with no stale claims left, and any behavior added during implementation must appear in its requirements.
- For implemented replacements, reconcile supersession links and historical verification notes in the affected earlier features using the rules below. Apply this reconciliation to the active plan; preserve earlier specifications as historical records with explicit supersession notes.
- Update affected user/developer/project documentation in the same change. Use the optional project document catalog below to identify relevant references and their ownership; maintain existing equivalents instead of creating duplicates.
- Review the catalog for a missing document that has become useful and report only useful recommendations with a brief reason. Follow its creation policy rather than treating the catalog as a checklist of files to generate.
- Report release state separately from implementation completion: distinguish locally verified, ready for release, and actually released behavior, naming the version/environment when known. Required release or recovery checks remain `Not run` or `Blocked` until evidenced; do not mark the feature complete while they remain required and unverified. If release is explicitly outside the approved scope, implementation may be complete once its acceptance criteria pass; record the remaining release work, owner (or unassigned ownership), and prerequisites in the plan and final handoff without claiming it shipped. Do not introduce a second feature lifecycle status.
- Create ADRs for meaningful architectural decisions **actually adopted**. Normally do this after the implementation is known; for a consequential choice adopted earlier, record it at that point.
- Report what was implemented and, if applicable, released, what was validated, any limitations, and whether the feature is complete. A feature is not complete while required acceptance criteria remain failing, blocked, or unverified.
- Set the `TASKS.md` status to `Complete` only when that holds; otherwise use `Implemented (verification pending)` and list what remains.

## Amending a completed feature

When the user asks to extend a completed feature with a small addition that fits its purpose (for example, a new output option for an existing command), amend that feature instead of creating a new one. A specific, explicit request approves the addition; if it leaves consequential choices open, propose them first as in Phase 2.

- **Record before building:** add new requirement, acceptance, and task IDs after the existing ones, and log the change, its date, and the user's request in the plan's scope change log. Never renumber, rewrite, or delete existing rows or their evidence.
- **Reopen honestly:** set the `TASKS.md` status to `In progress` while working. Implement and verify through Phases 4 and 5, including automated tests, and set it back to `Complete` only when the new criteria pass.
- **Know the limits:** use a new feature instead when the addition is independently useful, needs more than a few acceptance criteria, or changes behavior that existing requirements define. Changing defined behavior follows the superseding rules below. Ordinary bug fixes that restore specified behavior need no feature documents.

## Superseding earlier feature specifications

A later feature may replace only part of an earlier feature. Related work or an extension does not automatically supersede the entire earlier specification.

- **During specification:** In the new plan's "Related and superseded features" section, link the earlier plan and identify exactly which requirements and acceptance criteria will change, the replacement behavior, and what remains in force. Qualify references with the feature ID (for example, `feature-003-export / FR-002`), since IDs repeat across features. Label the replacement as planned; scope approval alone does not mean the current behavior has changed.
- **When implemented:** Record the effective replacement date and a commit, PR, or other concrete implementation reference in the new plan. A commit cannot contain its own hash, so cite the implementing commit's subject, or add its hash in a later commit. Add a reciprocal "Related and superseded features" note to the earlier plan identifying the affected IDs and linking to the replacement. For staged rollouts, state where the replacement is effective and where the earlier behavior still applies. Do not mark unimplemented portions as superseded.
- **Preserve evidence:** Keep the earlier requirements, acceptance rows, results, and evidence intact. Add a dated supersession note to the earlier acceptance matrix's verification notes, naming affected criteria and linking to the new plan and matrix. An old `Pass` describes the earlier behavior at the recorded verification point; it is not evidence for the replacement. Verify replacement behavior in the new feature's matrix, leaving unverified criteria `Not run` or `Blocked` as appropriate.
- **Preserve lifecycle history:** Do not reopen a completed feature or rewrite its task checklist merely because a later feature replaces its behavior. Supersession is a relationship recorded in the plans, not a new lifecycle status or acceptance result. Unaffected requirements remain in force. Correcting genuinely inaccurate records is separate from supersession and must be explained explicitly.

For example, if feature 012 replaces feature 003's CSV delimiter, both plans identify the affected requirement and acceptance IDs. Feature 003 retains its original delimiter test result with a note pointing to feature 012; feature 012 records its own evidence for the new delimiter. Other export behavior remains governed by the unchanged requirements.

## Optional project document catalog

This is the shared index for project-level documentation. The Phase 3 table covers feature-level optional files (`DESIGN.md`, `RESEARCH.md`, and `HANDOFF.md`). Templates are installed for reuse; initialization does not create the completed project documents below.

Before creating a shared reference, check whether an existing README, contributing guide, design system, publishing guide, runbook, or other maintained source already serves the purpose. Use that source even if its filename differs. When a missing reference would help, recommend it and why; create it when the user agrees or has already authorized it as part of the work. Do not repeat an approval request already answered. Updating an existing affected reference is part of completing the change. ADRs follow their adoption rule below, not a separate optional-document approval gate.

| Document                         | When it adds value                                                                                                                     | Ownership and use                                                                                                                                                                                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ARCHITECTURE.md`           | The implemented system needs an overview of components, boundaries, and data flows.                                                    | Read for cross-cutting implementation work; update when the system changes. Describe current architecture and link to ADRs for rationale.                                                                                                                               |
| `docs/GLOSSARY.md`               | Domain terms recur across features or are easily confused.                                                                             | Own precise shared meanings; consult during specification and update when domain language changes.                                                                                                                                                                      |
| `docs/VISUAL_DESIGN.md`          | Shared visual conventions are being defined or changed and no existing design-system reference suffices.                               | Read before UI work; maintain shared conventions when they change. Ground them in the interface and agreed direction, distinguish proposals from adopted rules, and leave feature-specific interactions in `DESIGN.md`.                                                 |
| `docs/TESTING.md`                | Verification setup, check selection, or integration boundaries need explanation beyond scripts and CI.                                 | Read before planning/running verification; maintain reusable procedures and limitations. Scripts/CI own executable commands; feature matrices own results.                                                                                                              |
| `docs/PRODUCT.md`                | Users, purpose, core journeys, principles, or deliberate non-goals are unclear from existing documentation.                            | Read before scope decisions; update for agreed direction or implemented journey changes. Distinguish current capabilities from future direction and proposals. This is not a roadmap or feature approval mechanism.                                                     |
| `docs/DEPLOYMENT.md`             | Recurring release, deployment, or recovery procedures need explanation beyond existing automation or publishing/runbook documentation. | Read for release-impacting changes; maintain rollout order, compatibility, migrations, post-release checks, and recovery limits. Feature plans own deviations; matrices or linked release records own execution evidence. Procedures do not grant execution permission. |
| `docs/conventions/<topic>.md`    | A stable, non-obvious rule applies across features and is not adequately enforced or documented elsewhere.                             | Read for relevant changes; maintain reusable rules. Tooling owns mechanically enforced rules; feature plans or ADRs own feature-specific decisions.                                                                                                                     |
| `docs/adr/adr-NNN-kebab-case.md` | A significant architectural decision has actually been adopted.                                                                        | Record rationale at adoption under the agreed workflow; preserve history and link superseding decisions. Keep unimplemented proposals in feature plans.                                                                                                                 |

Use `.agent-specs/templates/project/` for the six named project references, `templates/conventions/CONVENTION.md` for conventions, and `templates/adr/ADR.md` for decisions (all under `.agent-specs/`). Fill templates from actual project context and remove irrelevant guidance; never create empty documents merely because a template exists.

## Maintaining the source of truth

- `PLAN.md` owns agreed scope, not task completion.
- `ACCEPTANCE_MATRIX.md` owns acceptance and verification evidence, not general project notes.
- `TASKS.md` owns implementation progress and the feature's lifecycle status, not architectural rationale.
- `DESIGN.md`, if present, owns detailed technical and UX design, not user-approved scope. Link to the project visual design reference for shared conventions.
- `RESEARCH.md`, if present, preserves meaningful investigation and uncertainty, not decisions.
- `HANDOFF.md`, if present, is a snapshot for resumption and may be deleted once unnecessary.
- Shared project references and ADRs follow the ownership and maintenance rules in the optional project document catalog above. Feature-specific release plans and exceptions stay in `PLAN.md`; verification evidence stays in `ACCEPTANCE_MATRIX.md` or its linked release records.

Approved scope changes must be brought back to the user before being incorporated as commitments. Keep artifacts understandable to someone resuming the project without the original chat history. **Progressive documentation:** do not create an optional document just because a template exists; prefer updating a single authoritative source over duplicating content.
