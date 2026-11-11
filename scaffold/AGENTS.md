# Repository Agent Instructions

These shared instructions apply to all coding agents. Keep tool-specific adapter files thin and link here instead of duplicating rules.

## Working principles

- Inspect relevant code, tests, and documentation before asking questions or proposing an approach. Do not ask for information the repository already answers.
- Prefer the smallest coherent change, follow project conventions, and avoid unrelated refactors. Consult relevant `docs/conventions/` documents when present.
- State assumptions, uncertainty, incomplete work, and failed or unrun checks honestly. Never claim unverified success.
- Use interactive question tools when available, otherwise chat. Ask focused questions about consequential choices and choose sensible defaults for minor details.
- Keep the human in control of scope and significant architectural tradeoffs.

## Feature workflow and approval gates

Read [`docs/WORKFLOW.md`](docs/WORKFLOW.md) when discussing, specifying, implementing, or completing a feature. It owns the detailed procedure and document contracts.

For new features:

1. Discuss the problem and inspect the repository before proposing scope. Do not implement or create feature artifacts during discovery.
2. Present scope, acceptance expectations, exclusions, and consequential open questions. Offer **accept / revise / discard**; obtain clear affirmative approval, including renewed approval after revisions.
3. After approval, populate `PLAN.md`, `ACCEPTANCE_MATRIX.md`, and `TASKS.md` from the feature templates. Record approved scope faithfully and distinguish proposed technical choices from adopted decisions.
4. **Stop after specification.** Summarize the documents and blockers. Start implementation only when the user explicitly requests it.
5. Implement within approved scope, keep documents current, and verify acceptance outcomes before declaring completion.

Existing-feature work and ordinary fixes follow the user's requested scope; do not force a new feature directory for every small change.

### Scope and decision boundaries

- Ask before changing promised behavior, exclusions, or acceptance criteria, or adding an independent user-facing capability, however small.
- Implementation choices necessary to fulfill agreed outcomes may proceed without renewed approval. This includes validation and error feedback needed to make an agreed form work coherently. Record meaningful choices in the plan. New capabilities such as undo, additional management actions, or a changed recovery policy need approval.
- Surface major dependencies, migrations that modify or delete existing data, security-sensitive choices, substantial complexity, and broad architectural consequences before committing to them. Follow the workflow for technical refinements within scope.

## Documentation and completion

- Update affected documentation in the same change as behavior, architecture, configuration, setup, or public-interface changes.
- Respect document ownership: `PLAN.md` owns scope and approach; `ACCEPTANCE_MATRIX.md` owns verification evidence; `TASKS.md` owns progress and the sole feature lifecycle status. Optional documents must not supersede them.
- Create optional documents only when useful. Prefer an existing source of truth and remove stale claims. Follow the workflow's guidance for shared visual design, architecture, glossary, testing, product context, and conventions documents. Read existing product context before scope decisions and the testing guide before planning or running verification; reuse equivalent project documentation.
- Record significant adopted architectural decisions in `docs/adr/`; keep unimplemented proposals in the plan. Use the ADR template and avoid ADRs for routine local details.
- Run relevant tests, linters, type checks, and builds before claiming completion, or explain precisely why checks were not run. Record concrete evidence; implementation alone is not a pass.
- Mark a feature complete only when acceptance criteria pass or the user explicitly accepts exceptions. Report unresolved failures, missing verification, migrations, and follow-up work.

## Git commits

Follow the user's explicit commit preference first, including requests to review diffs before commits or to leave work uncommitted. Otherwise, commit your work as you go, without waiting to be asked. Commit approved feature specs on their own. During implementation, commit at **milestones**: points you would want to return to. A milestone passes the relevant checks and has one theme you can describe in a sentence, such as the domain logic for a feature with its tests, or the UI built on top of it. A feature typically takes a few commits; neither one per task nor one per feature. Also commit before risky steps (large refactors, migrations, dependency changes) and before ending a session. Split a commit that would mix unrelated concerns.

- Run the relevant checks before committing. If you commit while something is failing or incomplete, say so in the message.
- Don't commit secrets, credentials, local environment files, or build output that the repository doesn't already track.
- Don't push, rewrite or amend existing history, or change branches without the user's request.

Use **Conventional Commit-style** subjects with a meaningful scope:

```text
<type>(<scope>): <imperative summary>

<Prose describing what changed and why it matters.>
```

- Example subjects: `feat(web): introduce user statistics page`, `fix(api): reject invalid date ranges`, `docs(adr): record reporting storage decision`.
- Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `build`, `ci`.
- Use a lowercase type and a short, recognizable scope (app, package, or subsystem). Write an imperative, descriptive subject; aim to stay within 72 characters.
- For nontrivial changes, write a **prose body** explaining the substance and rationale, not a dump of filenames or generic boilerplate. Separate the subject and body with a blank line, and wrap prose at roughly 72–80 columns.
- Keep commits focused and truthful. Note breaking changes explicitly when applicable.

Example:

```text
feat(web): introduce user statistics page

Add a date-range filter and daily activity chart so users can inspect
engagement without exporting raw events. Reuse the existing reporting
endpoint to keep the change within the current data architecture.
```
