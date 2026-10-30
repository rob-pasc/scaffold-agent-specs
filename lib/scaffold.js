import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const bundledScaffold = fileURLToPath(new URL('../scaffold/', import.meta.url));
export const releasedFingerprintsFile = fileURLToPath(new URL('./released-fingerprints.json', import.meta.url));
const requiredFeatureFiles = ['PLAN.md', 'ACCEPTANCE_MATRIX.md', 'TASKS.md'];
const optionalFeatureFiles = ['DESIGN.md', 'RESEARCH.md', 'HANDOFF.md'];

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

export function initProject(target, { dryRun = false, log = console.log } = {}) {
  const root = path.resolve(target);
  assertDirectory(root);
  const files = getBundledFiles(bundledScaffold);
  const created = [];
  const skipped = [];

  // Preflight before writing anything.
  for (const rel of files) {
    assertSafePath(root, path.join(root, rel));
  }

  for (const rel of files) {
    const destination = path.join(root, rel);
    if (pathExists(destination)) {
      skipped.push(rel);
      log(`skip   ${rel} (already exists)`);
      continue;
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      // Atomic no-clobber creation; existing work must never be overwritten.
      fs.copyFileSync(path.join(bundledScaffold, rel), destination, fs.constants.COPYFILE_EXCL);
    }
    created.push(rel);
    log(`${dryRun ? 'would create' : 'create'} ${rel}`);
  }

  log(`${dryRun ? 'Preview:' : 'Initialized:'} ${created.length} ${dryRun ? 'to create' : 'created'}, ${skipped.length} skipped.`);
  return { created, skipped };
}

// Identifies a file's content regardless of formatting, so a released file that a
// formatter such as Prettier has rewritten (padding, emphasis markers) still matches.
export function fingerprint(content) {
  const normalized = content.replace(/[\s*_-]/g, '');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function getBundledFingerprints() {
  return Object.fromEntries(getBundledFiles(bundledScaffold).map((rel) => [
    rel.split(path.sep).join('/'),
    fingerprint(fs.readFileSync(path.join(bundledScaffold, rel), 'utf8')),
  ]));
}

export function updateProject(target, { dryRun = false, force = false, log = console.log } = {}) {
  const root = path.resolve(target);
  assertDirectory(root);
  const released = JSON.parse(fs.readFileSync(releasedFingerprintsFile, 'utf8'));
  const files = getBundledFiles(bundledScaffold);
  const plan = [];

  // Decide every action before writing anything.
  for (const rel of files) {
    const destination = path.join(root, rel);
    assertSafePath(root, destination);
    const incoming = fs.readFileSync(path.join(bundledScaffold, rel), 'utf8');
    if (!pathExists(destination)) {
      plan.push({ rel, action: 'create', incoming });
      continue;
    }
    if (!fs.statSync(destination).isFile()) throw new Error(`Not a file: ${destination}`);
    const current = fingerprint(fs.readFileSync(destination, 'utf8'));
    const known = released[rel.split(path.sep).join('/')] ?? [];
    if (current === fingerprint(incoming)) plan.push({ rel, action: 'current' });
    else if (known.includes(current)) plan.push({ rel, action: 'update', incoming });
    else if (force) plan.push({ rel, action: 'overwrite', incoming });
    else plan.push({ rel, action: 'modified' });
  }

  const labels = {
    create: dryRun ? 'would create' : 'create',
    update: dryRun ? 'would update' : 'update',
    overwrite: dryRun ? 'would overwrite' : 'overwrite',
  };
  for (const { rel, action, incoming } of plan) {
    if (action === 'current') continue;
    if (action === 'modified') {
      log(`skip   ${rel} (modified locally)`);
      continue;
    }
    if (!dryRun) {
      const destination = path.join(root, rel);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, incoming);
    }
    log(`${labels[action]} ${rel}${action === 'overwrite' ? ' (local changes discarded)' : ''}`);
  }

  const count = (...actions) => plan.filter((item) => actions.includes(item.action)).length;
  const modified = plan.filter((item) => item.action === 'modified').map((item) => item.rel);
  log(`${dryRun ? 'Preview:' : 'Updated:'} ${count('update', 'overwrite')} ${dryRun ? 'to update' : 'updated'}, ${count('create')} ${dryRun ? 'to create' : 'created'}, ${count('current')} already current, ${modified.length} skipped.`);
  if (modified.length) {
    log('Skipped files differ from every released version, so they were left alone.');
    log(`Compare them with the new versions in ${bundledScaffold} and merge by hand, or rerun with --force to overwrite them.`);
  }
  return { plan: plan.map(({ rel, action }) => ({ rel, action })), modified };
}

export function slugify(value) {
  const slug = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new Error('Feature title must include letters or numbers.');
  if (slug.length > 80) throw new Error('Feature title is too long after conversion to a slug (max 80 characters).');
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
    .replaceAll('[Feature title]', title)
    .replaceAll('Feature NNN:', `Feature ${id}:`)
    .replaceAll('[YYYY-MM-DD]', date);
}

export function createFeature(target, title, {
  approved = false, design = false, research = false, handoff = false,
  dryRun = false, log = console.log,
} = {}) {
  const root = path.resolve(target);
  assertDirectory(root);
  if (!title || !title.trim()) throw new Error('Provide a feature title.');
  if (!approved && !dryRun) {
    throw new Error('Feature scope must be approved first. Re-run with --approved after explicit user approval.');
  }
  const slug = slugify(title.trim());
  const templateDir = path.join(root, '.agent-specs', 'templates', 'feature');
  const featuresDir = path.join(root, 'docs', 'features');
  const files = [...requiredFeatureFiles, ...optionalFeatureFiles.filter((file) => (
    (file === 'DESIGN.md' && design) ||
    (file === 'RESEARCH.md' && research) ||
    (file === 'HANDOFF.md' && handoff)
  ))];
  // Ensure initialization and templates exist before changing the repository.
  if (!fs.existsSync(featuresDir) || !fs.statSync(featuresDir).isDirectory()) {
    throw new Error('docs/features/ is missing. Run `scaffold-agent-specs init` first.');
  }
  for (const filename of files) {
    const template = path.join(templateDir, filename);
    assertSafePath(root, template);
    if (!fs.existsSync(template) || !fs.statSync(template).isFile()) {
      throw new Error(`Feature template missing: ${path.relative(root, template)}. Run init or restore the template.`);
    }
  }
  const number = nextFeatureNumber(featuresDir);
  const id = String(number).padStart(3, '0');
  const name = `feature-${id}-${slug}`;
  const featureDir = path.join(featuresDir, name);
  assertSafePath(root, featureDir);
  if (pathExists(featureDir)) throw new Error(`Feature directory already exists: ${featureDir}`);
  const date = localDate();
  const created = files.map((file) => path.join('docs', 'features', name, file));
  if (!dryRun) {
    // Exclusive mkdir prevents two concurrent calls from sharing the same feature ID.
    fs.mkdirSync(featureDir);
    try {
      for (const file of files) {
        const content = fs.readFileSync(path.join(templateDir, file), 'utf8');
        fs.writeFileSync(path.join(featureDir, file), fillFeatureTemplate(content, { title: title.trim(), id, slug, date }), { flag: 'wx' });
      }
    } catch (error) {
      // A failed scaffold must not leave a half-created feature.
      fs.rmSync(featureDir, { recursive: true, force: true });
      throw error;
    }
  }
  for (const file of created) log(`${dryRun ? 'would create' : 'create'} ${file}`);
  log(`${dryRun ? 'Preview:' : 'Scaffolded:'} ${name} (${files.length} file${files.length === 1 ? '' : 's'}).`);
  if (!dryRun) {
    log('Next: fill the files with the approved feature scope, then stop before implementation.');
  }
  return { featureDir, created };
}
