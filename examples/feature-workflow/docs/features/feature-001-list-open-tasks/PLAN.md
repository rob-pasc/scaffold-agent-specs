# Feature 001: List open tasks

- **Feature ID:** `feature-001-list-open-tasks`
- **Scope status:** Approved in the illustrative conversation
- **Scope approval date:** 2026-11-11 (example)

## Summary and desired outcome

Task consumers need to retrieve open tasks without repeatedly implementing their own filtering. Add a function over the existing in-memory task model.

## Approved scope

In scope: filter task records by their boolean completion state, preserve their order, handle lists with no open tasks, and preserve the input.

Out of scope: UI controls, sorting, persistence, and external-input validation.

## Functional requirements

- **FR-001:** `listOpenTasks(tasks)` returns only records whose `completed` value is false, in source order.
- **FR-002:** Empty and fully completed lists produce an empty array.
- **FR-003:** Return a new array without changing the source array or its records.

## Constraints, journeys, and edge cases

Use JavaScript with no dependencies. The caller supplies an array of task records with `title` and boolean `completed` fields. A mixed list returns its open items; a list with none returns `[]`.

## Technical approach

Initially proposed: use `Array.prototype.filter`. Adopted during implementation in [open-tasks.js](../../../open-tasks.js). Returned records retain their original identity; deep copying is unnecessary to satisfy input preservation during this operation.

## Dependencies, risks, and open questions

No blockers. Input validation belongs to the existing task store. Callers can mutate returned records later because the records are shared; this function itself does not mutate them. No project-wide architectural decision or ADR is needed.

## Scope change log

| Date       | Change                            | Approval                                                 |
| ---------- | --------------------------------- | -------------------------------------------------------- |
| 2026-11-11 | Initial scope; no later expansion | Illustrative human: “Accept that scope. Write the spec.” |

Implementation was separately authorized: “Implement the approved feature now. Leave the changes uncommitted so I can review them.” See the [walkthrough](../../../README.md).

## References

- [Acceptance matrix](ACCEPTANCE_MATRIX.md)
- [Tasks](TASKS.md)
