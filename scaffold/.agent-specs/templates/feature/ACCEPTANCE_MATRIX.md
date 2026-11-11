# Acceptance Matrix: [Feature title]

- **Feature ID:** `feature-NNN-kebab-case`
- **Verification status:** Not started

Each row must specify **observable behavior**, a verification method, and actual evidence. Write criteria when specifying the feature; update result and evidence during implementation. Do not mark `Pass` based solely on code inspection or optimism.

When release or recovery checks are part of the approved scope, include rows for the relevant rollout, migration, post-release behavior, and recovery outcomes. Record the version, environment, command or observation, and evidence link. Passing local tests does not establish production success or recoverability. Required checks awaiting release stay `Not run` or `Blocked`; checks explicitly outside this feature's scope belong in the plan's release handoff, not in invented passing rows.

| ID     | Requirement | Scenario / expected outcome                      | Verification method             | Result  | Evidence                     |
| ------ | ----------- | ------------------------------------------------ | ------------------------------- | ------- | ---------------------------- |
| AC-001 | FR-001      | [Given/when/then or clear expected result]       | [Test name or manual procedure] | Not run | [Add evidence when verified] |
| AC-002 | FR-002      | [Expected result, including important edge case] | [Test name or manual procedure] | Not run | [Add evidence when verified] |

## Result legend

- **Not run:** Not verified yet.
- **Pass:** Verified with evidence recorded above.
- **Fail:** Verified behavior does not meet the criterion.
- **Blocked:** Verification cannot proceed; explain why.

If the user approves changing or waiving a criterion, update the approved scope in `PLAN.md` and document that decision explicitly. Do not silently convert a failing criterion into a pass.

If a later feature supersedes this behavior, preserve these criteria, results, and evidence as historical records. Add a dated note under verification notes identifying the affected IDs and linking to the replacement feature's plan and acceptance matrix. A historical `Pass` does not verify the replacement; its matrix must record fresh evidence. See the supersession rules in `docs/WORKFLOW.md`.

For amendments, preserve existing rows and evidence and append dated verification runs below with criterion IDs, results, and evidence. Record new criteria in new rows. Recheck relevant existing behavior and explain any reliance on earlier evidence. Historical passes do not override later failures or missing required verification. See the amendment procedure in `docs/WORKFLOW.md`.

## Verification notes

[Commands, test environment, observations, limitations, and links to test reports. Leave as 'Not yet verified' during initial specification.]
