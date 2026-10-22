import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { useAppState } from './AppState';
import { ComposeModal } from './components/Compose';
import { SourceStatus } from './components/ConnectionPanel';

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { toast, setToast, composeOpen, setComposeOpen } = useAppState();
  const location = useLocation();
  useEffect(() => { setNavOpen(false); }, [location.pathname]);
  return <div className="mm-app"><a className="mm-skip-link" href="#app-main">Skip to workspace</a><AppHeader navOpen={navOpen} onMenu={() => setNavOpen(true)}/><div className="mm-shell"><AppSidebar open={navOpen} onClose={() => setNavOpen(false)}/><main className="mm-main" id="app-main"><SourceStatus/><Outlet/></main></div>{composeOpen && <ComposeModal onClose={() => setComposeOpen(false)}/ >}{toast && <div className="mm-toast" role="status" aria-live="polite"><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16}/></button></div>}</div>;
}
