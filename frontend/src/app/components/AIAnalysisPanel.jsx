import React, { useId, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Copy, PenLine, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { useAppState } from '../AppState';
import { formatDate } from '../demoDates';
import { PriorityBadge, RiskBadge } from './Common';

export function AIRecommendationCard({ email, onReply }) {
  const { taskItems, saveTask, setReminder, setToast, isDemo } = useAppState();
  const available = email.actionItems.filter((action) => !taskItems.some((task) => task.id === action.id));
  const createTasks = () => {
    available.forEach((action) => saveTask({ id: action.id, title: action.title, emailId: email.id, dueDate: action.dueDate, priority: email.priority, status: 'pending', origin: 'email' }));
    setToast(available.length ? 'Sample action items added to Tasks.' : 'These sample tasks are already available in Tasks.');
  };
  const addReminder = () => {
    const task = taskItems.find((item) => item.emailId === email.id && item.dueDate);
    if (task) setReminder(task); else setToast('Add a task with a due date before setting a demo reminder.');
  };
  return <div className="mm-recommendation"><div className="mm-rec-title"><Sparkles size={16}/>Recommended next action</div><p>{email.recommendation}</p><div className="mm-rec-actions"><button onClick={onReply}>View example reply <ArrowRight size={14}/></button>{email.actionItems.length > 0 && <>{isDemo && <button onClick={createTasks}>Create Task <ArrowRight size={14}/></button>}<button onClick={addReminder}>Set Reminder <ArrowRight size={14}/></button></>}</div></div>;
}

function ReplyDraft({ email }) {
  const { setToast, preferences } = useAppState();
  const [draft, setDraft] = useState(email.reply);
  const [version, setVersion] = useState(0);
  const draftRef = useRef(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(draft); setToast('Reply copied to clipboard.'); }
    catch { draftRef.current?.focus(); draftRef.current?.select(); setToast('Clipboard unavailable. The draft is selected so you can copy it.'); }
  };
  const regenerate = () => {
    const next = version + 1;
    setVersion(next);
    setDraft(next % 2 ? email.reply.replace('Thank you', 'Thanks').replace('Thanks for', 'Thank you for') + '\n\nI will follow up if anything changes.' : email.reply);
    setToast('Another predefined example is ready. No model was called.');
  };
  return <div className="mm-analysis-tab-content"><div className="mm-analysis-detail-icon"><PenLine size={20}/></div><h3>Example reply</h3><p>Predefined example text · preferred tone: {preferences.replyTone}. Review and edit before copying.</p><label className="mm-field">Reply draft<textarea ref={draftRef} className="mm-reply-editor" rows={9} value={draft} onChange={(event) => setDraft(event.target.value)}/></label><div className="mm-card-actions"><button onClick={copy}><Copy size={15}/>Copy Reply</button><button onClick={regenerate}><RotateCcw size={15}/>Regenerate Example</button><button onClick={() => draftRef.current?.focus()}>Edit Draft</button></div></div>;
}
export function AIAnalysisPanel({ email, compact = false }) {
  const [tab, setTab] = useState('Summary');
  const { taskItems, toggleTask, setToast, analyzeEmail, analysisPreferences, connection, taskBusy } = useAppState();
  const id = useId();
  if (!email) return null;
  const real = email.source === 'gmail';
  const ready = !real || email.analysisStatus === 'completed';
  const tabs = ['Summary', 'Action Items', 'Reply', 'Security'];
  return <section className={`mm-analysis-panel${compact ? ' compact' : ''}`} aria-label={`Analysis of ${email.subject}`}>
    <div className="mm-analysis-header"><div className="mm-analysis-mark"><Sparkles size={17}/></div><div><span>{real ? 'EMAIL INTELLIGENCE' : 'ILLUSTRATIVE INTELLIGENCE'}</span><h2>AI Analysis</h2></div></div>
    <p className="mm-demo-label">{real ? `Gmail analysis · ${email.analysisStatus}` : 'Illustrative AI analysis · Demo data'}</p>{real && <div className="mm-analysis-control"><p>{!analysisPreferences.analysisConsent ? 'Enable Gemini analysis consent in Settings first.' : 'Analyze this email on request. Review the result against the original message.'}</p><button className="mm-primary-button" disabled={email.analysisStatus === 'analyzing' || !analysisPreferences.analysisConsent || !connection.ai_configured || ready} onClick={() => analyzeEmail(email.id)}>{email.analysisStatus === 'analyzing' ? 'Analyzing…' : ready ? 'Analysis complete' : email.analysisStatus === 'failed' ? 'Retry analysis' : 'Analyze email'}</button>{email.analysisError && <p role="alert">{email.analysisError.message}</p>}</div>}
    <div className="mm-analysis-tabs" role="tablist" aria-label="AI analysis">{tabs.map((name, index) => <button key={name} id={`${id}-tab-${index}`} role="tab" aria-selected={tab === name} aria-controls={`${id}-panel`} tabIndex={tab === name ? 0 : -1} className={tab === name ? 'active' : ''} onClick={() => setTab(name)} onKeyDown={(event) => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; setTab(tabs[next]); document.getElementById(`${id}-tab-${next}`)?.focus(); }}>{name}</button>)}</div>
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tabs.indexOf(tab)}`}>
      {tab === 'Summary' && !ready && <p className="mm-analysis-summary">{email.analysisStatus === 'analyzing' ? 'Analysis is in progress…' : 'No completed analysis yet. The original message is available to review.'}</p>}{tab === 'Summary' && ready && <><h3 className="mm-analysis-section-title">Email Understanding</h3><p className="mm-analysis-summary">{email.summary}</p>{real && <div className="mm-analysis-reasons"><p><b>Intent reason:</b> {email.analysis.intent.reason}</p><p><b>Priority reason:</b> {email.analysis.priority.reason}</p></div>}<div className="mm-analysis-grid"><div><span>INTENT</span><b>{email.intent}</b></div><div><span>PRIORITY</span><PriorityBadge priority={email.priority}/></div><div><span>CATEGORY</span><b>{email.category}</b></div><div><span>DEADLINE</span><b>{formatDate(email.deadline)}</b></div><div className="wide"><span>ACTION ITEMS</span><b>{email.actionItems.map((item) => item.title).join('; ') || 'No extracted action items'}</b></div><div className="wide"><span>SECURITY</span><RiskBadge risk={email.riskLevel}/></div></div><AIRecommendationCard email={email} onReply={() => setTab('Reply')}/></>}
      {tab === 'Action Items' && <div className="mm-analysis-tab-content"><h3>{real ? 'Extracted tasks' : 'Sample extracted tasks'}</h3>{email.actionItems.length ? email.actionItems.map((action) => { const task = taskItems.find((item) => item.id === action.id); return <label key={action.id} className="mm-analysis-task"><input type="checkbox" checked={task?.status === 'completed'} disabled={!task || taskBusy.includes(action.id)} onChange={async () => { if (await toggleTask(action.id) === false) return; setToast(task.status === 'completed' ? 'Task reopened.' : 'Task completed across the workspace.'); }}/><span><b>{task?.title || action.title}</b><small>{formatDate(task?.dueDate || action.dueDate)}{!task && ' · Task was removed'}</small>{real && <><small>Deadline confidence: {action.deadline_confidence}</small><small>Evidence: “{action.evidence}”</small><small>{action.reason}</small><small>Completion: {action.completion_requirement}</small></>}</span><CheckCircle2 size={15}/></label>; }) : <p>{ready ? 'No extracted action items.' : 'Analyze the email to extract action items.'}</p>}<AIRecommendationCard email={email} onReply={() => setTab('Reply')}/></div>}
      <div hidden={tab !== 'Reply'}><ReplyDraft key={email.id} email={email}/></div>
      {tab === 'Security' && <div className="mm-analysis-tab-content"><div className={`mm-analysis-detail-icon ${email.riskLevel}`}><ShieldCheck size={20}/></div><h3>{real ? 'Preliminary security information' : 'Illustrative risk assessment'}</h3><RiskBadge risk={email.riskLevel}/>{email.riskReasons.length ? <ul className="mm-reason-list">{email.riskReasons.map((reason) => <li key={reason}><AlertTriangle size={14}/>{reason}</li>)}</ul> : <p>{real ? 'No automated security assessment is performed in Phase 1. Sender names and AI classifications are not proof of authenticity.' : 'No demo risk indicators recorded.'}</p>}<p>{real ? 'Verify unexpected requests independently and inspect links and attachments in a trusted mail client. This app does not determine whether an email is safe or malicious.' : 'These are supplied sample indicators, not live email scanning. The demo does not verify that a message is safe.'}</p></div>}
    </div>
  </section>;
}
