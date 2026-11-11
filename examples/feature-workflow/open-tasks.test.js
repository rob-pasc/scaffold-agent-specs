import assert from 'node:assert/strict';
import { test } from 'node:test';
import { listOpenTasks } from './open-tasks.js';

test('AC-001: returns only open tasks in their original order', () => {
  const tasks = [
    { title: 'Write spec', completed: true },
    { title: 'Implement filter', completed: false },
    { title: 'Verify result', completed: false },
  ];
  assert.deepEqual(listOpenTasks(tasks), [tasks[1], tasks[2]]);
});

test('AC-002: empty and fully completed lists return an empty list', () => {
  assert.deepEqual(listOpenTasks([]), []);
  assert.deepEqual(listOpenTasks([{ title: 'Done', completed: true }]), []);
});

test('AC-003: leaves the source array and task records unchanged', () => {
  const task = Object.freeze({ title: 'Review', completed: false });
  const tasks = Object.freeze([task]);
  const result = listOpenTasks(tasks);
  assert.deepEqual(tasks, [{ title: 'Review', completed: false }]);
  assert.notEqual(result, tasks);
  assert.equal(result[0], task);
});
