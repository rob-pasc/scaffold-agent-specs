// The example task store already supplies { title, completed: boolean } records.
export function listOpenTasks(tasks) {
  return tasks.filter(task => !task.completed);
}
