# Spec-driven Feature Workflow

This document expands the feature lifecycle required by [`AGENTS.md`](../AGENTS.md). Feature specifications live in `docs/features/`; reusable templates live in `.agent-specs/templates/`.

## Classifying a change

Before choosing a path, inspect the request, relevant implementation, existing requirements and exclusions, tests, and approval history. Classify the behavioral change, not its wording, line count, estimated effort, or the number of questions asked. State the classification and owning feature briefly when scope changes or the boundary is unclear.

Apply these rules in order:

1. **Fix:** restores an established contract without changing it. Identify the requirement, test, or other agreed behavior being restored; calling a request a "bug" is not evidence. Implement and verify under the user's requested scope without new feature documents. If intended behavior is unknown or sources conflict, resolve that uncertainty before classifying dependent work.
2. **Implementation detail:** fulfills approved outcomes without adding or changing the observable contract. Proceed within authorized implementation scope, recording meaningful choices in the owning plan when one exists. Refactoring and necessary validation/error feedback may qualify; a new recovery policy does not.
3. **Behavioral replacement:** changes an existing approved requirement or exclusion, including changing a default or removing a promised outcome. Use the new-feature workflow and [the supersession procedure](workflow/CHANGE_HISTORY.md#superseding-earlier-feature-specifications), identifying exactly what changes. This takes precedence over amendment even for a tiny change. For an unimplemented feature, revise its scope through Phase 2 and update its specification instead; preserve the approval/change history, and obtain implementation authorization for the revised scope.
4. **Amendment:** adds a bounded variation of an existing feature's outcome. All of the following must hold: an existing feature clearly owns the outcome; existing requirements and exclusions remain valid; there is no distinct user outcome, separate operation, or new workflow; acceptance coverage extends existing scenarios rather than establishing a separate behavioral contract. Read and follow [the amendment procedure](workflow/CHANGE_HISTORY.md#amending-an-existing-feature) for active or completed features.
5. **New feature:** any other added capability, including a distinct user outcome or independently useful operation. Follow Phases 1–5 even when requested directly or easy to implement. If there is no existing feature to own an addition, use this path rather than recording new scope only in a commit message.

"Independently useful" means a distinct user outcome, not technical independence: undo depends on an existing action but adds a recovery operation. A new view, report, or history browser normally adds an outcome. An optional output format for an existing command can be an amendment if the existing contract permits it; changing its promised default is a replacement. Extra coverage for empty inputs or the same formatting option does not by itself make a new feature. New permissions, retention rules, recovery semantics, or journeys introduce separate contracts that cannot be hidden by combining acceptance rows. Neither sentence length nor a numerical acceptance-criterion threshold decides classification.

For mixed requests, separate independently classifiable parts and identify their dependencies. Do not use a fix or amendment to carry an unrelated new capability through a lighter path. If information needed to distinguish paths is missing, ask a focused question; do not silently assume the lighter path.

### Classification and authorization are separate

- A specific request to implement a qualifying fix or amendment authorizes that stated work. A request to explore or propose does not authorize implementation. For an agent-proposed amendment, obtain explicit scope approval and implementation authorization before building; these may be given together. Record amendment scope before implementation.
- Consequential unresolved choices require human input regardless of classification. Asking and answering those questions does not waive a new feature's proposal, specification, or separate implementation gate.
- For a new feature or replacement, reuse prior approval only when it clearly covers the same proposed scope and workflow stage. Otherwise follow the applicable gates. Routine technical choices within authorized scope do not need another approval.
- Significant dependencies, destructive/data-modifying migrations, security-sensitive choices, and broad architectural consequences still require human input even when they are implementation details. Purely additive migrations that leave existing data untouched may proceed within scope; record and report them.

## Phase 1: Discover (conversation only)

- Read existing code and documentation when relevant, then explore the user's idea collaboratively. Consult `docs/PRODUCT.md` or the existing product reference when present to understand users, core journeys, and agreed boundaries; it does not authorize new feature scope.
- Before classifying overlapping work, read and follow [Finding the current contract](features/README.md#finding-the-current-contract). Consult the feature index when present and search plan/acceptance contents by domain terms and code symbols; folder names alone are insufficient. Follow amendment and replacement chains, distinguish planned from effective behavior, and identify owning requirement IDs and unresolved conflicts in the proposal.
- Ask focused clarifying questions, using the agent's interactive question interface where available or normal chat otherwise. Prefer small, purposeful batches over long questionnaires.
- Establish the problem, target users, expected behaviors, important edge cases, constraints, dependencies, and exclusions.
- Ask how the user wants the feature verified when that affects effort or tooling, for example browser end-to-end tests or checks on a device or service the agent can't reach. Read `docs/TESTING.md` or the existing testing/contributing guide when present. If the project already has a test approach, follow it instead of asking.
- Establish the completion boundary from the request and existing contributing/review rules: locally verified handoff, reviewed change, merged change, or released behavior. Identify required reviewers and integration checks. Reuse existing authorization; ask only when the boundary or a consequential review requirement is unresolved. An implementation request does not itself authorize pushing, merging, or releasing.
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

Write the complete proposal in the conversation before asking for a decision. A question interface may collect open choices, but ask for acceptance only after the user can see the whole proposal, including the defaults that will apply.

Ask the user to **accept, revise, or discard**.

- **Accept:** proceed to specification.
- **Revise:** discuss, re-propose, and seek explicit approval again.
- **Discard:** stop without creating feature artifacts.
- Silence, vague assent, or approval of a different subject does not count as approval.

## Phase 3: Specify (after accepted scope)

Before creating a feature directory, read and follow [Feature allocation](workflow/ALLOCATION.md). Prefer the CLI when available; otherwise copy the templates by hand. Check for duplicate feature numbers before committing and before integrating branches. Populate all copied prompts from approved scope before continuing.

Required and optional documents:

| File                     | Purpose                                                                        | Required?      |
| ------------------------ | ------------------------------------------------------------------------------ | -------------- |
| `PLAN.md`                | Approved product scope, requirements, constraints, proposed technical approach | Yes            |
| `ACCEPTANCE_CRITERIA.md` | Testable criteria plus verification methods, results, and evidence             | Yes            |
| `TASKS.md`               | Ordered, actionable implementation checklist, mapped to criteria               | Yes            |
| `DESIGN.md`              | Technical/UX design detail useful for implementation or review                 | Optional       |
| `RESEARCH.md`            | Investigation findings useful to retain for future work                        | Optional       |
| `HANDOFF.md`             | Short-lived context for work that will resume elsewhere                        | Only if useful |

Write the approved scope into `PLAN.md`. Draft acceptance criteria and tasks that correspond to that scope. Use stable requirement (`FR-001`), acceptance (`AC-001`), and task (`T-001`) IDs and cross-reference them where practical. State each criterion's verification method as the observable check (for example "journey completes in a browser at 360 px width"), not a specific test tool, unless the user or the project has already chosen one; tooling is an implementation choice. Put unresolved technical questions in the plan, rather than inventing answers. Create `DESIGN.md` when a separate explanation would make technical or UX choices easier to implement or review, and `RESEARCH.md` when retaining findings would avoid repeated investigation. A short, focused document is sufficient; neither requires a large or complex feature. Do not write an ADR for an unimplemented option.

Fill every section of the copied `PLAN.md`, `ACCEPTANCE_CRITERIA.md`, and `TASKS.md` templates. Keep the template's headings and order; do not merge, rename, or drop sections to save space. Where a section does not apply, write `None` or `Not applicable` with a one-line reason rather than removing it. Sections the template marks as conditional, such as "Release and recovery (when applicable)", follow their own instructions. Give each requirement, criterion, and task a single observable outcome; split combined behavior into separate IDs. Write enough detail for someone resuming without the original conversation to implement and verify the feature.

Record the review and integration contract in the plan: completion boundary, required review (self-review, human, or another reviewer), who owns it, and applicable CI/merge checks. Follow existing repository rules and explicit user instructions. Without another requirement, use a locally verified handoff with self-review; do not invent a mandatory PR or independent reviewer. Propose independent review for consequential security, data-loss, or broad architectural risks when existing policy does not settle the need. Required review and integration outcomes belong in acceptance criteria, with execution and finding-resolution tasks in `TASKS.md`.

For applicable features, fill the plan's "Release and recovery" section: rollout order, compatibility, migrations, irreversible steps, recovery limits, and observable post-release checks. Link to shared procedures rather than copying them. Put required verification outcomes in `ACCEPTANCE_CRITERIA.md` and execution work in `TASKS.md`; identify ownership and prerequisites for release work explicitly outside scope. Do not add a release process to features that do not need one.

If the approved scope changes behavior owned by an earlier feature, fill the plan's "Related and superseded features" section after reading [the supersession procedure](workflow/CHANGE_HISTORY.md#superseding-earlier-feature-specifications). Treat the relationship as planned until the replacement is implemented.

Create or update the affected navigation entries using [Maintaining the feature index](features/README.md#maintaining-the-feature-index). Keep scope and evidence in their owning documents; the index does not authorize work.

**Then stop.** Tell the user what was scaffolded, identify open decisions or blockers, and wait for an explicit implementation request. Feature approval is **not** implementation authorization.

## Phase 4: Implement (separate explicit request)

- Re-read the active feature's plan, acceptance criteria document, and tasks, plus any optional design/research documents; inspect relevant code and applicable `docs/conventions/` documentation.
- Check readiness: requirements coherent, blockers identified, implementation direction sensible, verification approach practical. Consult the existing testing guide for setup, check selection, and integration boundaries. Record any blockers under "Dependencies and blockers" in `TASKS.md`, then set its status to `Ready`, and to `In progress` once work starts.
- Seek human input before significant new dependencies, migrations that modify or delete existing data, security-sensitive choices, or changes to approved behavior. Purely additive migrations (for example, a new table or store that leaves existing data untouched) need no prior approval, but record them in the plan and report them. Technical refinement that stays within scope usually needs no additional approval.
- Classify discoveries and requested changes using the procedure above before building them. Amendments extend the owning feature's documents; new capabilities and replacements follow their respective gates. Necessary validation and error feedback may be implementation details, but new retry or recovery semantics can change the contract. Supporting scripts or security hardening qualify as implementation details only when they preserve that contract; their names alone do not exempt them from scope review.
- Prepare and verify release/recovery steps within the approved scope. Use the project's existing authorization process before deploying, publishing, or modifying production data; a written procedure or implementation request alone is not authorization. Reuse explicit authorization already given rather than asking again.
- Work through `TASKS.md`, updating checked items to reflect reality. Keep plan notes synchronized when implementation choices change.
- Add or update tests and record concrete results in `ACCEPTANCE_CRITERIA.md`.
- If interrupted, add or refresh `HANDOFF.md` with the current task, blockers, commands run, and the next actionable step.

## Phase 5: Verify, review, and close

- Review each acceptance criterion against observable evidence. Use `Pass`, `Fail`, `Blocked`, or `Not run`; never invent a result. If a criterion is waived or removed, record the user's approval and update scope accordingly.
- Run applicable checks and document anything not run.
- Review the final diff against approved requirements and exclusions, not just the tests: check correctness, regressions, failure paths, relevant security/data risks, and unintended changes. Record the reviewed revision (commit or an identifiable uncommitted diff), reviewer, findings, and disposition in `ACCEPTANCE_CRITERIA.md` or a linked review record. Label self-review honestly; it is not independent approval.
- Obtain the review required by the plan and repository policy. Fix blocking findings within scope and recheck affected behavior; classify findings that would expand scope before implementing them. When a review accepts a deviation from a written requirement or acceptance criterion, fix the implementation or update the requirement and criterion so they describe the accepted behavior; a change to approved behavior needs user approval and a scope change log entry. Never leave a passing review that contradicts the plan. Record explicitly accepted exceptions and their approver. Unavailable required reviewers or unresolved blocking findings prevent completion.
- Verify the integration checks required at the agreed boundary. When merge is in scope and authorized, check the actual merge result and required CI; a local branch pass does not establish merged correctness. Reassess review and rerun affected checks after code changes or conflict resolution; earlier evidence applies only where the reviewed behavior remains unchanged. Do not push or merge merely to satisfy a checklist without authorization.
- Reconcile `PLAN.md` with what was implemented: its technical approach, assumptions, and references (ADRs, related features) must describe the implementation, with no stale claims left, and any behavior added during implementation must appear in its requirements.
- For implemented replacements, reconcile supersession links and historical verification notes in the affected earlier features after reading [the supersession procedure](workflow/CHANGE_HISTORY.md#superseding-earlier-feature-specifications). Apply this reconciliation to the active plan; preserve earlier specifications as historical records with explicit supersession notes.
- Reconcile affected feature index entries and links with the current owning requirements and effective replacement notes, following [the index maintenance rules](features/README.md#maintaining-the-feature-index). Do not treat the index as evidence of completion or deployment.
- Update affected user/developer/project documentation in the same change. Read the [project document catalog](workflow/PROJECT_DOCS.md) to identify relevant references and their ownership; maintain existing equivalents instead of creating duplicates.
- Create or update the root `README.md` when setup, usage, commands, or project status change, keeping its status line current. Summarize and link to feature plans rather than restating requirements.
- Review the catalog for missing references that would help future work. Create concise documents when its triggers fit the authorized work, following its creation policy, and explain their purpose in the handoff.
- Report release state separately from implementation completion: distinguish locally verified, ready for release, and actually released behavior, naming the version/environment when known. Required release or recovery checks remain `Not run` or `Blocked` until evidenced; do not mark the feature complete while they remain required and unverified. If release is explicitly outside the approved scope, implementation may be complete once its acceptance criteria pass; record the remaining release work, owner (or unassigned ownership), and prerequisites in the plan and final handoff without claiming it shipped. Do not introduce a second feature lifecycle status.
- Create ADRs for meaningful architectural decisions **actually adopted**. Normally do this after the implementation is known; for a consequential choice adopted earlier, record it at that point.
- Report the agreed completion boundary, review outcome, integration state, and any deferred work with owner (or unassigned ownership) and prerequisites. A locally complete handoff must not imply independent approval, merge, or release. Required review and integration checks cannot be silently deferred to mark work complete.
- Report what was implemented and, if applicable, released, what was validated, any limitations, and whether the feature is complete. A feature is not complete while required acceptance criteria, review, or integration checks remain failing, blocked, or unverified, unless the user explicitly accepts recorded exceptions permitted by repository policy.
- Set the `TASKS.md` status to `Complete` only when that holds; otherwise use `Implemented (verification pending)` and list what remains. Append a dated completion event in its lifecycle history with covered requirement/acceptance IDs and a reference to verification evidence; preserve earlier events.

## Maintaining the source of truth

- `PLAN.md` owns agreed scope, not task completion.
- `ACCEPTANCE_CRITERIA.md` owns acceptance and verification evidence, not general project notes.
- `TASKS.md` owns implementation progress and the feature's lifecycle status, not architectural rationale.
- `DESIGN.md`, if present, owns detailed technical and UX design, not user-approved scope. Link to the project visual design reference for shared conventions.
- `RESEARCH.md`, if present, preserves meaningful investigation and uncertainty, not decisions.
- `HANDOFF.md`, if present, is a snapshot for resumption and may be deleted once unnecessary.
- Shared project references and ADRs follow the ownership and maintenance rules in the [project document catalog](workflow/PROJECT_DOCS.md). Feature-specific release plans and exceptions stay in `PLAN.md`; verification evidence stays in `ACCEPTANCE_CRITERIA.md` or its linked release records.

Approved scope changes must be brought back to the user before being incorporated as commitments. Keep artifacts understandable to someone resuming the project without the original chat history. **Progressive documentation:** actively consider optional documents when their triggers fit. Start with a concise, useful reference and expand it as the project grows. Reuse an authoritative source when one already serves the purpose; a template alone is not a reason to create a document.

## Amending an existing feature

Before amending active or completed scope, read and follow [the amendment procedure](workflow/CHANGE_HISTORY.md#amending-an-existing-feature). Preserve history and reopen expanded unverified scope honestly.

## Superseding earlier feature specifications

Before replacing earlier behavior, read and follow [the supersession procedure](workflow/CHANGE_HISTORY.md#superseding-earlier-feature-specifications). Preserve earlier evidence and identify exactly which requirements are replaced.

## Optional project document catalog

Before creating shared references or reconciling documentation at completion, read [the project document catalog](workflow/PROJECT_DOCS.md). Reuse existing sources and create only useful, authorized documents.
