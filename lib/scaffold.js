import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const bundledScaffold = fileURLToPath(new URL('../scaffold/', import.meta.url));
export const releasedFingerprintsFile = fileURLToPath(new URL('./released-fingerprints.json', import.meta.url));
const requiredFeatureFiles = ['PLAN.md', 'ACCEPTANCE_CRITERIA.md', 'TASKS.md'];
const optionalFeatureFiles = ['DESIGN.md', 'RESEARCH.md', 'HANDOFF.md'];
// Paths are reported and fingerprinted with forward slashes on every platform.
const toPosix = (rel) => rel.split(path.sep).join('/');

function assertDirectory(dir) {
  let stats;
  try {
    stats = fs.statSync(dir);
  } catch {
    throw new Error(`Target directory does not exist: ${dir}`);
  }
  if (!stats.isDirectory()) throw new Error(`Not a directory: ${dir}`);
}

function pathExists(p) {
  try {
    fs.lstatSync(p);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

// Refuse to write through existing symlinked descendants of the chosen root.
// This also prevents accidentally writing through a symlink under docs/.
function assertSafePath(root, destination) {
  const relative = path.relative(root, destination);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside target directory: ${destination}`);
  }
  let current = root;
  for (const component of relative.split(path.sep)) {
    if (!component) continue;
    current = path.join(current, component);
    if (pathExists(current) && fs.lstatSync(current).isSymbolicLink()) {
      throw new Error(`Refusing to write through symlink: ${current}`);
    }
  }
}

function getBundledFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) return getBundledFiles(full, base);
    if (!item.isFile()) throw new Error(`Unsupported scaffold entry: ${full}`);
    return [path.relative(base, full)];
  }).sort();
}

const profileFile = '.agent-specs/profile.json';
const workflowHeading = '# Spec-driven Feature Workflow';
export function projectProfile(target) {
  const root = path.resolve(target);
  const file = path.join(root, profileFile);
  assertSafePath(root, file);
  if (pathExists(file)) {
    let profile;
    try {
      profile = JSON.parse(fs.readFileSync(file, 'utf8'))?.profile;
    } catch {
      // Unreadable or not JSON: reported below with the same guidance.
    }
    if (!['basic', 'opinionated'].includes(profile)) {
      throw new Error(`Invalid ${profileFile}: expected {"profile": "basic"} or {"profile": "opinionated"}. Fix the file, or delete it and pass --profile.`);
    }
    return profile;
  }
  return hasLegacyInstall(root) ? 'opinionated' : undefined;
}
// Installations older than profile.json are opinionated. Every release shipped
// .agent-specs/templates/; a docs/WORKFLOW.md counts only when it is this
// scaffold's own, because unrelated projects use that filename too.
function hasLegacyInstall(root) {
  if (fs.existsSync(path.join(root, '.agent-specs/templates'))) return true;
  try {
    return fs.readFileSync(path.join(root, 'docs/WORKFLOW.md'), 'utf8').startsWith(workflowHeading);
  } catch {
    return false;
  }
}
function validateProfile(profile) {
  if (!['basic', 'opinionated'].includes(profile)) throw new Error('Profile must be basic or opinionated.');
}
function profileFiles(profile) {
  validateProfile(profile);
  return profile === 'basic' ? ['AGENTS.md', 'CLAUDE.md'] : getBundledFiles(bundledScaffold);
}
function profileContent(rel, profile) {
  if (profile === 'basic' && rel === 'AGENTS.md') return fs.readFileSync(new URL('./basic-AGENTS.md', import.meta.url), 'utf8');
  return fs.readFileSync(path.join(bundledScaffold, rel), 'utf8');
}
function saveProfile(root, profile, dryRun) {
  if (!dryRun) {
    fs.mkdirSync(path.join(root, '.agent-specs'), { recursive: true });
    fs.writeFileSync(path.join(root, profileFile), JSON.stringify({ profile }, null, 2) + '\n');
  }
}

// Reject symlinks and wrong entry types for every destination and its parent
// directories, so a command fails with a clear message before writing anything.
function assertWritableDestinations(root, rels) {
  for (const rel of rels) {
    let parent = root;
    for (const component of path.dirname(rel).split(path.sep)) {
      parent = path.join(parent, component);
      assertSafePath(root, parent);
      if (pathExists(parent) && !fs.statSync(parent).isDirectory()) {
        throw new Error(`Not a directory: ${parent}`);
      }
    }
    const destination = path.join(root, rel);
    assertSafePath(root, destination);
    if (pathExists(destination) && !fs.statSync(destination).isFile()) {
      throw new Error(`Not a file: ${destination}`);
    }
  }
}

export function initProject(target, { dryRun = false, profile, log = console.log } = {}) {
  const root = path.resolve(target);
  assertDirectory(root);
  const existing = projectProfile(root);
  profile ??= existing ?? 'basic';
  validateProfile(profile);
  if (existing && existing !== profile) throw new Error('Use update --profile to switch an existing installation.');
  assertSafePath(root, path.join(root, profileFile));
  const files = profileFiles(profile);
  const created = [];
  const skipped = [];

  // Preflight before writing anything.
  assertWritableDestinations(root, [...files, profileFile]);

  for (const rel of files) {
    const destination = path.join(root, rel);
    if (pathExists(destination)) {
      skipped.push(rel);
      log(`skip   ${toPosix(rel)} (already exists)`);
      continue;
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      // Atomic no-clobber creation; existing work must never be overwritten.
      fs.writeFileSync(destination, profileContent(rel, profile), { flag: 'wx' });
    }
    created.push(rel);
    log(`${dryRun ? 'would create' : 'create'} ${toPosix(rel)}`);
  }

  saveProfile(root, profile, dryRun);
  log(`Profile: ${profile}`);
  log(`${dryRun ? 'Preview:' : 'Initialized:'} ${created.length} ${dryRun ? 'to create' : 'created'}, ${skipped.length} skipped.`);
  return { created, skipped };
}

// Only exact released contents are safe to replace. Formatting can change meaning.
export function fingerprint(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Line endings are the one exception: Git on Windows commonly checks files out
// with CRLF, which must not make every scaffold file look customized.
const toLf = (content) => content.replaceAll('\r\n', '\n');

export function getBundledFingerprints() {
  return Object.fromEntries(getBundledFiles(bundledScaffold).map((rel) => [
    toPosix(rel),
    fingerprint(fs.readFileSync(path.join(bundledScaffold, rel), 'utf8')),
  ]));
}

export function updateProject(target, { dryRun = false, force = false, profile, log = console.log } = {}) {
  const root = path.resolve(target);
  assertDirectory(root);
  const released = JSON.parse(fs.readFileSync(releasedFingerprintsFile, 'utf8'));
  const installed = projectProfile(root);
  if (!profile && !installed) {
    throw new Error(`No scaffold-agent-specs installation found in ${root}. Run init first.`);
  }
  profile ??= installed;
  assertSafePath(root, path.join(root, profileFile));
  const files = profileFiles(profile);
  const plan = [];
  assertWritableDestinations(root, [...files, profileFile]);

  // Decide every action before writing anything.
  for (const rel of files) {
    const destination = path.join(root, rel);
    const incoming = toLf(profileContent(rel, profile));
    if (!pathExists(destination)) {
      plan.push({ rel, action: 'create', incoming });
      continue;
    }
    const existing = fs.readFileSync(destination, 'utf8');
    const current = fingerprint(toLf(existing));
    const known = released[toPosix(rel)] ?? [];
    // Keep the line endings the repository already uses for this file.
    const content = existing.includes('\r\n') ? incoming.replaceAll('\n', '\r\n') : incoming;
    if (current === fingerprint(incoming)) plan.push({ rel, action: 'current' });
    else if (known.includes(current)) plan.push({ rel, action: 'update', incoming: content });
    else if (force) plan.push({ rel, action: 'overwrite', incoming: content });
    else plan.push({ rel, action: 'modified' });
  }

  // Files that earlier releases installed but this one no longer ships (for
  // example after a rename). They are reported, never deleted or migrated.
  const bundled = new Set(getBundledFiles(bundledScaffold).map(toPosix));
  const stale = [];
  for (const rel of Object.keys(released).filter((name) => !bundled.has(name))) {
    const destination = path.join(root, rel);
    // A stale path under a non-directory or symlink cannot be one of our files.
    try {
      assertWritableDestinations(root, [rel]);
    } catch {
      continue;
    }
    if (!pathExists(destination)) continue;
    const unmodified = released[rel].includes(fingerprint(toLf(fs.readFileSync(destination, 'utf8'))));
    stale.push({ rel, unmodified });
  }

  const labels = {
    create: dryRun ? 'would create' : 'create',
    update: dryRun ? 'would update' : 'update',
    overwrite: dryRun ? 'would overwrite' : 'overwrite',
  };
  for (const { rel, action, incoming } of plan) {
    if (action === 'current') continue;
    if (action === 'modified') {
      log(`skip   ${toPosix(rel)} (modified locally)`);
      continue;
    }
    if (!dryRun) {
      const destination = path.join(root, rel);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, incoming);
    }
    log(`${labels[action]} ${toPosix(rel)}${action === 'overwrite' ? ' (local changes discarded)' : ''}`);
  }

  saveProfile(root, profile, dryRun);
  log(`Profile: ${profile}`);
  const count = (...actions) => plan.filter((item) => actions.includes(item.action)).length;
  const modified = plan.filter((item) => item.action === 'modified').map((item) => item.rel);
  log(`${dryRun ? 'Preview:' : 'Updated:'} ${count('update', 'overwrite')} ${dryRun ? 'to update' : 'updated'}, ${count('create')} ${dryRun ? 'to create' : 'created'}, ${count('current')} already current, ${modified.length} skipped.`);
  if (modified.length) {
    log('Skipped files differ from every released version, so they were left alone.');
    log(`Compare them with the new versions in ${bundledScaffold} and merge by hand, or rerun with --force to overwrite them.`);
  }
  for (const { rel, unmodified } of stale) {
    log(`stale  ${rel} (${unmodified ? 'unmodified; safe to delete' : 'modified locally; merge your changes into its replacement, then delete it'})`);
  }
  if (stale.length) {
    log('Stale files come from an earlier release and are no longer part of the scaffold. update does not rename or');
    log('migrate them; see "Updating an existing repository" in the README.');
  }
  return { plan: plan.map(({ rel, action }) => ({ rel, action })), modified, stale: stale.map(({ rel }) => rel) };
}

// Keeps letters and digits of every script. Accents are dropped from Latin
// letters only (über -> uber); elsewhere a combining mark can be part of the
// letter itself, so the text is recomposed unchanged.
export function slugify(value) {
  const slug = value.normalize('NFKD').replace(/(\p{Script=Latin})\p{M}+/gu, '$1').normalize('NFC')
    .toLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new Error('Feature title must include letters or numbers.');
  // The byte limit keeps the directory name within common 255-byte filename limits.
  if ([...slug].length > 80 || Buffer.byteLength(slug) > 200) {
    throw new Error('Feature title is too long after conversion to a slug (max 80 characters or 200 bytes).');
  }
  return slug;
}

function nextFeatureNumber(featuresDir) {
  const existing = fs.readdirSync(featuresDir, { withFileTypes: true });
  const ids = existing.filter((item) => item.isDirectory())
    .map((item) => /^feature-(\d+)-/.exec(item.name))
    .filter(Boolean).map((match) => Number(match[1]));
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

function localDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fillFeatureTemplate(contents, { title, id, slug, date }) {
  return contents.replaceAll('feature-NNN-kebab-case', `feature-${id}-${slug}`)
    .replaceAll('Feature NNN:', `Feature ${id}:`)
    .replaceAll('[YYYY-MM-DD]', date)
    .replaceAll('[Feature title]', () => title);
}

export function createFeature(target, title, {
  approved = false, design = false, research = false, handoff = false,
  dryRun = false, log = console.log,
} = {}) {
  const root = path.resolve(target);
  assertDirectory(root);
  if (!title || !title.trim()) throw new Error('Provide a feature title.');
  // The title becomes a one-line Markdown heading.
  title = title.trim().replace(/\s+/g, ' ');
  if (!approved && !dryRun) {
    throw new Error('Feature scope must be approved first. Re-run with --approved after explicit user approval.');
  }
  const slug = slugify(title);
  const templateDir = path.join(root, '.agent-specs', 'templates', 'feature');
  const featuresDir = path.join(root, 'docs', 'features');
  const files = [...requiredFeatureFiles, ...optionalFeatureFiles.filter((file) => (
    (file === 'DESIGN.md' && design) ||
    (file === 'RESEARCH.md' && research) ||
    (file === 'HANDOFF.md' && handoff)
  ))];
  // Ensure initialization and templates exist before changing the repository.
  if (!fs.existsSync(featuresDir) || !fs.statSync(featuresDir).isDirectory()) {
    throw new Error('docs/features/ is missing. Run `scaffold-agent-specs update --profile opinionated` first.');
  }
  for (const filename of files) {
    const template = path.join(templateDir, filename);
    assertSafePath(root, template);
    if (!fs.existsSync(template) || !fs.statSync(template).isFile()) {
      throw new Error(`Feature template missing: ${path.relative(root, template)}. Run init or restore the template.`);
    }
  }
  // Serialize allocation across all titles, not just identical directory names.
  const lock = path.join(featuresDir, '.agent-specs-feature.lock');
  assertSafePath(root, lock);
  if (!dryRun) {
    try {
      fs.mkdirSync(lock);
    } catch (error) {
      if (error.code === 'EEXIST') {
        throw new Error(`Feature creation is locked: ${lock}. Retry after the other command finishes. If it crashed, remove this lock directory only after confirming no feature command is running.`);
      }
      throw error;
    }
  }
  try {
    const number = nextFeatureNumber(featuresDir);
    const id = String(number).padStart(3, '0');
    const name = `feature-${id}-${slug}`;
    const featureDir = path.join(featuresDir, name);
    assertSafePath(root, featureDir);
    if (pathExists(featureDir)) throw new Error(`Feature directory already exists: ${featureDir}`);
    const date = localDate();
    const created = files.map((file) => path.join('docs', 'features', name, file));
    if (!dryRun) {
      // Exclusive mkdir also protects against an existing destination.
      fs.mkdirSync(featureDir);
      try {
        for (const file of files) {
          const content = fs.readFileSync(path.join(templateDir, file), 'utf8');
          fs.writeFileSync(path.join(featureDir, file), fillFeatureTemplate(content, { title, id, slug, date }), { flag: 'wx' });
        }
      } catch (error) {
        // A failed scaffold must not leave a half-created feature.
        fs.rmSync(featureDir, { recursive: true, force: true });
        throw error;
      }
    }
    for (const file of created) log(`${dryRun ? 'would create' : 'create'} ${toPosix(file)}`);
    log(`${dryRun ? 'Preview:' : 'Scaffolded:'} ${name} (${files.length} file${files.length === 1 ? '' : 's'}).`);
    if (!dryRun) {
      log('Next: fill the files with the approved feature scope, then stop before implementation.');
    }
    return { featureDir, created };
  } finally {
    if (!dryRun) fs.rmdirSync(lock);
  }
}
