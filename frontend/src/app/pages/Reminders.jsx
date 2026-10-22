import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3 } from 'lucide-react';
import { useAppState } from '../AppState';
import { deadlineGroup, formatDate } from '../demoDates';
import { PageHeading, PriorityBadge } from '../components/Common';

function ReminderCard({ reminder }) {
  const { emails, taskItems, toggleTask, dismissReminder, setToast } = useAppState();
  const task = taskItems.find((item) => item.id === reminder.taskId);
  const source = emails.find((email) => email.id === reminder.emailId);
  if (!task) return null;
  return <article className={`mm-reminder-card${task.status === 'completed' ? ' completed' : ''}`}><span className="mm-reminder-icon"><Clock3 size={19}/></span><div><div className="mm-card-title-row"><h3>{task.title}</h3><PriorityBadge priority={task.priority}/></div><div className="mm-meta-line"><span>Deadline: <b>{formatDate(task.dueDate)}</b></span><span>Source: <b>{source?.sender || (task.emailId ? 'Saved email action' : 'Local app task')}</b></span></div><div className="mm-card-actions"><button onClick={() => { toggleTask(task.id); setToast(task.status === 'completed' ? 'Task and reminder reopened.' : 'Task and reminder completed.'); }}>{task.status === 'completed' ? 'Reopen' : 'Complete'}</button><button onClick={() => { dismissReminder(reminder); setToast('App reminder dismissed.'); }}>Dismiss</button>{task.emailId && !source?.deleted && <Link to={`/app/email/${task.emailId}`}>Open Email <ArrowRight size={14}/></Link>}</div></div></article>;
}
export default function RemindersPage() {
  const { reminderItems, taskItems, setReminder, isDemo, today } = useAppState();
  const items = reminderItems.filter((reminder) => !reminder.dismissed && taskItems.some((task) => task.id === reminder.taskId));
  const groups = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later', 'Completed'];
  const available = taskItems.filter((task) => task.dueDate && task.status !== 'completed' && !items.some((reminder) => reminder.taskId === task.id));
  return <div className="mm-page"><PageHeading title="Smart Reminders" subtitle={isDemo ? 'Sample deadlines grouped around 9 October 2026. No notifications are scheduled.' : 'Confirmed and app-edited deadlines grouped around today. No notifications are scheduled.'}/><div className="mm-reminder-groups">{groups.map((group) => { const grouped = items.filter((reminder) => { const task = taskItems.find((item) => item.id === reminder.taskId); return task.status === 'completed' ? group === 'Completed' : deadlineGroup(task.dueDate, today) === group; }); if (group === 'Overdue' && !grouped.length) return null; return <section key={group}><div className="mm-group-heading"><h2>{group}</h2><span>{grouped.length}</span></div>{grouped.length ? <div className="mm-card-stack">{grouped.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder}/>)}</div> : <p className="mm-group-empty">No reminders in this group.</p>}</section>; })}</div>{available.length > 0 && <section className="mm-surface mm-padded-surface mm-add-reminders"><div className="mm-section-header"><h2>Add or restore an app reminder</h2></div>{available.map((task) => <div key={task.id} className="mm-add-reminder-row"><span>{task.title}</span><button className="mm-text-button" onClick={() => setReminder(task)}>Add Reminder</button></div>)}</section>}</div>;
}
