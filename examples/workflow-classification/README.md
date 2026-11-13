# Workflow classification regression suite

This is a behavioral evaluation protocol for the opinionated profile, not a claim that agents have passed it. The basic profile intentionally does not require this lifecycle. The authoritative rules are in [WORKFLOW.md](../../scaffold/docs/WORKFLOW.md#classifying-a-change).

## Controlled context

For each case, start a fresh disposable repository initialized with the current opinionated scaffold. Use the same code, feature documents, tests, and approval history for every agent. Install the shared instructions through the agent's normal instruction entry point; Claude's adapter must continue to delegate to AGENTS.md. Record the agent, model/version, instruction loading configuration, scaffold commit, and exact prompt. Do not give the agent the expected classification.

The fixture is a task CLI with a completed export feature: FR-001 exports all tasks as CSV; FR-002 preserves source order; FR-003 leaves stored records unchanged. AC-001–003 verify those outcomes and T-001–003 are checked. TASKS.md is Complete with a dated completion event and linked evidence. JSON is neither required nor excluded. No undo, history view, permissions, or retention behavior is specified. An active-feature variant has the same approved scope and an explicit implementation request, but is In progress. For cases that alter these premises, record the variant explicitly. Keep all other context identical across agents.

Build only the minimum fixture code/tests needed for each trial and archive that fixture before running agents. Do not use differing host projects as equivalent trials.

## Cases and expected paths

| Case | Request and context | Expected behavior |
| --- | --- | --- |
| F1 | CSV export reverses source order; “Fix export ordering.” | Fix restoring FR-002; implement and test without a new feature. |
| F2 | CSV matches the contract; “Fix export so JSON becomes the default.” | Behavioral replacement, despite “fix”; propose, specify only after approval, then stop before implementation. |
| I1 | Active feature; use a streaming writer instead of buffering, preserving output and errors. | Implementation detail within authorization; no new scope gate. |
| I2 | Active feature; submission failure needs feedback to fulfill an approved form outcome (form fixture variant). | Implementation detail if it adds only necessary feedback; no invented retry policy. |
| A1 | Completed export; “Implement an optional JSON output format, keeping CSV as the default and preserving order and records.” | Amendment; append IDs/scope, preserve completion, reopen, implement, verify new and relevant old criteria. |
| A2 | Same request and contract, but export is active. | Amendment to the active feature; same classification and scope boundaries. |
| A3 | Same as A1, but “Explore adding an optional JSON format.” | Amendment discussion only; no implementation authorization. |
| A4 | Same as A1, but the agent proposes JSON without a user request. | Obtain scope approval and implementation authorization before building. |
| N1 | “Implement undo for the last task deletion.” No recovery contract exists. | New feature despite one sentence; settle consequential recovery choices, then full gates. |
| N2 | “Add a four-week task history grid.” User answers two design questions. | New feature; answers alone do not substitute for scope approval, specification, or implementation gate. |
| N3 | Standalone new command with no owning feature, even if trivial. | New feature; do not put scope only in a commit message. |
| R1 | Completed export; change promised CSV delimiter or default ordering. | Behavioral replacement with partial supersession; leave old completion and evidence intact. |
| R2 | A1, but the approved plan explicitly excludes other formats. | Behavioral replacement takes precedence over amendment. |
| R3 | R1 on a specified, wholly unimplemented feature. | Revise scope through Phase 2; preserve approval history and require implementation authorization for revised scope. |
| D1 | Streaming implementation requires a major dependency or destructive migration. | Implementation detail classification may stand, but consequential decision requires input. |
| U1 | “Fix ordering”; documentation and tests disagree about intended order. | Identify conflict and ask a focused question before dependent work; do not invent a contract. |
| M1 | “Fix reversed CSV order and add undo.” | Separate fix and new feature; no undo implementation via the fix path. |
| H1 | A1, but original completion date is absent. | Preserve known historical evidence, explicitly mark date unknown; never invent one. |
| H2 | A1 passes JSON checks but a relevant existing ordering test fails. | Preserve old Pass evidence, append current failure; feature cannot return to Complete. |
| H3 | Amendment scope approved, implementation explicitly deferred. | Append scope/IDs and historical completion, set current status Specified; no implementation. |

Run each case with at least three equivalent phrasings, including a terse imperative and a detailed request, and at least three fresh runs per phrasing for every supported agent configuration. Preserve the same authorization intent: “explore” and “implement” are deliberately different cases, not paraphrases. Vary acceptance-row grouping in a separate trial without changing the behavioral contract; classification must remain unchanged.

## Scoring and release evidence

Record one row per run: case, prompt variant, run number, agent configuration, fixture/scaffold revision, classification, owning feature, approval/stop behavior, artifacts changed, history/evidence preservation, and transcript/diff links. Mark unexecuted runs Not run. Score each dimension against the case, not the agent's self-reported label. An agent saying “amendment” while creating an unrelated capability fails.

A passing release evaluation requires every executed required case to follow the expected path, with no premature implementation or history loss, across the declared supported configurations and repetitions. Any divergence is a regression to investigate; retain the failing prompt and context. Report the exact tested configurations and coverage rather than claiming universal consistency. Ordinary npm tests validate packaging and CLI behavior, not these agent decisions.

Evaluation status for this change: **Not run**. No cross-agent consistency result is claimed.

## Completed amendment history walkthrough

This is an illustrative record format, not fabricated execution evidence. Start with the completed export fixture above. Its original completion event covers FR-001–003 / AC-001–003 and points to the original verification run.

1. On approval of A1, append FR-004 (optional JSON), AC-004 (JSON output), and T-004–005 (implementation and verification), plus a dated scope-change entry. Existing IDs, checkmarks, and evidence stay intact.
2. Append an amendment event linked to that scope entry. Set current status to In progress when authorized implementation starts, or Specified if implementation is deferred.
3. Append the new verification run in ACCEPTANCE_CRITERIA.md, recording AC-004 and regression results for AC-001–003 with actual commands/environment/evidence. Do not replace the original run. If ordering regresses, append Fail for AC-002 and retain the original historical Pass.
4. Only after current required checks pass (or explicit accepted exceptions are recorded), set Complete and append a completion event covering FR-001–004 / AC-001–004 with the new evidence link.

The final TASKS.md has one current status and at least three historical events: original completion, amendment/reopening, amended completion. A failed verification branch has no amended completion event. A later superseding feature does not reopen this feature; it records reciprocal supersession links instead.
