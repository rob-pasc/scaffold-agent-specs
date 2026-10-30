# Publishing checklist (when you're ready)

Publishing is not yet enabled. Nothing in this project publishes a package automatically.

## Try `npx` without publishing

To try the `npx` workflow before publishing, pack the package and run the tarball directly. This runs exactly the files that would ship:

```sh
npm pack                          # creates scaffold-agent-specs-<version>.tgz
cd /path/to/some/test-repo
npx --package /absolute/path/to/scaffold-agent-specs-<version>.tgz scaffold-agent-specs init
```

Do this before the first real publish: npm never allows republishing a version number, even after unpublishing.

## Publish

1. Create an npm account and enable two-factor authentication. Install a current Node.js and npm release.
2. Check whether `scaffold-agent-specs` is available on the public npm registry (`npm view scaffold-agent-specs`; a 404 means the name is free). npm can still reject a name that is too similar to an existing package. If it isn't available, use an unscoped alternative name or publish under your npm namespace, for example `@your-username/scaffold-agent-specs`, and update the `npx` commands in `README.md` to match.
3. Choose an open-source license (such as MIT or Apache-2.0), create a `LICENSE` file, and update the `license` field in `package.json` (currently `UNLICENSED`). No license has been selected for you.
4. Remove `"private": true` from `package.json`; `npm publish` refuses to run while it is set. Add accurate `author`, `repository`, `bugs`, and `homepage` metadata if you have them.
5. Update `README.md`: remove the "Pre-release" note about `private: true`, since the README becomes the npm package page.
6. Run `npm test` and `npm pack --dry-run` to verify everything that ships, especially `bin/`, `lib/`, and `scaffold/` (including the dot-directory `scaffold/.agent-specs/`).
7. Optionally test a real installation of the local `.tgz` package in a temporary directory before publishing (see above).
8. Run `npm login` and `npm whoami` to confirm you are logged in.
9. Publish an **unscoped** package with `npm publish`. For a public **scoped** package, use `npm publish --access public`. npm requires 2FA or an appropriately authorized publishing mechanism.
10. From a clean directory, test `npx scaffold-agent-specs@latest init` and `npx scaffold-agent-specs feature "Test feature" --approved` (or the `@your-username/...` equivalent if scoped).
11. Increase the package version before each subsequent publication, e.g. `npm version patch` followed by `npm publish`.

Official npm references:
- https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/
- https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/
- https://docs.npmjs.com/cli/commands/npm-exec/
- https://docs.npmjs.com/trusted-publishers/ (for later CI publishing; consult current docs)
