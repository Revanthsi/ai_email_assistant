import React from 'react';
import { CalendarClock, ClipboardList, Mail, ShieldCheck } from 'lucide-react';
import { countBy } from '../../data/insights';
import { useAppState } from '../AppState';
import { isUpcoming, deadlineGroup } from '../demoDates';
import { PageHeading, StatsCard } from '../components/Common';

export function BarChart({ title, data }) {
  const { isDemo } = useAppState();
  const max = Math.max(1, ...data.map((item) => item.value));
  return <figure className="mm-chart"><figcaption><h3>{title}</h3><small>{isDemo ? 'Demo data' : 'Loaded Gmail data'}</small></figcaption><div className="mm-chart-bars">{data.map((item) => <div key={item.label}><span>{item.label}</span><div aria-hidden="true"><i style={{ width: `${item.value / max * 100}%`, backgroundColor: item.color }}/></div><b>{item.value}</b></div>)}</div></figure>;
}
export default function InsightsPage() {
  const { emails, taskItems, isDemo, today } = useAppState();
  const dataset = emails.filter((email) => !email.deleted);
  const extracted = taskItems.filter((task) => task.origin === 'email');
  const upcoming = taskItems.filter((task) => isUpcoming(task, today));
  const priorities = (isDemo ? ['high', 'medium', 'low'] : ['urgent', 'high', 'normal', 'low', 'unanalyzed']).map((label, index) => ({ label, value: dataset.filter((email) => email.priority === label).length, color: ['#b65d55', '#aa7c37', '#378576', '#4f78b5', '#748299'][index] }));
  const categories = countBy(dataset, 'category');
  const statuses = ['pending', 'completed'].map((label) => ({ label, value: extracted.filter((task) => task.status === label).length, color: label === 'pending' ? '#1677FF' : '#378576' }));
  const deadlines = ['Today', 'Tomorrow', 'This Week', 'Later'].map((label) => ({ label, value: taskItems.filter((task) => task.status !== 'completed' && task.dueDate && deadlineGroup(task.dueDate, today) === label).length, color: '#6b8de3' }));
  return <div className="mm-page"><PageHeading title="AI Insights" subtitle={isDemo ? 'Demo statistics from the same emails and tasks you work with.' : 'Statistics for loaded Gmail messages and saved app tasks; not full-mailbox totals.'}/><div className="mm-stats-grid"><StatsCard icon={Mail} label={isDemo ? 'Demo Emails' : 'Loaded Gmail Emails'} value={dataset.length}/><StatsCard icon={ClipboardList} label="Extracted Action Items" value={extracted.length} tone="violet"/><StatsCard icon={CalendarClock} label="Upcoming Deadlines" value={upcoming.length} note={isDemo ? 'Next 7 days · demo timeline' : 'Next 7 days · current dates'} tone="teal"/><StatsCard icon={ShieldCheck} label={isDemo ? 'Risk Examples' : 'Analyzed Emails'} value={dataset.filter((email) => isDemo ? email.riskLevel !== 'low' : email.analysisStatus === 'completed').length} tone="amber"/></div><section className="mm-surface mm-padded-surface"><div className="mm-section-header"><h2>Your Inbox Patterns</h2><span className="mm-demo-label">{isDemo ? 'Demo data · 9 October 2026' : 'Loaded Gmail data'}</span></div><div className="mm-charts-grid"><BarChart title="Emails by Priority" data={priorities}/><BarChart title="Emails by Category" data={categories}/><BarChart title="Action Items by Status" data={statuses}/><BarChart title="Pending Deadlines" data={deadlines}/></div></section></div>;
}
