import React, { useState } from 'react';
import { Save, Send, Sparkles } from 'lucide-react';
import { useAppState } from '../AppState';
import { ConfirmDialog, Modal } from './Modal';

export function ComposeForm({ onClose }) {
  const { draft, dispatch, setToast, isDemo } = useAppState();
  const [values, setValues] = useState({ ...draft });
  const [discardOpen, setDiscardOpen] = useState(false);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const generate = () => {
    if (!values.subject.trim()) { setToast('Add a subject to create a local example draft.'); return; }
    const topic = values.subject.trim();
    const message = values.tone === 'Concise' ? `Hello,\n\nFollowing up on ${topic}. Please share an update when you can.\n\nThanks,\nRevanth` : values.tone === 'Friendly' ? `Hi,\n\nI hope you’re doing well! I wanted to check in about ${topic}. Let me know what you think.\n\nThanks,\nRevanth` : `Hello,\n\nI’m writing regarding ${topic}. Please share your thoughts or an update at your convenience.\n\nBest regards,\nRevanth`;
    update('message', message);
    setToast('A local example draft is ready. No AI service was called.');
  };
  const save = () => { dispatch({ type: 'draft/save', draft: values }); setToast('Draft saved in this session until page reload.'); onClose?.(); };
  const discard = () => { const empty = { to: '', subject: '', message: '', tone: 'Professional' }; dispatch({ type: 'draft/save', draft: empty }); setValues(empty); setDiscardOpen(false); setToast('Demo draft discarded.'); onClose?.(); };
  return <><form className="mm-compose-form" onSubmit={(event) => { event.preventDefault(); setToast(isDemo ? 'Demo mode: email sending will be available after provider integration.' : 'Gmail read-only mode: email sending is not supported.'); }}>
    <label>To<input type="email" placeholder="name@example.com" value={values.to} onChange={(event) => update('to', event.target.value)} required/></label><label>Subject<input placeholder="Email subject" value={values.subject} onChange={(event) => update('subject', event.target.value)} required/></label><label>Message<textarea rows={9} placeholder="Write your message..." value={values.message} onChange={(event) => update('message', event.target.value)} required/></label>
    <div className="mm-compose-assist"><span><Sparkles size={16}/>Demo writing assistance</span><select aria-label="Compose tone" value={values.tone} onChange={(event) => update('tone', event.target.value)}><option>Professional</option><option>Friendly</option><option>Concise</option></select><button type="button" onClick={generate}>Generate Example Draft</button></div><div className="mm-compose-footer"><span>Local example · no email is sent</span><div><button type="button" className="mm-secondary-button" onClick={() => setDiscardOpen(true)}>Discard</button><button type="button" className="mm-secondary-button" onClick={save}><Save size={15}/>Save Draft</button><button type="submit" className="mm-primary-button"><Send size={15}/>Send</button></div></div>
  </form>{discardOpen && <ConfirmDialog title="Discard this draft?" message="The current draft and the saved session draft will be cleared." confirmLabel="Discard" onClose={() => setDiscardOpen(false)} onConfirm={discard}/>}</>;
}
export function ComposeModal({ onClose }) { return <Modal title="New demo message" onClose={onClose} wide><ComposeForm onClose={onClose}/></Modal>; }
