import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PassThrough, Writable } from 'node:stream';
import { select } from '../lib/select.js';
import { profileChoices } from '../lib/cli.js';

const UP = '\x1b[A';
const DOWN = '\x1b[B';
const ENTER = '\r';

function run(keys, options = {}) {
  const input = new PassThrough();
  let written = '';
  const output = new Writable({ write(chunk, _encoding, done) { written += chunk; done(); } });
  const result = select({ message: 'Profile', choices: profileChoices, input, output, ...options });
  // Send keys one at a time, as a terminal does.
  for (const key of keys) input.write(key);
  return { result, output: () => written };
}

test('Enter keeps the first choice, so the default stays basic', async () => {
  assert.equal(await run([ENTER]).result, 'basic');
});

test('arrow keys move the selection and wrap around', async () => {
  assert.equal(await run([DOWN, ENTER]).result, 'opinionated');
  assert.equal(await run([UP, ENTER]).result, 'opinionated');
  assert.equal(await run([DOWN, DOWN, ENTER]).result, 'basic');
});

test('j/k and number keys also select', async () => {
  assert.equal(await run(['j', ENTER]).result, 'opinionated');
  assert.equal(await run(['j', 'k', ENTER]).result, 'basic');
  assert.equal(await run(['2', ENTER]).result, 'opinionated');
  assert.equal(await run(['9', ENTER]).result, 'basic', 'an out-of-range number is ignored');
});

test('Ctrl+C and Escape cancel with an AbortError', async () => {
  for (const key of ['\x03', '\x1b']) {
    await assert.rejects(run([key]).result, { name: 'AbortError' });
  }
});

test('the menu shows both profiles and ends with the chosen one', async () => {
  const session = run([DOWN, ENTER]);
  await session.result;
  const text = session.output();
  assert.match(text, /basic {2}quality safeguards/);
  assert.match(text, /❯ opinionated {2}formal feature specs/);
  assert.match(text, /✔ Profile opinionated\n$/);
  assert.doesNotMatch(text, /\x1b\[3[0-9]m/, 'no colours when the output is not a terminal');
});
