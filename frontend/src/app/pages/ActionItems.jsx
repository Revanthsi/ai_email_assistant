import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useAppState } from '../AppState';
import { dayOffset } from '../demoDates';
import { EmptyState, FilterTabs, PageHeading } from '../components/Common';
import { TaskCard } from '../components/TaskCard';

export function filterTasks(tasks, filter, today) {
  return tasks.filter((task) => filter === 'All' || (filter === 'Pending' && task.status === 'pending') || (filter === 'Completed' && task.status === 'completed') || (filter === 'Overdue' && task.status !== 'completed' && task.dueDate && dayOffset(task.dueDate, today) < 0));
}
export default function ActionItemsPage() {
  const { taskItems, today } = useAppState();
  const [filter, setFilter] = useState('All');
  const items = filterTasks(taskItems.filter((task) => task.origin === 'email'), filter, today);
  return <div className="mm-page"><PageHeading title="Action Items" subtitle="Review extracted tasks and supporting evidence. Completion affects this app, never Gmail."/><FilterTabs options={['All', 'Pending', 'Completed', 'Overdue']} value={filter} onChange={setFilter}/><div className="mm-card-stack">{items.length ? items.map((task) => <TaskCard key={task.id} task={task}/>) : <EmptyState icon={ClipboardList} title={`No ${filter.toLowerCase()} action items`} description="Try a different filter."/ >}</div></div>;
}
