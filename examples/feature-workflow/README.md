# Worked example: list open tasks

This small, runnable feature demonstrates the full workflow. The conversation below is illustrative, not a record of a real customer's approval. The implementation and tests are real. Example files live outside `scaffold/` and are not installed into users' projects.

## 1. Request and proposed scope

**Human:** “Our task list includes completed items. Add a way to get just the open tasks.”

**Agent, after inspecting the task model:** “The store already supplies an array of records with a title and a boolean `completed` field. I propose a `listOpenTasks(tasks)` function that returns open tasks in their existing order, returns an empty array when none are open, and does not modify the input. UI controls, sorting, persistence, and validation of external input are out of scope. Accept, revise, or discard?”

## 2. Explicit scope acceptance

**Human:** “Accept that scope. Write the spec.”

The agent creates `docs/features/feature-001-list-open-tasks/`, populates the three required documents, and stops. At this point the task status is `Specified`, all tasks are unchecked, and every acceptance result is `Not run`. No implementation or verification success is claimed.

The linked documents show their final, reconciled state after the following implementation and verification steps:

- [PLAN.md](docs/features/feature-001-list-open-tasks/PLAN.md): agreed scope and technical approach.
- [ACCEPTANCE_CRITERIA.md](docs/features/feature-001-list-open-tasks/ACCEPTANCE_CRITERIA.md): observable outcomes and recorded evidence.
- [TASKS.md](docs/features/feature-001-list-open-tasks/TASKS.md): completed work and lifecycle status.

**Agent:** “The three specification documents are ready. No blocking questions remain. Implementation has not started.”

## 3. Separate implementation request

**Human:** “Implement the approved feature now. Leave the changes uncommitted so I can review them.”

The agent checks readiness, moves the task status through `Ready` and `In progress`, and implements [open-tasks.js](open-tasks.js). Using `Array.prototype.filter` is a local implementation choice within the approved scope. It needs no new approval or ADR. No optional design or handoff document is needed for this small feature.

## 4. Verification

From the repository root, run:

```sh
node --test examples/feature-workflow/open-tasks.test.js
```

The [tests](open-tasks.test.js) cover the mixed list, empty and fully completed lists, ordering, and input preservation. The acceptance criteria document records the actual run and maps each outcome to its test. The repository's `npm test` also discovers these tests.

## 5. Final handoff

After the checks recorded in the acceptance criteria document, the agent can report:

> Implemented `listOpenTasks(tasks)`. It returns open tasks in source order and leaves the original array and records unchanged. All three acceptance tests passed. The plan, acceptance criteria document, and tasks are reconciled, and the feature is complete. The function expects the existing validated task model; UI, sorting, persistence, and external-input validation remain outside the agreed scope. Changes are ready for review and left uncommitted as requested.

Completion is supported by test evidence, not merely by the existence of code. If a check had failed or could not run, the corresponding acceptance result would stay `Fail`, `Blocked`, or `Not run`, and the feature would not be marked complete.
