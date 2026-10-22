import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { resolveEmailId } from '../../data/mockEmails';
import { useAppState } from '../AppState';
import { EmailMessage } from '../components/EmailMessage';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';
import { EmptyState, PageHeading } from '../components/Common';

export default function EmailDetailPage() {
  const { id } = useParams();
  const { emails, updateEmail, isDemo, connection, loadEmail } = useAppState();
  const navigate = useNavigate();
  const analysisRef = useRef(null);
  const email = emails.find((item) => item.id === (isDemo ? resolveEmailId(id) : id) && !item.deleted);
  useEffect(() => { if (email) updateEmail(email.id, { isRead: true }); else if (!isDemo && connection.connected) loadEmail(id); }, [id, isDemo, connection.connected]);
  const analysis = () => { analysisRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); analysisRef.current?.focus({ preventScroll: true }); };
  return <div className="mm-page mm-detail-page"><Link className="mm-back-link" to="/app/inbox"><ArrowLeft size={16}/>Back to Inbox</Link>{email ? <><PageHeading eyebrow={isDemo ? 'SAMPLE EMAIL' : 'GMAIL MESSAGE'} title={email.subject}/><div className="mm-detail-grid"><EmailMessage email={email} onRemoved={() => navigate('/app/inbox')} onAnalysis={analysis}/><aside ref={analysisRef} tabIndex={-1} className="mm-analysis-anchor"><AIAnalysisPanel key={email.id} email={email}/></aside></div></> : <><PageHeading title="Email unavailable"/><EmptyState title="This email is not available" description="It may have been removed in this session. Choose another message from the inbox."/></>}</div>;
}
