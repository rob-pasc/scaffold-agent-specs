# Release checklist

`scaffold-agent-specs` is published on the public npm registry as an unscoped package. Nothing in this project publishes automatically; each release is run by hand.

## Before releasing

1. Move the entries under "Unreleased" in `CHANGELOG.md` to a heading for the new version and date, and commit that. Every user-visible change belongs there; breaking changes also need their migration steps.
2. If `scaffold/` or `lib/basic-AGENTS.md` changed, run `npm run fingerprints` and commit `lib/released-fingerprints.json` with the scaffold change. Otherwise `update` treats files from this release as customized in repositories that install it, and `npm test` fails.
3. Run the checks:

   ```sh
   npm test
   npm run format:check
   npm run pack:check   # verify bin/, lib/ and scaffold/ (including scaffold/.agent-specs/) ship
   ```

4. Optionally try the exact files that would ship, without publishing:

   ```sh
   npm pack                          # creates scaffold-agent-specs-<version>.tgz
   cd /path/to/some/test-repo
   npx --package /absolute/path/to/scaffold-agent-specs-<version>.tgz scaffold-agent-specs init
   ```

## Release

Before 1.0, a breaking change for existing installations takes a minor version bump (`npm version minor` instead of the patch command below); everything else is a patch. For a breaking release, put the manual migration steps in `CHANGELOG.md` and the README. After publishing and smoke-testing it, run `npm deprecate` on the older versions with a notice pointing to those steps, as was done for the 0.3.0 acceptance-document rename. Deprecation does not migrate installed repositories.

1. Bump the version. This creates a `Release <version>` commit and a `v<version>` tag:

   ```sh
   npm version patch -m "Release %s"
   ```

2. Confirm you are logged in (`npm whoami`; run `npm login` if not), then publish. npm requires 2FA or an authorized publishing mechanism.

   ```sh
   npm publish
   ```

3. Push the release commit and tag, so GitHub matches the registry:

   ```sh
   git push --follow-tags
   ```

4. From a clean directory, smoke-test the published package:

   ```sh
   npx scaffold-agent-specs@latest init --profile opinionated
   npx scaffold-agent-specs@latest feature "Test feature" --approved
   ```

   In a separate clean directory, smoke-test the basic profile:

   ```sh
   npx scaffold-agent-specs@latest init --profile basic
   npx scaffold-agent-specs@latest update
   ```

   Confirm basic installs `AGENTS.md`, `CLAUDE.md`, and `.agent-specs/profile.json`
   without creating `docs/` or templates, and that update retains the basic profile.

npm never allows republishing a version number, even after unpublishing. If a publish fails after `npm version`, fix the problem and publish the same version; if the version was published but is broken, release a new patch and run `npm deprecate scaffold-agent-specs@<version> "<reason>"` on the bad one.

Official npm references:

- https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/
- https://docs.npmjs.com/cli/commands/npm-version/
- https://docs.npmjs.com/cli/commands/npm-deprecate/
- https://docs.npmjs.com/trusted-publishers/ (for later CI publishing)

## Fingerprint compatibility

Fingerprints use SHA-256 of exact file contents. Do not restore the former whitespace/punctuation normalization as a fallback: it can identify meaningful local edits as released content and overwrite them. Formatting changes now require a manual merge. The only normalization is CRLF to LF before hashing, so Windows checkouts are not reported as customized; `.gitattributes` keeps this repository's own files LF so the recorded hashes are stable.

The migration to exact hashes rebuilt historical entries from the original `scaffold/` files in local tags `v0.1.0` through `v0.1.8`, plus the pre-migration HEAD's scaffold and basic profile. `npm run fingerprints` appends current contents without removing those historical entries. When recovering another historical version, hash its original files; if the contents cannot be established, leave it unrecognized so update conservatively skips it.
