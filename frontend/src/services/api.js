// No provider credentials belong in this client. The backend owns Gmail and AI calls.
export const API_BASE = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
let csrf = '';
export const setCsrf = (value) => { csrf = value || ''; };
export class ApiError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), path.includes('analyze') ? 330000 : 120000);
  try {
    const response = await fetch(`${API_BASE}${path}`, { method, credentials: 'include', signal: controller.signal,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json();
    if (!response.ok) throw new ApiError(data.error?.message || (response.status === 422 ? 'Check the submitted values.' : 'The request failed. Try again.'), response.status, data.error?.code);
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('The backend could not be reached or the request timed out. Check that FastAPI is running and retry.', 0, 'backend_unavailable');
  } finally { clearTimeout(timer); }
}
export function adaptEmail(email) {
  const analysis = email.analysis;
  const actionItems = (analysis?.action_items || []).map((action) => ({ ...action, dueDate: action.deadline }));
  return { ...email, initials: email.sender.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase() || 'GM',
    category: analysis?.intent.category.replaceAll('_', ' ') || 'Unclassified',
    priority: analysis?.priority.level || 'unanalyzed', intent: analysis?.intent.category.replaceAll('_', ' ') || 'Not analyzed',
    summary: analysis?.summary || '', recommendation: analysis?.recommended_action || '', actionItems,
    deadline: actionItems.find((action) => action.deadline_confidence === 'explicit' && action.deadline)?.deadline || null,
    riskLevel: 'unknown', riskReasons: [], reply: 'Thank you for your message. I will review the details and follow up.\n\nBest regards',
  };
}
export function remindersFromTasks(tasks) {
  return tasks.filter((task) => task.dueDate).map((task) => ({ id: `reminder-${task.id}`, taskId: task.id, emailId: task.emailId, dueDate: task.dueDate, completed: task.status === 'completed', dismissed: !!task.reminderDismissed }));
}
