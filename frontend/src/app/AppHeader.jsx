import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Mail, Menu, Search, Sparkles, X } from 'lucide-react';
import { useAppState } from './AppState';
import { isUpcoming } from './demoDates';

export default function AppHeader({ onMenu, navOpen }) {
  const navigate = useNavigate();
  const { emails, taskItems, profile, preferences, notificationsOpen, setNotificationsOpen, isDemo, mode, switchMode, today } = useAppState();
  const [query, setQuery] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null), notificationRef = useRef(null);
  const pending = taskItems.filter((task) => task.status === 'pending' && task.origin === 'email').length;
  const risks = emails.filter((email) => !email.deleted && email.riskLevel !== 'low' && email.riskLevel !== 'unknown').length;
  const deadlines = taskItems.filter((task) => isUpcoming(task, today)).length;
  const initials = profile.name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2) || 'DM';
  useEffect(() => {
    const close = (event) => {
      if (!userRef.current?.contains(event.target)) setUserOpen(false);
      if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const key = (event) => { if (event.key === 'Escape') { setUserOpen(false); setNotificationsOpen(false); } };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', key); };
  }, [setNotificationsOpen]);
  const go = (to) => { setUserOpen(false); setNotificationsOpen(false); navigate(to); };
  return <header className="mm-header"><div className="mm-brand-wrap"><button className="mm-icon-button mm-mobile-menu" aria-label="Open navigation" aria-controls="mm-navigation" aria-expanded={navOpen} onClick={onMenu}><Menu size={20}/></button><Link className="mm-brand" to="/app"><span className="mm-brand-icon"><Mail size={19}/><Sparkles size={10} className="mm-brand-spark"/></span><span>MailMate <b>AI</b><small className="mm-workspace-label">Workspace</small></span></Link></div>
    <form className="mm-search" role="search" onSubmit={(event) => { event.preventDefault(); navigate(`/app/inbox${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`); }}><Search size={18}/><input aria-label="Search emails, people, or topics" placeholder="Search emails, people, or topics..." value={query} onChange={(event) => setQuery(event.target.value)}/><kbd>↵</kbd></form>
    <div className="mm-header-actions"><select className="mm-source-select" aria-label="Workspace data source" value={mode} onChange={(event) => switchMode(event.target.value)}><option value="demo">Demo data</option><option value="gmail">Gmail account</option></select><span className="mm-ai-ready"><span/>{isDemo ? 'Demo Mode' : 'Gmail · Read-only'}</span><div ref={notificationRef}><button className="mm-icon-button mm-notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setUserOpen(false); setNotificationsOpen(!notificationsOpen); }}><Bell size={19}/></button>{notificationsOpen && <div className="mm-popover mm-notification-popover"><div className="mm-popover-heading">{isDemo ? 'Demo notifications' : 'App notifications'}<button aria-label="Close notifications" onClick={() => setNotificationsOpen(false)}><X size={16}/></button></div>{preferences.priorityNotifications && <button onClick={() => go('/app/action-items')}><b>{pending} pending {isDemo ? 'sample ' : ''}actions</b><span>Review your email tasks</span></button>}{preferences.securityAlerts && <button onClick={() => go('/app/security')}><b>{risks} {isDemo ? 'risk examples' : 'preliminary indicators'}</b><span>Review available preliminary indicators</span></button>}{preferences.deadlineReminders && <button onClick={() => go('/app/reminders')}><b>{deadlines} approaching deadlines</b><span>{isDemo ? 'Based on the demo timeline' : 'Based on current dates'}</span></button>}{!preferences.priorityNotifications && !preferences.securityAlerts && !preferences.deadlineReminders && <p className="mm-menu-empty">App notifications are disabled in Preferences.</p>}</div>}</div>
    <div className="mm-user-menu" ref={userRef}><button className="mm-avatar-button" aria-label="User menu" aria-expanded={userOpen} onClick={() => { setNotificationsOpen(false); setUserOpen(!userOpen); }}><span>{initials}</span><ChevronDown size={14}/></button>{userOpen && <div className="mm-popover mm-user-popover"><div className="mm-popover-heading">{profile.name}<span>{profile.email}</span></div><button onClick={() => go('/app/settings')}>Profile</button><button onClick={() => go('/app/settings')}>Preferences</button><button onClick={() => go('/')}>Return to Website</button></div>}</div></div>
  </header>;
}
