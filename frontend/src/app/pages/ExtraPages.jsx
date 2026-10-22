import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarClock, Filter, Mail, Search } from 'lucide-react';
import { scheduledEmails } from '../../data/scheduled';
import { useAppState } from '../AppState';
import { formatDate } from '../demoDates';
import { filterEmails } from '../stateActions';
import { EmptyState, PageHeading, RiskBadge } from '../components/Common';
import { EmailList } from '../components/EmailList';
import { ConfirmDialog, Modal } from '../components/Modal';
import { ComposeForm } from '../components/Compose';

export function ArchivedPage() {
  const { emails } = useAppState();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('all');
  return <div className="mm-page"><PageHeading title="Archived Emails" subtitle="Messages set aside locally for reference."/><section className="mm-surface mm-padded-surface"><div className="mm-inbox-filters"><label className="mm-list-search"><Search size={16}/><input aria-label="Search archived emails" placeholder="Search archived emails..." value={query} onChange={(event) => setQuery(event.target.value)}/></label><label className="mm-filter-select"><Filter size={15}/><select aria-label="Filter archived priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label></div><EmailList items={filterEmails(emails.filter((email) => email.archived), { query, priority })} onSelect={(email) => navigate(`/app/email/${email.id}`)}/></section></div>;
}
export function SpamPage() {
  const { emails, isDemo } = useAppState();
  const items = emails.filter((email) => email.spam && !email.deleted);
  if (!isDemo) return <div className="mm-page"><PageHeading title="Spam & Suspicious" subtitle="Only Gmail INBOX messages are synchronized in Phase 1."/><EmptyState title="Spam folder is not synchronized" description="No safety conclusion is implied. Review Spam directly in Gmail."/></div>;
  return <div className="mm-page"><PageHeading title="Spam & Suspicious" subtitle="Illustrative security examples, not live filtering."/><div className="mm-card-stack">{items.length ? items.map((email) => <article key={email.id} className="mm-alert-card"><span className="mm-alert-icon"><AlertTriangle size={20}/></span><div><div className="mm-card-title-row"><h3>{email.subject}</h3><RiskBadge risk={email.riskLevel}/></div><p>{email.sender} · {email.senderEmail}</p><div className="mm-reason-tags">{email.riskReasons.map((reason) => <span key={reason}>{reason}</span>)}</div><Link className="mm-text-button" to={`/app/email/${email.id}`}>View Analysis <ArrowRight size={14}/></Link></div></article>) : <EmptyState title="No suspicious examples in this view"/>}</div></div>;
}
export function ScheduledPage() {
  const [scheduled, setScheduled] = useState(scheduledEmails);
  const [editing, setEditing] = useState(null);
  const [canceling, setCanceling] = useState(null);
  const { setToast, isDemo } = useAppState();
  const save = (event) => { event.preventDefault(); setScheduled((items) => items.map((item) => item.id === editing.id ? editing : item)); setEditing(null); setToast('Demo schedule updated. No email is scheduled with a provider.'); };
  if (!isDemo) return <div className="mm-page"><PageHeading title="Scheduled Emails" subtitle="Gmail scheduling and sending are not available with read-only access."/><EmptyState title="Scheduling is a demo-only feature" description="Switch to Demo data to explore the existing schedule examples."/></div>;
  return <div className="mm-page"><PageHeading title="Scheduled Emails" subtitle="Local schedule examples. Nothing will be sent."/><div className="mm-card-stack">{scheduled.length ? scheduled.map((item) => <article className="mm-scheduled-card" key={item.id}><span className="mm-scheduled-icon"><Mail size={19}/></span><div><h3>{item.subject}</h3><p>To: {item.to}</p><div className="mm-meta-line"><span><CalendarClock size={14}/>{formatDate(item.date)}, {item.time} IST</span><span>Demo only</span></div></div><div className="mm-scheduled-actions"><button onClick={() => setEditing({ ...item })}>Edit</button><button onClick={() => setCanceling(item)}>Cancel</button></div></article>) : <EmptyState title="No scheduled examples"/>}</div>{editing && <Modal title="Edit demo schedule" onClose={() => setEditing(null)}><form className="mm-edit-form" onSubmit={save}><label>Subject<input value={editing.subject} onChange={(event) => setEditing({ ...editing, subject: event.target.value })} required/></label><label>Send date<input type="date" value={editing.date} onChange={(event) => setEditing({ ...editing, date: event.target.value })} required/></label><label>Send time<input type="time" value={editing.time} onChange={(event) => setEditing({ ...editing, time: event.target.value })} required/></label><button className="mm-primary-button">Save changes</button></form></Modal>}{canceling && <ConfirmDialog title="Cancel this demo schedule?" message="This removes only the local example." confirmLabel="Cancel schedule" onClose={() => setCanceling(null)} onConfirm={() => { setScheduled((items) => items.filter((item) => item.id !== canceling.id)); setCanceling(null); setToast('Demo schedule canceled.'); }}/>}</div>;
}
export function ComposePage() { return <div className="mm-page"><PageHeading title="Compose" subtitle="Write and save a local demo draft."/><section className="mm-surface mm-compose-page-surface"><ComposeForm/></section></div>; }
