import { mockEmails } from './mockEmails.js';
export const tasks = mockEmails.flatMap((email) => email.actionItems.map((action) => ({
  id: action.id, title: action.title, emailId: email.id, dueDate: action.dueDate,
  priority: email.priority, status: 'pending', origin: 'email',
})));
