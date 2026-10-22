import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAppState } from '../AppState';
import { PageHeading } from '../components/Common';
import { ConnectionControls } from '../components/ConnectionPanel';

function SettingToggle({ label, description, checked, onChange }) {
  return <label className="mm-setting-row"><span><b>{label}</b><small>{description}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}/><i aria-hidden="true"/></label>;
}
export default function SettingsPage() {
  const { profile, preferences, dispatch, setToast, isDemo } = useAppState();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  useEffect(() => { setName(profile.name); setEmail(profile.email); }, [isDemo, profile.email]);
  const preference = (key, value) => { dispatch({ type: 'preference/update', key, value }); setToast('App preference updated for this session.'); };
  const saveProfile = (event) => { event.preventDefault(); dispatch({ type: 'profile/update', patch: { name: name.trim(), email } }); setToast('Display profile updated for this session. The connected Google identity is unchanged.'); };
  return <div className="mm-page"><PageHeading title="Settings" subtitle="Manage your connection and app preferences. UI preferences last for this session; Gmail analysis consent is saved on the backend."/><div className="mm-settings-grid"><ConnectionControls/><section className="mm-surface mm-settings-section"><div className="mm-section-header"><h2>Profile</h2></div><form onSubmit={saveProfile}><label className="mm-field">Display name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80}/></label><label className="mm-field">Email address<input readOnly={!isDemo} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required/></label><button type="submit" className="mm-secondary-button mm-profile-save">Save profile</button></form></section><section className="mm-surface mm-settings-section"><div className="mm-section-header"><h2>AI Preferences</h2></div><label className="mm-setting-select"><span>Preferred reply tone</span><select value={preferences.replyTone} onChange={(event) => preference('replyTone', event.target.value)}><option>Professional</option><option>Friendly</option><option>Concise</option></select></label><SettingToggle label="Priority notifications" description="Show priority items in the notification menu" checked={preferences.priorityNotifications} onChange={(value) => preference('priorityNotifications', value)}/><SettingToggle label="Security alerts" description="Show available risk indicators in the notification menu" checked={preferences.securityAlerts} onChange={(value) => preference('securityAlerts', value)}/><SettingToggle label="Deadline reminders" description="Show deadlines in the notification menu" checked={preferences.deadlineReminders} onChange={(value) => preference('deadlineReminders', value)}/></section><section className="mm-surface mm-settings-section"><div className="mm-section-header"><h2>Appearance</h2></div><div className="mm-appearance-row"><span className="mm-appearance-swatch"/><div><b>Light theme</b><small>Readable, focused email workspace</small></div><CheckCircle2 size={19}/></div></section></div></div>;
}
