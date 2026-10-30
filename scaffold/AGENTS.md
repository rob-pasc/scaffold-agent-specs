# Repository Agent Instructions

These are the shared instructions for AI coding agents working in this repository. Keep tool-specific instructions (for example, Claude Code instructions) in their own thin adapter files rather than duplicating this document.

## Working principles

- Read this file before working, and read [`docs/WORKFLOW.md`](docs/WORKFLOW.md) when discussing, specifying, implementing, or completing a feature.
- Inspect relevant code, tests, and existing documentation before asking questions or proposing an approach. Don't ask for information the repository already answers.
- Prefer the smallest coherent change. Follow existing project conventions and avoid unrelated refactors. Consult relevant documents in `docs/conventions/` when that directory exists.
- Be transparent about assumptions, uncertainty, incomplete work, and failed or unrun checks. Never present unverified behavior as tested.
- Use interactive question tools when available; otherwise ask in chat. Ask focused questions that materially affect scope, behavior, UX, data, security, or architecture. Propose sensible defaults for minor details.
- Keep the human in control of scope and significant architectural tradeoffs.

## Feature workflow and approval gates

For **new features**, follow this sequence:

1. **Discover:** Discuss the idea with the user. Understand the problem, users, expected behavior, constraints, boundaries, and unresolved questions. Do not implement the feature or create its feature directory during discovery.
2. **Propose:** Present a concise scope summary covering the goal, in-scope and out-of-scope behavior, important acceptance outcomes, assumptions, and consequential open questions. Explicitly offer **accept / revise / discard**.
3. **Get approval:** Treat only a clear, affirmative user response as scope approval. If the user revises the proposal, summarize the revised scope and seek approval again. If discarded, do not create feature artifacts.
4. **Specify:** After approval, create `docs/features/feature-NNN-kebab-case/` and populate `PLAN.md`, `ACCEPTANCE_MATRIX.md`, and `TASKS.md` from `.agent-specs/templates/feature/`. You may run `npx scaffold-agent-specs feature "Title" --approved` to create the files (if the command is unavailable, copy the templates by hand); the CLI does not write the approved requirements for you. Add `DESIGN.md` for substantial UX/technical design and `RESEARCH.md` for findings worth preserving, only when needed. Create `HANDOFF.md` when a real session handoff is useful. Record the approved scope faithfully. Mark proposed technical choices as proposed, not approved.
5. **Stop at the spec boundary:** After writing the feature documents, summarize what was created and stop. **Do not start implementation** until the user explicitly requests it, possibly in a later session.
6. **Implement and verify:** On an explicit implementation request, review the feature documents and relevant code. Resolve blockers, surface consequential technical choices, then execute tasks, validate acceptance criteria, and keep the documents current.
7. **Finish:** Update related documentation, capture architectural decisions actually adopted, report verification evidence and remaining limitations, and mark the feature complete only when acceptance criteria are satisfied or exceptions explicitly accepted by the user.

Existing-feature work and ordinary fixes should follow the user's requested scope; do not force a new feature directory for every small change.

### Scope changes and technical decisions

- An approved feature scope is the baseline. Ask for renewed approval before materially changing promised behavior, exclusions, or acceptance criteria.
- Technical implementation details can evolve within that scope. Surface decisions that introduce major dependencies, migrations, security implications, substantial complexity, or broad architectural consequences before committing to them.
- Keep proposed decisions in the feature `PLAN.md`. Add a project-wide ADR **when a significant architectural decision has actually been adopted**, typically after implementation. For consequential decisions adopted earlier, record the ADR at adoption rather than losing the rationale. Never turn an unimplemented proposal into an accepted ADR.

## Feature documentation contracts

- **`PLAN.md`** explains _why and what_, including approved scope, requirements, constraints, risks, and the proposed technical direction.
- **`ACCEPTANCE_MATRIX.md`** defines objectively verifiable outcomes and records methods, results, and evidence. Do not claim a pass without evidence.
- **`TASKS.md`** is the authoritative checklist for implementation progress and holds the feature's lifecycle status. Keep items small and link them to acceptance IDs where practical.
- **`DESIGN.md`** is optional detailed technical/interaction design, not a second feature specification.
- **`RESEARCH.md`** is optional durable investigative findings, not an approved decision.
- **`HANDOFF.md`** is optional, temporary context for a session or agent transition. It must never supersede the plan, acceptance matrix, or task checklist.
- Feature directories use `feature-NNN-kebab-case`, with three-digit IDs starting at `001`. Choose the next number above the highest existing feature ID; never reuse a retired ID.
- Use stable IDs such as `FR-001` (requirement), `AC-001` (acceptance), and `T-001` (task) so documents can cross-reference each other.

## Documentation and architecture decisions

- Update relevant documentation **in the same change** when code changes behavior, architecture, configuration, developer setup, or public interfaces. Documentation is part of done, not an optional follow-up.
- Record durable, cross-cutting architectural decisions in `docs/adr/`. Use `.agent-specs/templates/adr/ADR.md` for the format; real ADRs start at `adr-001-...`.
- An ADR records context, the adopted decision, alternatives and tradeoffs, consequences, and references. Avoid ADRs for routine local implementation details.
- Do not write speculative ADRs during feature discovery or initial specification. Capture proposed approaches and uncertainties in `PLAN.md` instead.
- Keep docs concise and accurate; remove stale claims rather than merely appending new text.
- Practice **progressive documentation**: create an optional document only to solve a concrete problem. Prefer updating an existing source of truth over producing redundant or empty files.
- If maintained, keep `docs/ARCHITECTURE.md` aligned with the _implemented_ system, `docs/GLOSSARY.md` aligned with shared domain language, and `docs/conventions/` aligned with stable project-specific practices. Create them only when useful, from `.agent-specs/templates/project/` or `.agent-specs/templates/conventions/`. An adopted architecture decision still belongs in an ADR.

## Verification and completion

- Before claiming completion, run relevant tests, linters, type checks, and build checks supported by the repository, or explain precisely why they were not run.
- Update acceptance results with concrete evidence (test name, command, output summary, or a reproducible manual check). Never infer a pass from implementation alone.
- Keep `TASKS.md` synchronized with actual progress, including its status, which is the single lifecycle status for the feature. Do not mark blocked or incomplete work as done.
- Call out unresolved failures, missing coverage, migrations, and follow-up work explicitly.

## Git commits

Commit your work as you go, at points you judge sensible, without waiting to be asked. Good points include written feature specs, a completed task or coherent group of tasks, and a fix that resolves a verified problem.

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
