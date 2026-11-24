# Architecture Decision Records

Record **significant architectural decisions actually adopted** by this project here. Do not create speculative ADRs during feature discovery or initial specification; capture proposals in the relevant `PLAN.md` instead. If a consequential decision is adopted before the feature is fully implemented, write its ADR at the point of adoption.

- The reusable format lives in `.agent-specs/templates/adr/ADR.md`; keep templates out of this directory.
- Number real ADRs `adr-001-short-description.md`, `adr-002-short-description.md`, and so on. Never renumber an existing ADR.
- Describe context, the adopted decision, alternatives, consequences, and relevant feature/code references.
- If a decision is replaced later, preserve the original historical record and link to its superseding ADR rather than rewriting history.
- A narrow change that keeps the decision itself, such as a changed default, limit, or parameter, may instead get a dated **Update** note in the existing ADR. Keep the original text, and state what changed, why, and who decided. A change to the chosen option or its core rationale needs a superseding ADR.
- When a decision already in use was never recorded, write its ADR when you notice it during authorized work. Take the context and rationale from plans, commits, and code; where the original reasoning is not recorded, say so instead of inventing it.
