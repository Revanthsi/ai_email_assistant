import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const originalError = console.error;
console.error = (...args) => { if (!String(args[0]).includes('useLayoutEffect does nothing on the server')) originalError(...args); };

try {
  const { default: Home } = await vite.ssrLoadModule('/src/pages/Home.jsx');
  const { default: DemoModal } = await vite.ssrLoadModule('/src/components/DemoModal.jsx');
  const html = renderToString(React.createElement(MemoryRouter, null, React.createElement(Home)));
  const expected = [
    'Smarter Emails',
    'Everything You Need',
    'From Email Understanding',
    'How MailMate AI',
    'See AI Email Intelligence',
    'Stay Ahead of',
    'AI That Explains',
    'More Than an',
    'Turn Your Inbox',
    'Prof. Sharma',
    'LinkedIn',
    'AI Email Understanding',
    'Action Item Extraction',
    'Security Risk Detection',
    'Context-Aware Reply Generation',
    'Smart Reminders',
    'Explainable AI',
  ];
  const missing = expected.filter((text) => !html.includes(text));
  const ids = new Set(Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]));
  const missingAnchors = [...new Set(Array.from(html.matchAll(/href="#([^"]+)"/g), (match) => match[1]))].filter((target) => !ids.has(target));
  const getStarted = renderToString(React.createElement(DemoModal, { isOpen: true, onClose: () => {}, type: 'getStarted' }));
  const seeDemo = renderToString(React.createElement(DemoModal, { isOpen: true, onClose: () => {}, type: 'seeDemo' }));
  const modalChecks = getStarted.includes('Continue Exploring') && seeDemo.includes('Project Submission');
  console.log(`Rendered ${html.length} characters; missing content: ${missing.join(', ') || 'none'}; broken anchors: ${missingAnchors.join(', ') || 'none'}; modal markup: ${modalChecks ? 'present' : 'missing'}`);
  if (missing.length || missingAnchors.length || !modalChecks) process.exitCode = 1;
} finally {
  console.error = originalError;
  await vite.close();
}
