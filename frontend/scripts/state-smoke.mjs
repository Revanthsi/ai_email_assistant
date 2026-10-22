import assert from 'node:assert/strict';
import { createWorkspaceState, workspaceReducer, filterEmails } from '../src/app/stateActions.js';
import { deadlineGroup, isUpcoming } from '../src/app/demoDates.js';
import { resolveEmailId } from '../src/data/mockEmails.js';
import { countBy } from '../src/data/insights.js';

let state = createWorkspaceState();
const initial = createWorkspaceState();
assert.ok(state.emails.length >= 10);
assert.equal(new Set(state.emails.map((email) => email.id)).size, state.emails.length);
assert.equal(resolveEmailId('1'), 'email-001');
for (const task of state.taskItems) {
  const source = state.emails.find((email) => email.id === task.emailId);
  assert.ok(source?.actionItems.some((action) => action.id === task.id));
  assert.equal(task.dueDate, source.actionItems.find((action) => action.id === task.id).dueDate);
}
for (const reminder of state.reminderItems) assert.ok(state.taskItems.some((task) => task.id === reminder.taskId));
assert.equal(deadlineGroup('2026-10-08'), 'Overdue');
assert.equal(deadlineGroup('2026-10-09'), 'Today');
assert.equal(deadlineGroup('2026-10-10'), 'Tomorrow');
assert.equal(deadlineGroup('2026-10-11'), 'This Week');
assert.equal(deadlineGroup('2026-10-12'), 'Later');
assert.equal(deadlineGroup('2026-10-20'), 'Later');

const unreadBefore = filterEmails(state.emails, { read: 'unread' }).length;
state = workspaceReducer(state, { type: 'email/update', id: 'email-001', patch: { isRead: true, isStarred: false } });
assert.equal(filterEmails(state.emails, { read: 'unread' }).length, unreadBefore - 1);
assert.equal(state.emails.find((email) => email.id === 'email-001').isStarred, false);
assert.ok(filterEmails(state.emails, { query: 'cognizant', priority: 'high' }).every((email) => email.id === 'email-002'));
assert.equal(filterEmails(state.emails, { query: 'nonexistent phrase' }).length, 0);
assert.equal(filterEmails(state.emails, { sort: 'oldest' })[0].id, 'email-012');

const upcomingBefore = state.taskItems.filter(isUpcoming).length;
state = workspaceReducer(state, { type: 'task/toggle', id: 'action-001' });
assert.equal(state.taskItems.find((task) => task.id === 'action-001').status, 'completed');
assert.equal(state.reminderItems.find((reminder) => reminder.taskId === 'action-001').completed, true);
assert.equal(state.taskItems.filter(isUpcoming).length, upcomingBefore - 1);
state = workspaceReducer(state, { type: 'task/toggle', id: 'action-001' });
state = workspaceReducer(state, { type: 'task/save', task: { ...state.taskItems.find((task) => task.id === 'action-001'), title: 'Updated report task', dueDate: '2026-10-12' } });
assert.equal(state.taskItems.find((task) => task.id === 'action-001').title, 'Updated report task');
assert.equal(state.reminderItems.find((reminder) => reminder.taskId === 'action-001').dueDate, '2026-10-12');
state = workspaceReducer(state, { type: 'reminder/dismiss', id: 'reminder-action-001' });
assert.equal(state.reminderItems.find((reminder) => reminder.taskId === 'action-001').dismissed, true);
state = workspaceReducer(state, { type: 'reminder/add', reminder: { id: 'reminder-action-001', taskId: 'action-001' } });
assert.equal(state.reminderItems.find((reminder) => reminder.taskId === 'action-001').dismissed, false);
assert.equal(state.reminderItems.filter((reminder) => reminder.taskId === 'action-001').length, 1);

state = workspaceReducer(state, { type: 'task/save', task: { id: 'task-test', title: 'Local demo task', origin: 'local', priority: 'medium', status: 'pending', dueDate: '2026-10-10', emailId: null } });
assert.ok(state.taskItems.some((task) => task.id === 'task-test'));
state = workspaceReducer(state, { type: 'task/delete', id: 'task-test' });
assert.ok(!state.taskItems.some((task) => task.id === 'task-test'));
state = workspaceReducer(state, { type: 'task/delete', id: 'action-001' });
assert.ok(!state.reminderItems.some((reminder) => reminder.taskId === 'action-001'));
state = workspaceReducer(state, { type: 'email/update', id: 'email-002', patch: { archived: true } });
assert.ok(!filterEmails(state.emails.filter((email) => !email.archived)).some((email) => email.id === 'email-002'));
state = workspaceReducer(state, { type: 'email/update', id: 'email-010', patch: { deleted: true } });
assert.ok(!filterEmails(state.emails).some((email) => email.id === 'email-010'));
state = workspaceReducer(state, { type: 'preference/update', key: 'securityAlerts', value: false });
state = workspaceReducer(state, { type: 'profile/update', patch: { name: 'Demo Reader' } });
state = workspaceReducer(state, { type: 'draft/save', draft: { to: 'demo@example.com', subject: 'Demo', message: 'Sample draft', tone: 'Friendly' } });
assert.equal(state.preferences.securityAlerts, false);
assert.equal(state.profile.name, 'Demo Reader');
assert.equal(state.draft.message, 'Sample draft');
assert.equal(countBy(state.emails.filter((email) => !email.deleted), 'category').reduce((sum, item) => sum + item.value, 0), state.emails.filter((email) => !email.deleted).length);
assert.deepEqual(createWorkspaceState(), initial, 'A new session must restore the dataset');
console.log('Shared email, task, reminder, draft, preference, date, and chart checks passed.');
