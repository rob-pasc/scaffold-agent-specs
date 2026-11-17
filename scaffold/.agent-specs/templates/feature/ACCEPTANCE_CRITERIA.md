# Acceptance Criteria: [Feature title]

- **Feature ID:** `feature-NNN-kebab-case`
- **Verification status:** Not started

Defines the feature’s acceptance criteria and records how each criterion was verified, including results and evidence.

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

If a later feature supersedes this behavior, preserve these criteria, results, and evidence as historical records. Add a dated note under verification notes identifying the affected IDs and linking to the replacement feature's plan and acceptance criteria document. A historical `Pass` does not verify the replacement; its acceptance criteria document must record fresh evidence. See the supersession rules in `docs/workflow/CHANGE_HISTORY.md`.

For amendments, preserve existing rows and evidence and append dated verification runs below with criterion IDs, results, and evidence. Record new criteria in new rows. Recheck relevant existing behavior and explain any reliance on earlier evidence. Historical passes do not override later failures or missing required verification. See the amendment procedure in `docs/workflow/CHANGE_HISTORY.md`.

## Review and integration evidence

[Record the agreed completion boundary and link the plan's review contract. Include required review/integration outcomes as acceptance rows above. Until performed, leave results Not run or Blocked.]

[For each review, record date, reviewer, reviewed commit or identifiable uncommitted diff, findings, resolution, and evidence link. Distinguish self-review from independent review. Record blocking findings and any explicitly approved exceptions; never invent approval. If a review accepts a deviation from a requirement, update that requirement and its criterion (with approval when approved behavior changes) or fix the code; do not leave them contradicting the result. After changes, record affected rechecks and whether renewed review is required.]

[Record required CI results and the actual merge revision when merge is in scope. If review, merge, or release is outside the completion boundary, identify deferred work and its owner/prerequisites in the plan and handoff without claiming it happened.]

## Verification notes

[Commands, test environment, observations, limitations, and links to test reports. Leave as 'Not yet verified' during initial specification.]
