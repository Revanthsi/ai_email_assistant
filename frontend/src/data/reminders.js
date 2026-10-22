import { tasks } from './tasks.js';
export const reminders = tasks.filter((task) => task.dueDate).map((task) => ({
  id: `reminder-${task.id}`, taskId: task.id, emailId: task.emailId,
  dueDate: task.dueDate, completed: false, dismissed: false,
}));
