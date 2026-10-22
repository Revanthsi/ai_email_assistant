import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Archive, CalendarClock, ChartNoAxesCombined, CircleAlert, ClipboardList, Inbox, LayoutDashboard, ListTodo, PenLine, Settings, ShieldCheck, Star, X } from 'lucide-react';
import { useAppState } from './AppState';

export default function AppSidebar({ open, onClose }) {
  const { emails, taskItems, setComposeOpen, isDemo } = useAppState();
  const sidebarRef = useRef(null);
  const [drawerMode, setDrawerMode] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1100px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1100px)');
    const change = () => setDrawerMode(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open || !drawerMode) return undefined;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector('button')?.focus();
    const key = (event) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key !== 'Tab') return;
      const elements = sidebarRef.current?.querySelectorAll('button, a[href]');
      const first = elements?.[0], last = elements?.[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus?.(); };
  }, [open, drawerMode]);
  const activeEmails = emails.filter((email) => !email.deleted);
  const nav = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/inbox', label: 'Inbox', icon: Inbox, count: activeEmails.filter((email) => !email.archived && !email.spam && !email.isRead).length },
    { to: '/app/important', label: 'Important', icon: Star, count: activeEmails.filter((email) => !email.spam && (email.isStarred || ['urgent', 'high'].includes(email.priority))).length },
    { to: '/app/action-items', label: 'Action Items', icon: ClipboardList, count: taskItems.filter((task) => task.origin === 'email' && task.status === 'pending').length },
    { to: '/app/tasks', label: 'Tasks', icon: ListTodo, count: taskItems.filter((task) => task.status === 'pending').length },
    { to: '/app/reminders', label: 'Reminders', icon: CalendarClock },
  ];
  const intelligence = [
    { to: '/app/security', label: 'Security Center', icon: ShieldCheck },
    { to: '/app/insights', label: 'AI Insights', icon: ChartNoAxesCombined },
  ];
  const folders = [
    { to: '/app/scheduled', label: 'Scheduled', icon: CalendarClock },
    { to: '/app/archived', label: 'Archived', icon: Archive },
    { to: '/app/spam', label: 'Spam', icon: CircleAlert },
  ];
  const render = ({ icon: Icon, ...item }) => <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose} className={({ isActive }) => `mm-nav-link${isActive ? ' active' : ''}`}><Icon size={18}/><span>{item.label}</span>{item.count !== undefined && <small>{item.count}</small>}</NavLink>;
  return <><div className={`mm-sidebar-backdrop${open ? ' open' : ''}`} onClick={onClose} aria-hidden="true"/><aside id="mm-navigation" ref={sidebarRef} inert={drawerMode && !open ? '' : undefined} aria-hidden={drawerMode && !open ? true : undefined} className={`mm-sidebar${open ? ' open' : ''}`} aria-label="Application navigation"><div className="mm-sidebar-mobile-top"><b>Workspace</b><button className="mm-icon-button" aria-label="Close navigation" onClick={onClose}><X size={19}/></button></div><button className="mm-compose-button" onClick={() => { onClose(); setComposeOpen(true); }}><PenLine size={18}/>Compose</button><div className="mm-nav-label">WORKSPACE</div><nav aria-label="Workspace">{nav.map(render)}</nav><div className="mm-sidebar-divider"/><div className="mm-nav-label">INTELLIGENCE</div><nav aria-label="Intelligence">{intelligence.map(render)}</nav><div className="mm-nav-label">MORE FOLDERS</div><nav aria-label="More folders">{folders.map(render)}</nav><div className="mm-sidebar-bottom">{render({ to: '/app/settings', label: 'Settings', icon: Settings })}<div className="mm-sidebar-plan">{isDemo ? 'Demo session · resets on reload' : 'Gmail · app tasks saved'}</div></div></aside></>;
}
