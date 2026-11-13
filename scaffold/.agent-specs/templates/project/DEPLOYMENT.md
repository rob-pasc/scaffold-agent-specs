# Release and Recovery Guide

> **Optional project document.** Create under `docs/DEPLOYMENT.md` when recurring release, deployment, or recovery procedures need explanation beyond existing scripts, CI, publishing instructions, or runbooks. Reuse an adequate existing guide. Describe actual supported procedures and link to authoritative automation; do not invent infrastructure or claim untested recovery works. Omit irrelevant sections. Feature-specific rollout choices belong in the feature plan, and execution evidence belongs in its acceptance criteria document or an existing release record.

## Release targets and prerequisites

[What is released or deployed, to which environments or registries, and from which artifact/version. Link to build and release automation. Identify prerequisites, required access, and who can authorize execution; do not include credentials. Documentation or feature approval alone does not authorize a deployment, publication, or production data change.]

## Rollout procedure and compatibility

[The supported sequence, commands or automation links, and checkpoints. Explain component ordering, version compatibility, feature flags, staged exposure, or downtime only where applicable. Identify stop conditions and how to determine which version is actually active.]

## Data changes and migration

[Migration ordering, compatibility with old and new application versions, backup requirements, and any irreversible steps. State 'Not applicable' if no persistent data is involved. Link to authoritative migration and restore procedures instead of copying them.]

## Post-release verification

[Observable smoke checks, health signals, logs or metrics, and their success/failure conditions. Identify when checks run and who follows up. Distinguish a successful build or deployment command from evidence that the released behavior works.]

## Rollback and recovery

[When to stop rollout or recover, who decides, the known-good artifact/configuration, and the supported procedure. Explain what reverting code does not undo, including data changes. If rollback is unavailable or unsafe, state that explicitly and describe the supported forward fix or recovery path and its limitations. Record where recovery was rehearsed and link to evidence, or label it unverified.]

## Evidence and maintenance

[Link to existing release/deployment records and recovery evidence. Record the version, environment, time, check results, and unresolved issues when executing a release. Keep reusable procedures here and feature-specific evidence in its acceptance criteria document or linked release record. Update this guide when release automation, compatibility assumptions, or recovery procedures change.]
