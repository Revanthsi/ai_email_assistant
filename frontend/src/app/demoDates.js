import { DEMO_DATE } from '../data/mockEmails.js';
export function formatDate(date) {
  if (!date) return 'No confirmed deadline';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(`${date}T12:00:00+05:30`));
}
export function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date(timestamp));
}
export function dayOffset(date, today = DEMO_DATE) { return date ? Math.round((Date.parse(date) - Date.parse(today)) / 86400000) : null; }
export function deadlineGroup(date, today = DEMO_DATE) {
  const offset = dayOffset(date, today);
  if (offset === null) return 'Later';
  if (offset < 0) return 'Overdue';
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  const daysUntilSunday = (7 - new Date(today).getUTCDay()) % 7;
  return offset <= daysUntilSunday ? 'This Week' : 'Later';
}
export function isUpcoming(task, today = DEMO_DATE) { const offset = dayOffset(task.dueDate, typeof today === 'string' ? today : DEMO_DATE); return task.status !== 'completed' && offset !== null && offset >= 0 && offset <= 6; }
