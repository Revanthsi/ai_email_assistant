import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useAppState } from '../AppState';
import { formatDate, dayOffset } from '../demoDates';
import { PriorityBadge } from './Common';
import { ConfirmDialog, Modal } from './Modal';

export function TaskCard({ task, editable = false, onEdit }) {
  const { emails, toggleTask, deleteTask, setToast, today, isDemo, taskBusy } = useAppState();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const source = emails.find((email) => email.id === task.emailId);
  const overdue = task.status !== 'completed' && dayOffset(task.dueDate, today) < 0 && task.dueDate;
  return <article className={`mm-task-card${task.status === 'completed' ? ' completed' : ''}`}>
    <input className="mm-task-checkbox" type="checkbox" aria-label={`Complete ${task.title}`} disabled={taskBusy.includes(task.id)} checked={task.status === 'completed'} onChange={async () => { if (await toggleTask(task.id) === false) return; setToast(task.status === 'completed' ? 'Task reopened.' : 'Task completed across all views.'); }}/>
    <div className="mm-task-content"><div className="mm-card-title-row"><h3>{task.title}</h3><PriorityBadge priority={task.priority}/></div><div className="mm-meta-line"><span>Source: <b>{source?.sender || (task.emailId ? 'Saved email action' : 'Local app task')}{source?.deleted ? ' (removed)' : ''}</b></span><span><CalendarDays size={14}/>{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span><span className={overdue ? 'mm-overdue' : 'mm-status-text'}>{overdue ? 'Overdue' : task.status}</span></div><div className="mm-card-actions"><button disabled={taskBusy.includes(task.id)} onClick={async () => { if (await toggleTask(task.id) === false) return; setToast(task.status === 'completed' ? 'Task reopened.' : 'Task completed across all views.'); }}>{task.status === 'completed' ? 'Reopen' : 'Mark Complete'}</button>{task.emailId && !source?.deleted && <Link to={`/app/email/${task.emailId}`}>Open Email <ArrowRight size={14}/></Link>}{task.evidence && <p className="mm-task-evidence">Evidence: “{task.evidence}” · deadline: {task.deadline_confidence}</p>}{editable && <><button onClick={() => onEdit(task)}>Edit Task</button><button className="mm-delete-link" onClick={() => setConfirmDelete(true)}>Delete Task</button></>}</div></div>
    {confirmDelete && <ConfirmDialog title={isDemo ? 'Delete this demo task?' : 'Delete this app task?'} message={isDemo ? 'The task and its reminder will be removed from the current session.' : 'This removes the saved app task and its reminder. Gmail is unchanged.'} onClose={() => setConfirmDelete(false)} onConfirm={async () => { if (await deleteTask(task.id) === false) return; setConfirmDelete(false); setToast('App task deleted.'); }}/>}
  </article>;
}
export function TaskForm({ task, onClose }) {
  const { saveTask, setToast, isDemo } = useAppState();
  const [title, setTitle] = useState(task?.title || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [priority, setPriority] = useState(task?.priority || (isDemo ? 'medium' : 'normal'));
  const [saving, setSaving] = useState(false);
  const save = async (event) => {
    event.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    const saved = await saveTask({ ...task, id: task?.id || `task-${crypto.randomUUID()}`, title: title.trim(), dueDate: dueDate || null, priority, status: task?.status || 'pending', origin: task?.origin || 'local', emailId: task?.emailId || null });
    if (saved === false) { setSaving(false); return; }
    setToast(task ? 'Task updated across all views.' : 'Local app task created.');
    onClose();
  };
  return <Modal title={task ? 'Edit task' : isDemo ? 'Create demo task' : 'Create app task'} onClose={onClose}><form className="mm-edit-form" onSubmit={save}><label>Task title<input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} autoFocus/></label><label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)}/></label><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="high">High</option>{isDemo ? <option value="medium">Medium</option> : <><option value="urgent">Urgent</option><option value="normal">Normal</option></>}<option value="low">Low</option></select></label><p className="mm-demo-label">{isDemo ? 'Demo timeline: 9 October 2026. Changes last until page reload.' : 'App tasks are saved on the backend. Gmail is unchanged.'}</p><div className="mm-modal-actions"><button type="button" className="mm-secondary-button" onClick={onClose}>Cancel</button><button className="mm-primary-button" type="submit" disabled={saving}>Save task</button></div></form></Modal>;
}
