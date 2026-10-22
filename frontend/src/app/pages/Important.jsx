import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAppState } from '../AppState';
import { filterEmails } from '../stateActions';
import { PageHeading, FilterTabs } from '../components/Common';
import { EmailList } from '../components/EmailList';

export default function ImportantPage() {
  const { emails, isDemo } = useAppState();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All Important');
  const important = emails.filter((email) => !email.deleted && !email.spam && (email.isStarred || ['urgent', 'high'].includes(email.priority)));
  const visible = filterEmails(important.filter((email) => filter === 'All Important' || (filter === 'High Priority' && ['urgent', 'high'].includes(email.priority)) || (filter === 'Starred' && email.isStarred) || (filter === 'Has Deadline' && email.deadline)));
  return <div className="mm-page"><PageHeading title="Important Emails" subtitle="Starred messages and available high-priority classifications."/><div className="mm-summary-strip"><Star size={18}/><span>{important.length} important messages in the current workspace.</span></div><FilterTabs options={['All Important', 'High Priority', 'Starred', 'Has Deadline']} value={filter} onChange={setFilter}/><section className="mm-surface mm-padded-surface"><EmailList items={visible} onSelect={(email) => navigate(`/app/email/${email.id}`)}/></section></div>;
}
