import React, { useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { useAppState } from '../AppState';
import { filterTasks } from './ActionItems';
import { PageHeading, FilterTabs, EmptyState } from '../components/Common';
import { TaskCard, TaskForm } from '../components/TaskCard';

export default function TasksPage() {
  const { taskItems, today } = useAppState();
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState(null);
  const visible = filterTasks(taskItems, filter, today);
  return <div className="mm-page"><PageHeading title="Tasks" subtitle="Manage email actions and your own app tasks in one place."><button className="mm-primary-button" onClick={() => setForm({})}><Plus size={16}/>Create Task</button></PageHeading><FilterTabs options={['All', 'Pending', 'Completed', 'Overdue']} value={filter} onChange={setFilter}/><div className="mm-card-stack">{visible.length ? visible.map((task) => <TaskCard key={task.id} task={task} editable onEdit={(item) => setForm({ task: item })}/>) : <EmptyState icon={ClipboardList} title="No tasks in this view" description="Create an app task or choose another filter."/ >}</div>{form && <TaskForm task={form.task} onClose={() => setForm(null)}/>}</div>;
}
