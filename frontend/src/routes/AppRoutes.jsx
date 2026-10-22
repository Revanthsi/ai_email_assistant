import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import GetStarted from '../pages/GetStarted';
import AppLayout from '../app/AppLayout';
import { AppStateProvider } from '../app/AppState';
import { DashboardPage, InboxPage, EmailDetailPage, ImportantPage, ActionItemsPage, TasksPage, ScheduledPage, ArchivedPage, SpamPage, SecurityPage, RemindersPage, InsightsPage, SettingsPage, ComposePage } from '../app/AppPages';

const Workspace = () => <AppLayout/>;
const MarketingSection = ({ section }) => {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, [section]);
  return <Home />;
};

const AppRoutes = () => {
  return (
    <AppStateProvider><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/features" element={<MarketingSection section="features" />} />
      <Route path="/how-it-works" element={<MarketingSection section="how-it-works" />} />
      <Route path="/about" element={<MarketingSection section="about" />} />
      <Route path="/contact" element={<MarketingSection section="contact" />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/app" element={<Workspace />}>
        <Route index element={<DashboardPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="important" element={<ImportantPage />} />
        <Route path="action-items" element={<ActionItemsPage />} />
        <Route path="scheduled" element={<ScheduledPage />} />
        <Route path="archived" element={<ArchivedPage />} />
        <Route path="spam" element={<SpamPage />} />
        <Route path="email/:id" element={<EmailDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="compose" element={<ComposePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></AppStateProvider>
  );
};

export default AppRoutes;
