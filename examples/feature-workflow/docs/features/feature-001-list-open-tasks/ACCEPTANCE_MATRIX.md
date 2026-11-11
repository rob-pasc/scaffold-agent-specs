# Acceptance Matrix: List open tasks

- **Feature ID:** `feature-001-list-open-tasks`
- **Verification status:** Verified

| ID     | Requirement | Expected outcome                                                        | Verification method                                                 | Result | Evidence                |
| ------ | ----------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- | ------ | ----------------------- |
| AC-001 | FR-001      | Mixed list returns only open tasks, in source order                     | Test `AC-001: returns only open tasks in their original order`      | Pass   | Passed in the run below |
| AC-002 | FR-002      | Empty and fully completed lists return `[]`                             | Test `AC-002: empty and fully completed lists return an empty list` | Pass   | Passed in the run below |
| AC-003 | FR-003      | A new result array is returned without mutating frozen input or records | Test `AC-003: leaves the source array and task records unchanged`   | Pass   | Passed in the run below |

## Verification notes

Verified on 2026-11-11 with Node.js v24.15.0 on Linux. `npm test` ran all three example tests successfully alongside the CLI and packaging tests. Each row maps to the named test in [open-tasks.test.js](../../../open-tasks.test.js).

The focused command is `node --test examples/feature-workflow/open-tasks.test.js`. During this run, sandboxed child-process output capture was broken, so the full `npm test` run used the permitted execution environment outside the sandbox. All three example tests also passed inside the sandbox with `node --test --test-isolation=none examples/feature-workflow/open-tasks.test.js`.

These checks verify the in-memory function only; no UI or persistence behavior is claimed.
