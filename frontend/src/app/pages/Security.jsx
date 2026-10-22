import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CircleAlert, Mail, ShieldCheck } from 'lucide-react';
import { useAppState } from '../AppState';
import { PageHeading, RiskBadge, StatsCard, EmptyState } from '../components/Common';

export default function SecurityPage() {
  const { emails, isDemo } = useAppState();
  const dataset = emails.filter((email) => !email.deleted);
  const alerts = dataset.filter((email) => email.riskLevel !== 'low');
  const [selectedId, setSelectedId] = useState(null);
  const selected = alerts.find((email) => email.id === selectedId) || alerts[0];
  const categories = [...new Set(alerts.flatMap((email) => email.riskReasons))];
  if (!isDemo) return <div className="mm-page"><PageHeading title="Security Center" subtitle="Preliminary information only; no automated phishing detection."/><div className="mm-security-banner"><ShieldCheck size={20}/><div><b>Gmail security is not assessed</b><span>This phase does not verify sender authenticity, links or attachments, and does not label messages safe or malicious. Check unexpected requests through an independent channel.</span></div></div><section className="mm-surface mm-padded-surface"><h2>Review messages carefully</h2><p>AI intent and priority are recommendations, not security findings. Attachment names are displayed without downloading files.</p><Link className="mm-text-button" to="/app/inbox">Review inbox <ArrowRight size={14}/></Link></section></div>;
  return <div className="mm-page"><PageHeading title="Security Center" subtitle="Understand the supplied risk indicators before you act."/><div className="mm-security-banner"><ShieldCheck size={20}/><div><b>Illustrative records · demo data</b><span>These examples are not live phishing detection. A low-risk label does not verify an email’s safety.</span></div></div>
    <div className="mm-stats-grid"><StatsCard icon={Mail} label="Emails in Demo Dataset" value={dataset.length}/><StatsCard icon={AlertTriangle} label="High-Risk Examples" value={dataset.filter((email) => email.riskLevel === 'high').length} tone="red"/><StatsCard icon={CircleAlert} label="Medium-Risk Examples" value={dataset.filter((email) => email.riskLevel === 'medium').length} tone="amber"/><StatsCard icon={ShieldCheck} label="Low-Risk Examples" value={dataset.filter((email) => email.riskLevel === 'low').length} tone="teal"/></div>
    <div className="mm-security-grid"><section className="mm-surface mm-padded-surface"><div className="mm-section-header"><div><p className="mm-section-kicker">SUPPLIED INDICATORS</p><h2>Risk signals in the examples</h2></div></div><div className="mm-risk-categories">{categories.map((category, index) => <div key={category}><span>{String(index + 1).padStart(2, '0')}</span><b>{category}</b><AlertTriangle size={16}/></div>)}</div></section>
    <section className="mm-surface mm-padded-surface"><div className="mm-section-header"><h2>Suspicious examples</h2></div>{selected ? <><div className="mm-security-alert-list">{alerts.map((email) => <button key={email.id} className={selected.id === email.id ? 'active' : ''} aria-pressed={selected.id === email.id} onClick={() => setSelectedId(email.id)}><span><b>{email.sender}</b><small>{email.subject}</small></span><RiskBadge risk={email.riskLevel}/></button>)}</div><div className="mm-security-selected"><div className="mm-card-title-row"><h3>{selected.subject}</h3><RiskBadge risk={selected.riskLevel}/></div><p>Supplied sample indicators</p><div className="mm-reason-tags">{selected.riskReasons.map((reason) => <span key={reason}>{reason}</span>)}</div><p>{selected.recommendation}</p><Link className="mm-text-button" to={`/app/email/${selected.id}`}>View Email <ArrowRight size={14}/></Link></div></> : <EmptyState title="No risk examples in this session" description="Reload to restore the original sample dataset."/ >}</section></div>
  </div>;
}
