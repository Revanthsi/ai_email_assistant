import React, { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppState } from '../AppState';
import { filterEmails } from '../stateActions';
import { PageHeading, EmptyState } from '../components/Common';
import { EmailList } from '../components/EmailList';
import { InboxToolbar } from '../components/InboxToolbar';
import { EmailMessage } from '../components/EmailMessage';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';

export default function InboxPage() {
  const { emails, updateEmail, setToast, isDemo, connection, sync, refreshGmail } = useAppState();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [priority, setPriority] = useState('all');
  const [read, setRead] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedId, setSelectedId] = useState(params.get('selected'));
  const [selectionMode, setSelectionMode] = useState(false);
  const [checked, setChecked] = useState([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const analysisRef = useRef(null);
  const query = params.get('search') || '';
  const inbox = emails.filter((email) => !email.deleted && !email.archived && !email.spam);
  const filtered = filterEmails(inbox, { query, priority, read, sort });
  const selected = filtered.find((email) => email.id === selectedId) || filtered[0];
  const visibleChecked = checked.filter((id) => filtered.some((email) => email.id === id));
  const select = (email) => {
    updateEmail(email.id, { isRead: true });
    if (window.matchMedia('(max-width: 1020px)').matches) { navigate(`/app/email/${email.id}`); return; }
    setSelectedId(email.id);
  };
  const check = (id, value) => setChecked((current) => value ? [...new Set([...current, id])] : current.filter((item) => item !== id));
  const bulkRead = (isRead) => { visibleChecked.forEach((id) => updateEmail(id, { isRead })); setChecked([]); setToast(`${visibleChecked.length} ${isDemo ? 'demo' : 'app-view'} messages marked ${isRead ? 'read' : 'unread'}.`); };
  const openAnalysis = () => { analysisRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); analysisRef.current?.focus({ preventScroll: true }); };
  return <div className="mm-page mm-inbox-page"><PageHeading title="Inbox" subtitle={`${inbox.filter((email) => !email.isRead).length} unread · ${isDemo ? 'Sample messages' : 'Loaded Gmail messages'}, organized by what matters.`}/><div className="mm-inbox-workspace">
    <section className="mm-surface mm-inbox-list" aria-label="Inbox messages"><InboxToolbar query={query} onQuery={(search) => setParams(search ? { search } : {})} priority={priority} onPriority={setPriority} read={read} onRead={setRead} sort={sort} onSort={setSort} count={filtered.length} selectionMode={selectionMode} onSelectionMode={() => { setSelectionMode(!selectionMode); setChecked([]); }} isDemo={isDemo} loading={sync.loading} onRefresh={() => { if (!isDemo) { refreshGmail(); return; } setRefreshCount((value) => value + 1); setToast('Mock inbox refreshed locally. No email provider was contacted.'); }}/>{refreshCount > 0 && <p className="mm-refresh-note" role="status">Demo view refreshed · update {refreshCount}</p>}
    {selectionMode && <div className="mm-selection-bar"><label><input type="checkbox" aria-label="Select all visible messages" checked={filtered.length > 0 && visibleChecked.length === filtered.length} onChange={(event) => setChecked(event.target.checked ? filtered.map((email) => email.id) : [])}/>Select all</label><span>{visibleChecked.length} selected</span><button disabled={!visibleChecked.length} onClick={() => bulkRead(true)}>Mark read</button><button disabled={!visibleChecked.length} onClick={() => bulkRead(false)}>Mark unread</button></div>}
    <EmailList items={filtered} selectedId={selected?.id} onSelect={select} selectedIds={checked} onCheck={selectionMode ? check : undefined}/>{!isDemo && connection.connected && !sync.loading && !inbox.length && !sync.error && <p className="mm-group-empty">Your Gmail inbox has no messages in this page.</p>}{!isDemo && sync.nextPage && <button className="mm-secondary-button mm-load-more" disabled={sync.loading} onClick={() => refreshGmail(sync.nextPage)}>Load more Gmail messages</button>}</section>
    <aside className="mm-inbox-analysis" aria-label="Selected email">{selected ? <><div className="mm-analysis-context"><span>SELECTED EMAIL</span><Link to={`/app/email/${selected.id}`}>Open full view <ArrowRight size={14}/></Link></div><EmailMessage key={`message-${selected.id}`} email={selected} compact onAnalysis={openAnalysis}/><div ref={analysisRef} tabIndex={-1} className="mm-analysis-anchor"><AIAnalysisPanel key={selected.id} email={selected} compact/></div></> : <EmptyState title="No email selected" description="Change the filters to find a message."/>}</aside>
  </div></div>;
}
