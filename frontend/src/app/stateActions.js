import { mockEmails } from '../data/mockEmails.js';
import { tasks } from '../data/tasks.js';
import { reminders } from '../data/reminders.js';

export function createWorkspaceState() {
  return {
    emails: mockEmails.map((email) => ({ ...email })),
    taskItems: tasks.map((task) => ({ ...task })),
    reminderItems: reminders.map((reminder) => ({ ...reminder })),
    profile: { name: 'Revanth', email: 'revanth@example.com' },
    preferences: { replyTone: 'Professional', priorityNotifications: true, securityAlerts: true, deadlineReminders: true },
    draft: { to: '', subject: '', message: '', tone: 'Professional' },
  };
}
export function workspaceReducer(state, action) {
  switch (action.type) {
    case 'source/replace': return { ...state, ...action.patch };
    case 'email/upsert': return { ...state, emails: state.emails.some((email) => email.id === action.email.id) ? state.emails.map((email) => email.id === action.email.id ? action.email : email) : [...state.emails, action.email] };
    case 'email/update':
      return { ...state, emails: state.emails.map((email) => email.id === action.id ? { ...email, ...action.patch } : email) };
    case 'task/save': {
      const exists = state.taskItems.some((task) => task.id === action.task.id);
      return { ...state, taskItems: exists ? state.taskItems.map((task) => task.id === action.task.id ? { ...task, ...action.task } : task) : [...state.taskItems, action.task], reminderItems: state.reminderItems.map((reminder) => reminder.taskId === action.task.id ? { ...reminder, dueDate: action.task.dueDate } : reminder) };
    }
    case 'task/toggle': {
      const completed = state.taskItems.find((task) => task.id === action.id)?.status !== 'completed';
      return { ...state, taskItems: state.taskItems.map((task) => task.id === action.id ? { ...task, status: completed ? 'completed' : 'pending' } : task), reminderItems: state.reminderItems.map((reminder) => reminder.taskId === action.id ? { ...reminder, completed } : reminder) };
    }
    case 'task/delete':
      return { ...state, taskItems: state.taskItems.filter((task) => task.id !== action.id), reminderItems: state.reminderItems.filter((reminder) => reminder.taskId !== action.id) };
    case 'reminder/add':
      return state.reminderItems.some((item) => item.taskId === action.reminder.taskId) ? { ...state, reminderItems: state.reminderItems.map((item) => item.taskId === action.reminder.taskId ? { ...item, dismissed: false } : item) } : { ...state, reminderItems: [...state.reminderItems, action.reminder] };
    case 'reminder/dismiss':
      return { ...state, reminderItems: state.reminderItems.map((reminder) => reminder.id === action.id ? { ...reminder, dismissed: true } : reminder) };
    case 'profile/update': return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'preference/update': return { ...state, preferences: { ...state.preferences, [action.key]: action.value } };
    case 'draft/save': return { ...state, draft: action.draft };
    default: return state;
  }
}
export function filterEmails(emails, { query = '', priority = 'all', read = 'all', sort = 'newest' } = {}) {
  const normalized = query.trim().toLowerCase();
  const filtered = emails.filter((email) => !email.deleted && `${email.sender} ${email.senderEmail} ${email.subject} ${email.preview} ${email.category}`.toLowerCase().includes(normalized) && (priority === 'all' || email.priority === priority) && (read === 'all' || email.isRead === (read === 'read')));
  return [...filtered].sort((a, b) => sort === 'oldest' ? Date.parse(a.timestamp) - Date.parse(b.timestamp) : Date.parse(b.timestamp) - Date.parse(a.timestamp));
}
