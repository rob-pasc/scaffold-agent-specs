# Project Testing Guide

> **Optional project document.** Create under `docs/TESTING.md` when verification setup or test selection needs explanation beyond existing scripts, CI, README, or contributing documentation. Reuse an existing guide when it already serves this purpose. Document the project's actual approach, not a hypothetical test strategy. Link to authoritative scripts and configuration rather than copying their implementation. Omit irrelevant sections.

## Choosing checks

| Change or risk   | Relevant checks and command           | Authoritative script / configuration   |
| ---------------- | ------------------------------------- | -------------------------------------- |
| [Type of change] | [Checks to run and working directory] | [Link to maintained command or CI job] |

[Explain when focused checks suffice and when integration, end-to-end, build, or other checks are needed. Identify differences between local and CI verification. Do not prescribe new tooling without an agreed need.]

## Setup and test data

[Required runtimes, services, environment variable names, fixtures, seed data, and setup/cleanup procedures. Link to existing setup documentation. Describe how to obtain authorized test credentials without including secrets. Identify commands that modify data and the isolated test environment they require.]

## Integration boundaries

[Which checks use real services and which use substitutes, why those boundaries exist, and what a passing substituted test does not establish.]

## Manual verification

[Reproducible checks that automation does not cover, prerequisites such as devices or service access, and what evidence to record. Keep feature-specific expected outcomes in the feature's acceptance matrix.]

## Known limitations and troubleshooting

[Known environment restrictions, flaky checks, diagnostic steps, and any maintained issue references. Distinguish unavailable checks from product failures; a limitation does not justify reporting a pass or silently skipping required verification.]

## Evidence and maintenance

Record commands, results, and limitations for each feature in its `ACCEPTANCE_MATRIX.md`; this guide owns reusable verification procedures, not execution history. Update it when test setup, commands, or verification boundaries change.
