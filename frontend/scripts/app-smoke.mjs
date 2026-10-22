import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const originalError = console.error;
const unexpectedWarnings = [];
console.error = (...args) => {
  if (!String(args[0]).includes('useLayoutEffect does nothing on the server')) { unexpectedWarnings.push(String(args[0])); originalError(...args); }
};
const checks = [
  ['/', 'Smarter Emails'], ['/features', 'Everything You Need'],
  ['/how-it-works', 'How MailMate AI'], ['/about', 'More Than an'],
  ['/contact', 'Your intelligent email companion'], ['/get-started', 'Enter MailMate AI'],
  ['/app', 'Your Email Workspace'], ['/app/inbox', 'Search inbox'],
  ['/app/important', 'All Important'], ['/app/action-items', 'Action Items'],
  ['/app/tasks', 'Create Task'], ['/app/reminders', 'Smart Reminders'],
  ['/app/security', 'Emails in Demo Dataset'], ['/app/insights', 'Action Items by Status'],
  ['/app/settings', 'Preferred reply tone'], ['/app/email/email-001', 'Project Report Submission'],
  ['/app/email/email-002', 'Interview Schedule'], ['/app/email/1', 'Project Report Submission'],
  ['/app/email/missing', 'Email unavailable'], ['/app/scheduled', 'Scheduled Emails'],
  ['/app/archived', 'Archived Emails'], ['/app/spam', 'Spam &amp; Suspicious'],
  ['/app/compose', 'Save Draft'],
];
try {
  const { default: AppRoutes } = await vite.ssrLoadModule('/src/routes/AppRoutes.jsx');
  const failures = [];
  for (const [route, expected] of checks) {
    const html = renderToString(React.createElement(MemoryRouter, { initialEntries: [route] }, React.createElement(AppRoutes)));
    if (!html.includes(expected)) failures.push(`${route}: missing ${expected}`);
    if (route.startsWith('/app')) {
      if (!html.includes('Application navigation') || !html.includes('Demo Mode')) failures.push(`${route}: missing demo workspace layout`);
      if (html.includes('Primary navigation') || html.includes('AI Ready') || html.includes('Emails Scanned')) failures.push(`${route}: unexpected workspace claim/layout`);
    } else if (html.includes('Application navigation')) failures.push(`${route}: workspace navigation leaked into marketing`);
    if ((route === '/app/inbox' || route === '/app/email/email-001') && !html.includes('Illustrative AI analysis')) failures.push(`${route}: missing analysis demo label`);
  }
  failures.push(...unexpectedWarnings);
  console.log(`${checks.length} routes rendered; failures: ${failures.length ? failures.join(', ') : 'none'}`);
  if (failures.length) process.exitCode = 1;
} finally { console.error = originalError; await vite.close(); }
