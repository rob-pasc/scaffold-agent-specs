import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initProject, updateProject } from '../lib/scaffold.js';

function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-specs-docs-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  initProject(root, { profile: 'opinionated', log: () => {} });
  return root;
}

test('installed workflow references resolve to files and heading anchors', (t) => {
  const root = project(t);
  const files = ['AGENTS.md', 'CLAUDE.md', ...fs.readdirSync(path.join(root, 'docs'), { recursive: true })
    .filter((file) => file.endsWith('.md')).map((file) => path.join('docs', file))];
  for (const file of files) {
    const content = fs.readFileSync(path.join(root, file), 'utf8');
    for (const [, href] of content.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      if (/^[a-z]+:/i.test(href)) continue;
      const [relative, anchor] = href.split('#');
      const target = relative ? path.resolve(root, path.dirname(file), relative) : path.join(root, file);
      assert.ok(fs.existsSync(target), `${file}: missing ${href}`);
      if (anchor) {
        // These documents use simple, unique ATX headings with GitHub anchors.
        const headings = [...fs.readFileSync(target, 'utf8').matchAll(/^#{1,6} (.+)$/gm)]
          .map(([, heading]) => heading.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/ /g, '-'));
        assert.ok(headings.includes(anchor), `${file}: missing anchor ${href}`);
      }
    }
  }
});

test('update installs extracted procedures while preserving customized workflow and reporting review', (t) => {
  const root = project(t);
  fs.rmSync(path.join(root, 'docs/workflow'), { recursive: true });
  const custom = '# Spec-driven Feature Workflow\n\nCustom project procedure.\n';
  fs.writeFileSync(path.join(root, 'docs/WORKFLOW.md'), custom);
  const preview = updateProject(root, { dryRun: true, log: () => {} });
  assert.ok(preview.integrationReview.includes('docs/WORKFLOW.md'));
  assert.ok(!fs.existsSync(path.join(root, 'docs/workflow')));
  updateProject(root, { log: () => {} });
  assert.equal(fs.readFileSync(path.join(root, 'docs/WORKFLOW.md'), 'utf8'), custom);
  assert.deepEqual(fs.readdirSync(path.join(root, 'docs/workflow')).sort(),
    ['ALLOCATION.md', 'CHANGE_HISTORY.md', 'PROJECT_DOCS.md']);
  const allocation = path.join(root, 'docs/workflow/ALLOCATION.md');
  fs.appendFileSync(allocation, '\nCustom allocation policy.\n');
  const result = updateProject(root, { log: () => {} });
  assert.ok(result.integrationReview.includes('docs/workflow/ALLOCATION.md'));
  assert.match(fs.readFileSync(allocation, 'utf8'), /Custom allocation policy/);
});

test('feature indexes remain project-owned across initialization and forced updates', (t) => {
  const root = project(t);
  const index = path.join(root, 'docs/features/INDEX.md');
  assert.ok(!fs.existsSync(index), 'initialization must not invent a feature index');
  const content = '# Feature index\n\nExisting ownership and replacement references.\n';
  fs.writeFileSync(index, content);
  initProject(root, { log: () => {} });
  for (const dryRun of [true, false]) {
    updateProject(root, { force: true, dryRun, log: () => {} });
    assert.equal(fs.readFileSync(index, 'utf8'), content);
  }
});
