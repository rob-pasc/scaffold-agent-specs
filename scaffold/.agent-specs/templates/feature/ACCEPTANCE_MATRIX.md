# Acceptance Matrix: [Feature title]

- **Feature ID:** `feature-NNN-kebab-case`
- **Verification status:** Not started

Each row must specify **observable behavior**, a verification method, and actual evidence. Write criteria when specifying the feature; update result and evidence during implementation. Do not mark `Pass` based solely on code inspection or optimism.

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

## Verification notes

[Commands, test environment, observations, limitations, and links to test reports. Leave as 'Not yet verified' during initial specification.]
