import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createWorkspaceState, workspaceReducer } from './stateActions';
import { API_BASE, adaptEmail, apiRequest, remindersFromTasks, setCsrf } from '../services/api';
import { DEMO_DATE } from '../data/mockEmails';

const AppContext = createContext(null);
const emptyGmail = () => ({ ...createWorkspaceState(), emails: [], taskItems: [], reminderItems: [], profile: { name: 'Gmail account', email: '' } });
export function AppStateProvider({ children }) {
  const [demo, demoDispatch] = useReducer(workspaceReducer, undefined, createWorkspaceState);
  const [gmail, gmailDispatch] = useReducer(workspaceReducer, undefined, emptyGmail);
  const [mode, setMode] = useState('demo');
  const [connection, setConnection] = useState({ checked: false, connected: false, configured: false, ai_configured: false });
  const [sync, setSync] = useState({ loading: false, error: '', nextPage: null, syncedAt: null, estimate: 0, warnings: [] });
  const [analysisPreferences, setAnalysisPreferences] = useState({ analysisConsent: false });
  const [taskBusy, setTaskBusy] = useState([]);
  const [toast, setToast] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const inWorkspace = location.pathname.startsWith('/app');
  const generation = useRef(0), modeRef = useRef(mode), gmailRef = useRef(gmail), refreshing = useRef(null);
  modeRef.current = mode; gmailRef.current = gmail;
  const state = mode === 'demo' ? demo : gmail;
  const isDemo = mode === 'demo';
  const today = isDemo ? DEMO_DATE : new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const dispatch = isDemo ? demoDispatch : gmailDispatch;
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const fail = (error) => {
    setToast(error.message);
    if (error.status === 401) {
      generation.current += 1;
      gmailDispatch({ type: 'source/replace', patch: emptyGmail() });
      setConnection((current) => ({ ...current, connected: false, reconnect_required: true }));
      setSync({ loading: false, error: error.message, nextPage: null, warnings: [] });
    }
  };
  const loadTasks = async (version) => {
    const { items } = await apiRequest('/action-items');
    if (version === generation.current) gmailDispatch({ type: 'source/replace', patch: { taskItems: items, reminderItems: remindersFromTasks(items) } });
  };
  const refreshGmail = async (pageToken = null) => {
    const version = generation.current;
    if (refreshing.current === version) return;
    refreshing.current = version;
    setSync((current) => ({ ...current, loading: true, error: '' }));
    try {
      const data = await apiRequest(`/emails?limit=20${pageToken ? `&page_token=${encodeURIComponent(pageToken)}` : ''}`);
      const incoming = data.emails.map(adaptEmail);
      const previous = pageToken ? gmailRef.current.emails : [];
      const merged = [...previous.filter((email) => !incoming.some((item) => item.id === email.id)), ...incoming];
      if (version !== generation.current) return;
      gmailDispatch({ type: 'source/replace', patch: { emails: merged } });
      setSync({ loading: false, error: '', nextPage: merged.length >= 200 ? null : data.next_page_token, syncedAt: new Date(data.synced_at * 1000), estimate: data.result_size_estimate, warnings: data.warnings });
      await loadTasks(version);
    } catch (error) {
      if (version === generation.current) { fail(error); setSync((current) => ({ ...current, loading: false, error: error.message })); }
    } finally { if (refreshing.current === version) refreshing.current = null; }
  };
  const checkConnection = async () => {
    const version = generation.current;
    try {
      const data = await apiRequest('/auth/google/status');
      if (version !== generation.current) return;
      setCsrf(data.csrf_token); setConnection({ ...data, checked: true, error: '' }); setAnalysisPreferences(data.preferences);
      if (!data.connected || (gmailRef.current.profile.email && gmailRef.current.profile.email !== data.account_email)) {
        generation.current += 1;
        gmailDispatch({ type: 'source/replace', patch: emptyGmail() });
      }
      if (data.connected) gmailDispatch({ type: 'profile/update', patch: { name: data.account_email.split('@')[0], email: data.account_email } });
      const outcome = new URLSearchParams(location.search).get('gmail');
      if (outcome) {
        if (outcome === 'connected' && data.connected) { setMode('gmail'); await refreshGmail(); setToast('Gmail connected with read-only access. Analysis runs only when you request it.'); }
        else setToast(outcome === 'cancelled' ? 'Google authorization was cancelled. Demo mode is still available.' : 'Google authorization failed. Check the backend configuration and connect again.');
        const url = new URL(window.location.href); url.searchParams.delete('gmail'); window.history.replaceState(null, '', url);
      } else if (modeRef.current === 'gmail' && data.connected) await refreshGmail();
    } catch (error) {
      if (version === generation.current) setConnection({ checked: true, connected: false, configured: false, ai_configured: false, error: error.message });
    }
  };
  useEffect(() => { if (inWorkspace) checkConnection(); }, [inWorkspace]);
  const switchMode = async (next) => {
    if (next === mode) return;
    generation.current += 1;
    setMode(next); setComposeOpen(false); setNotificationsOpen(false); setSync((current) => ({ ...current, loading: false, error: '' }));
    gmailDispatch({ type: 'source/replace', patch: { emails: gmailRef.current.emails.map((email) => email.analysisStatus === 'analyzing' ? { ...email, analysisStatus: 'unanalyzed' } : email) } });
    if (next === 'gmail' && connection.connected) await refreshGmail();
  };
  const connectGmail = async () => {
    try {
      const status = await apiRequest('/auth/google/status'); setCsrf(status.csrf_token);
      if (!status.configured) { setToast('Configure Google OAuth and ENCRYPTION_KEY in backend/.env first. See the setup guide.'); return; }
      window.location.assign(`${API_BASE}/auth/google/start`);
    } catch (error) { fail(error); }
  };
  const disconnectGmail = async () => {
    try {
      const result = await apiRequest('/auth/google/disconnect', { method: 'POST' });
      generation.current += 1; gmailDispatch({ type: 'source/replace', patch: emptyGmail() });
      setMode('demo'); setComposeOpen(false); setNotificationsOpen(false); setAnalysisPreferences({ analysisConsent: false });
      setConnection({ ...connection, connected: false, account_email: null, reconnect_required: false });
      setSync({ loading: false, error: '', nextPage: null, warnings: [] }); setToast(result.message);
      const status = await apiRequest('/auth/google/status'); setCsrf(status.csrf_token);
    } catch (error) { fail(error); }
  };
  const analyzeEmail = async (id) => {
    const version = generation.current;
    gmailDispatch({ type: 'email/update', id, patch: { analysisStatus: 'analyzing', analysisError: null } });
    try {
      const email = await apiRequest(`/emails/${encodeURIComponent(id)}/analyze`, { method: 'POST' });
      if (version !== generation.current) return;
      gmailDispatch({ type: 'email/update', id, patch: adaptEmail(email) }); await loadTasks(version);
    } catch (error) {
      if (version !== generation.current) return;
      fail(error); gmailDispatch({ type: 'email/update', id, patch: { analysisStatus: 'failed', analysisError: { message: error.message } } });
    }
  };
  const loadEmail = async (id) => {
    const version = generation.current;
    try {
      const email = await apiRequest(`/emails/${encodeURIComponent(id)}`);
      if (version === generation.current) gmailDispatch({ type: 'email/upsert', email: adaptEmail(email) });
    } catch (error) { if (version === generation.current) fail(error); }
  };
  const updateEmail = (id, patch) => dispatch({ type: 'email/update', id, patch });
  const persistTask = async (id, patch, create = false) => {
    const version = generation.current;
    setTaskBusy((current) => [...current, id]);
    try {
      await apiRequest(create ? '/action-items' : `/action-items/${encodeURIComponent(id)}`, { method: create ? 'POST' : 'PATCH', body: patch });
      await loadTasks(version); return true;
    } catch (error) { if (version === generation.current) fail(error); return false; }
    finally { setTaskBusy((current) => current.filter((item) => item !== id)); }
  };
  const toggleTask = (id) => isDemo ? demoDispatch({ type: 'task/toggle', id }) : persistTask(id, { status: state.taskItems.find((task) => task.id === id)?.status === 'completed' ? 'pending' : 'completed' });
  const saveTask = (task) => isDemo ? demoDispatch({ type: 'task/save', task }) : persistTask(task.id, { title: task.title, dueDate: task.dueDate, priority: task.priority }, !state.taskItems.some((item) => item.id === task.id));
  const deleteTask = (id) => isDemo ? demoDispatch({ type: 'task/delete', id }) : persistTask(id, { deleted: true });
  const setReminder = (task) => {
    if (isDemo) demoDispatch({ type: 'reminder/add', reminder: { id: `reminder-${task.id}`, taskId: task.id, emailId: task.emailId, dueDate: task.dueDate, completed: task.status === 'completed', dismissed: false } });
    else persistTask(task.id, { reminderDismissed: false });
    setToast(`${isDemo ? 'Demo reminder added' : 'App reminder restored'}. No notification was scheduled.`);
  };
  const dismissReminder = (reminder) => isDemo ? demoDispatch({ type: 'reminder/dismiss', id: reminder.id }) : persistTask(reminder.taskId, { reminderDismissed: true });
  const saveAnalysisPreferences = async (analysisConsent) => {
    try { const preferences = await apiRequest('/settings', { method: 'PATCH', body: { analysisConsent } }); setAnalysisPreferences(preferences); }
    catch (error) { fail(error); }
  };
  return <AppContext.Provider value={{ ...state, dispatch, mode, isDemo, today, connection, sync, taskBusy, analysisPreferences, switchMode, checkConnection, connectGmail, disconnectGmail, refreshGmail, analyzeEmail, loadEmail, saveAnalysisPreferences, updateEmail, toggleTask, saveTask, deleteTask, setReminder, dismissReminder, toast, setToast, composeOpen, setComposeOpen, notificationsOpen, setNotificationsOpen }}>{children}</AppContext.Provider>;
}
export function useAppState() {
  const state = useContext(AppContext);
  if (!state) throw new Error('AppStateProvider is required');
  return state;
}
