import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { useAppState } from '../AppState';

export function PageHeading({ eyebrow, title, subtitle, children }) {
  const { isDemo } = useAppState();
  eyebrow = eyebrow || (isDemo ? 'DEMO WORKSPACE · 9 OCT 2026' : 'GMAIL WORKSPACE · READ-ONLY');
  return <div className="mm-page-heading"><div><p className="mm-eyebrow">{eyebrow}</p><h1>{title}</h1>{subtitle && <p className="mm-page-subtitle">{subtitle}</p>}</div>{children && <div className="mm-heading-actions">{children}</div>}</div>;
}
export function PriorityBadge({ priority }) { return <span className={`mm-priority mm-priority-${priority}`}>{priority}</span>; }
export function RiskBadge({ risk }) { return <span className={`mm-risk mm-risk-${risk}`}>{risk === 'unknown' ? 'Not assessed' : `${risk} risk · demo`}</span>; }
export function StatsCard({ icon: Icon, label, value, note, to, tone = 'blue' }) {
  const { isDemo } = useAppState();
  note = note || (isDemo ? 'Demo data' : 'Loaded Gmail data');
  const content = <><div className={`mm-stat-icon ${tone}`}><Icon size={19}/></div><div className="mm-stat-label">{label}</div><div className="mm-stat-value">{value}</div><div className="mm-stat-note">{note}</div></>;
  return to ? <Link className="mm-stat-card" to={to}>{content}</Link> : <div className="mm-stat-card">{content}</div>;
}
export function EmptyState({ icon: Icon = Mail, title = 'Nothing here yet', description }) {
  return <div className="mm-empty"><span><Icon size={23}/></span><h3>{title}</h3>{description && <p>{description}</p>}</div>;
}
export function FilterTabs({ options, value, onChange, label = 'Filter results' }) {
  return <div className="mm-tabs" role="group" aria-label={label}>{options.map((option) => <button key={option} type="button" aria-pressed={value === option} className={value === option ? 'active' : ''} onClick={() => onChange(option)}>{option}</button>)}</div>;
}
export function InsightCard({ icon: Icon, title, text, to }) {
  return <Link className="mm-insight-item" to={to}><span className="mm-insight-icon"><Icon size={17}/></span><span><b>{title}</b><small>{text}</small></span><ArrowRight size={16}/></Link>;
}
