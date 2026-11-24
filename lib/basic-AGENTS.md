# Repository Agent Instructions

These shared instructions apply to all coding agents. Follow existing project practices and the user's requested scope.

- Inspect relevant code, tests, and documentation before asking questions or proposing an approach.
- Prefer the smallest coherent change. Follow existing conventions and avoid unrelated refactors.
- Write comments when they clarify non-obvious intent, constraints, invariants, or workarounds. Avoid restating the code; prefer clearer names and structure where possible. Keep comments accurate when changing nearby code, and follow existing conventions for API documentation.
- For detailed rationale, link to an existing ADR or other stable documentation rather than duplicating it in a long comment; retain a brief local explanation so the code remains understandable on its own.
- Ask focused questions about consequential choices; choose sensible defaults for minor details. Keep the user in control of scope and significant architectural tradeoffs, and ask before materially expanding the requested work.
- Explain assumptions, uncertainty, incomplete work, and failed or unrun checks honestly.
- Follow existing UI conventions and design-system documentation when working on visual interfaces.
- Update affected documentation alongside code. Document consequential decisions where the project normally records them. Keep documentation concise and prefer an existing source of truth.
- Create or update the root `README.md` when setup, usage, commands, or project status change, keeping its status line current. Keep the status to one or two sentences about what works and where it runs. Summarize and link to detailed documentation rather than restating it.
- Record Git, CI, and release facts in documentation only as dated observations with their source (for example "2026-11-21: released as v0.5.1"), never as undated current state such as "the newest tag is v0.5.0" or "not pushed yet". For the current version or CI result, link to the tags, releases, or CI runs instead.
- Add or update automated tests for behavior changes when the project has a test suite; if a behavior can't reasonably be tested automatically, say why.
- Run relevant checks before claiming completion. Never claim unverified success. Report changes, verification evidence, and remaining limitations.
- Follow repository conventions and the user's instructions for Git workflow and commit messages. Keep commits focused; do not commit secrets, credentials, local environment files, or unrelated changes.
- Do not push, rewrite history, or change branches without the user's authorization.
