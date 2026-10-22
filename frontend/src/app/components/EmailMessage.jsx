import React, { useState } from 'react';
import { Archive, ArrowRight, Mail, MailOpen, Paperclip, Star, Trash2 } from 'lucide-react';
import { useAppState } from '../AppState';
import { formatTimestamp } from '../demoDates';
import { PriorityBadge } from './Common';
import { ConfirmDialog } from './Modal';

export function EmailMessage({ email, onRemoved, onAnalysis, compact = false }) {
  const { updateEmail, setToast, isDemo } = useAppState();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const archive = () => { updateEmail(email.id, { archived: !email.archived }); setToast(email.archived ? 'Email returned to inbox.' : 'Email archived in the app view only; Gmail is unchanged.'); onRemoved?.(); };
  const remove = () => { updateEmail(email.id, { deleted: true }); setConfirmDelete(false); setToast('Email removed from this app session; Gmail is unchanged.'); onRemoved?.(); };
  return <article className={`mm-surface mm-message${compact ? ' mm-message-compact' : ''}`}>
    <div className="mm-message-toolbar"><span><Mail size={16}/>EMAIL MESSAGE</span><div className="mm-message-tools">
      <button aria-label={email.isStarred ? 'Unstar email' : 'Star email'} aria-pressed={email.isStarred} className={email.isStarred ? 'starred' : ''} onClick={() => { updateEmail(email.id, { isStarred: !email.isStarred }); setToast(email.isStarred ? 'Email unstarred.' : 'Email starred.'); }}><Star size={18} fill={email.isStarred ? 'currentColor' : 'none'}/></button>
      <button aria-label={email.isRead ? 'Mark email unread' : 'Mark email read'} onClick={() => { updateEmail(email.id, { isRead: !email.isRead }); setToast(email.isRead ? 'Email marked unread.' : 'Email marked read.'); }}>{email.isRead ? <Mail size={18}/> : <MailOpen size={18}/>}</button>
      <button aria-label={email.archived ? 'Move email to inbox' : 'Archive email'} onClick={archive}><Archive size={18}/></button>
      <button aria-label="Delete email" onClick={() => setConfirmDelete(true)}><Trash2 size={18}/></button>
    </div></div>
    <div className="mm-message-content"><div className="mm-message-subject"><h2>{email.subject}</h2><PriorityBadge priority={email.priority}/></div><div className="mm-message-sender"><span className={`mm-sender-avatar mm-avatar-${email.category.toLowerCase()}`}>{email.initials}</span><div><b>{email.sender}</b><span>{email.senderEmail}</span><span>{email.source === 'gmail' ? `To ${email.recipient || 'you'}` : 'To you'} · {email.isRead ? 'Read' : 'Unread'}</span></div><time dateTime={email.timestamp}>{formatTimestamp(email.timestamp)}</time></div><div className="mm-message-body">{email.body}</div>{email.attachments.length > 0 && <div className="mm-attachments" aria-label="Attachment names">{email.attachments.map((attachment) => <button key={attachment} onClick={() => setToast(isDemo ? 'This is an illustrative attachment; no file is connected.' : 'Only the attachment name is shown. Open Gmail to review the file; no attachment is downloaded here.')}><Paperclip size={14}/>{attachment}<span>{isDemo ? 'Demo' : 'Name only'}</span></button>)}</div>}<div className="mm-message-footer"><button className="mm-secondary-button" onClick={onAnalysis}>Open AI Analysis <ArrowRight size={15}/></button><span>{isDemo ? 'Illustrative analysis available below' : 'Read-only access · message changes affect this app view only'}</span></div></div>
    {confirmDelete && <ConfirmDialog title={isDemo ? 'Delete this demo email?' : 'Hide this message in the app?'} message={isDemo ? 'This removes the message from the current session. Reloading the page restores the sample dataset.' : 'This hides the message until the next Gmail refresh. The original Gmail message is unchanged.'} onClose={() => setConfirmDelete(false)} onConfirm={remove}/>}
  </article>;
}
