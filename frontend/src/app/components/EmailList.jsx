import React from 'react';
import { CheckCircle2, Star, Mail, MailOpen, Paperclip } from 'lucide-react';
import { useAppState } from '../AppState';
import { formatTimestamp } from '../demoDates';
import { EmptyState, PriorityBadge } from './Common';

export function EmailRow({ email, selected = false, onSelect, compact = false, checked, onCheck }) {
  const { updateEmail, setToast } = useAppState();
  const toggleStar = () => { updateEmail(email.id, { isStarred: !email.isStarred }); setToast(email.isStarred ? 'Email unstarred.' : 'Email starred.'); };
  const toggleRead = () => { updateEmail(email.id, { isRead: !email.isRead }); setToast(email.isRead ? 'Email marked unread.' : 'Email marked read.'); };
  return <div className={`mm-email-row${!email.isRead ? ' unread' : ''}${selected ? ' selected' : ''}${compact ? ' compact' : ''}`}>
    {onCheck && <input type="checkbox" aria-label={`Select ${email.subject}`} checked={checked} onChange={(event) => onCheck(event.target.checked)}/>}
    <button className="mm-email-select" onClick={() => onSelect(email)} aria-label={`Open ${email.subject} from ${email.sender}`} aria-current={selected ? 'true' : undefined}>
      <span className={`mm-sender-avatar mm-avatar-${email.category.toLowerCase()}`}>{email.initials}</span>
      <span className="mm-email-main"><span className="mm-email-top"><b>{email.sender}</b><time dateTime={email.timestamp}>{formatTimestamp(email.timestamp)}</time></span><span className="mm-email-subject">{email.subject}</span><span className="mm-email-preview">{email.preview}</span><span className="mm-email-badges"><PriorityBadge priority={email.priority}/>{email.source === 'gmail' && <span className={`mm-analysis-status ${email.analysisStatus}`}>{email.analysisStatus}</span>}{email.actionItems.length > 0 && <span className="mm-action-label"><CheckCircle2 size={12}/>Action</span>}{email.attachments.length > 0 && <span className="mm-action-label"><Paperclip size={12}/>{email.attachments.length}</span>}<span className="mm-read-label">{email.isRead ? 'Read' : 'Unread'}</span></span></span>
    </button>
    {!compact && <div className="mm-email-row-controls"><button className={`mm-icon-button${email.isStarred ? ' starred' : ''}`} aria-label={`${email.isStarred ? 'Unstar' : 'Star'} ${email.subject}`} aria-pressed={email.isStarred} onClick={toggleStar}><Star size={16} fill={email.isStarred ? 'currentColor' : 'none'}/></button><button className="mm-icon-button" aria-label={`Mark ${email.subject} as ${email.isRead ? 'unread' : 'read'}`} onClick={toggleRead}>{email.isRead ? <Mail size={16}/> : <MailOpen size={16}/>}</button></div>}
  </div>;
}
export function EmailList({ items, selectedId, onSelect, compact = false, selectedIds, onCheck }) {
  return items.length ? <div className="mm-email-list">{items.map((email) => <EmailRow key={email.id} email={email} selected={email.id === selectedId} onSelect={onSelect} compact={compact} checked={selectedIds?.includes(email.id)} onCheck={onCheck ? (checked) => onCheck(email.id, checked) : undefined}/>)}</div> : <EmptyState title="No emails found" description="Try another search or filter."/>;
}
