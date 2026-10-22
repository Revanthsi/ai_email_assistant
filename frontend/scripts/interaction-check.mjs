// Optional DOM check. jsdom lives in a temporary QA directory, not app dependencies.
// Override MAILMATE_QA_ROOT if it is installed elsewhere.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import React, { act } from 'react';
import { createServer } from 'vite';

const qaRequire = createRequire(join(process.env.MAILMATE_QA_ROOT || join(tmpdir(), 'mailmate-workspace-qa'), 'package.json'));
const { JSDOM } = qaRequire('jsdom');
const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost:3000/app', pretendToBeVisual: true });
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  assert.ok(String(url).endsWith('/auth/google/status'), `Demo unexpectedly called API: ${url}`);
  return { ok: true, status: 200, json: async () => ({ connected: false, configured: false, ai_configured: false, csrf_token: 'demo-test-csrf', preferences: { analysisConsent: false } }) };
};
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.SVGElement = dom.window.SVGElement;
globalThis.Element = dom.window.Element;
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.AbortController = dom.window.AbortController;
globalThis.AbortSignal = dom.window.AbortSignal;
globalThis.Node = dom.window.Node;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
let viewportWidth = 1440;
window.matchMedia = (query) => ({ matches: /max-width:\s*(\d+)px/.test(query) ? viewportWidth <= Number(query.match(/max-width:\s*(\d+)px/)[1]) : false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
let copied = '';
Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (value) => { copied = value; } } });
const { MemoryRouter } = await import('react-router-dom');
const { createRoot } = await import('react-dom/client');
const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
let root;
const consoleErrors = [];
const originalError = console.error;
console.error = (...args) => { if (!String(args[0]).includes('React Router Future Flag')) { consoleErrors.push(args.map(String).join(' ')); originalError(...args); } };

function textButton(text, scope = document) {
  const element = [...scope.querySelectorAll('button')].find((item) => item.textContent.trim() === text);
  assert.ok(element, `Missing button: ${text}`);
  return element;
}
function labelControl(label, scope = document) {
  const element = scope.querySelector(`[aria-label="${label}"]`);
  assert.ok(element, `Missing control: ${label}`);
  return element;
}
async function click(element) { assert.ok(element); await act(async () => { element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); }); }
async function value(element, next) {
  assert.ok(element);
  await act(async () => {
    const prototype = element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : element.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, next);
    element.dispatchEvent(new window.Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}
async function navigate(path) { const link = document.querySelector(`a[href="${path}"]`); assert.ok(link, `Missing route link ${path}`); await click(link); }
async function mount(path, width = 1440) {
  viewportWidth = width;
  if (root) await act(async () => root.unmount());
  root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(MemoryRouter, { initialEntries: [path], future: { v7_startTransition: true, v7_relativeSplatPath: true } }, React.createElement(AppRoutes))));
}
let AppRoutes;
try {
  ({ default: AppRoutes } = await vite.ssrLoadModule('/src/routes/AppRoutes.jsx'));
  await mount('/app/inbox');
  await click(labelControl('Open Interview Schedule from Cognizant Careers'));
  assert.equal(document.querySelector('.mm-inbox-analysis .mm-message-subject h2').textContent, 'Interview Schedule');
  assert.ok(document.querySelector('a[href="/app/inbox"][aria-current="page"]'));
  await click(labelControl('Unstar Interview Schedule'));
  await click(labelControl('Mark Interview Schedule as unread'));
  assert.ok(document.querySelector('.mm-email-row.selected.unread'));
  await value(labelControl('Search inbox'), 'cognizant');
  assert.equal(document.querySelectorAll('.mm-inbox-list .mm-email-row').length, 1);
  await value(labelControl('Filter by priority'), 'low');
  assert.ok(document.querySelector('.mm-inbox-list').textContent.includes('No emails found'));
  await value(labelControl('Filter by priority'), 'all');
  await value(labelControl('Filter read status'), 'read');
  assert.ok(document.querySelector('.mm-inbox-list').textContent.includes('No emails found'));
  await value(labelControl('Filter read status'), 'all');
  await click(labelControl('Refresh mock inbox'));
  assert.ok(document.querySelector('.mm-refresh-note'));

  await click(textButton('Action Items', document.querySelector('.mm-inbox-analysis')));
  await click(document.querySelector('.mm-analysis-task input'));
  await navigate('/app/action-items');
  await click(textButton('Completed'));
  assert.ok(document.querySelector('.mm-task-card.completed').textContent.includes('Confirm interview availability'));
  await navigate('/app/tasks');
  const emailTask = [...document.querySelectorAll('.mm-task-card')].find((item) => item.textContent.includes('Confirm interview availability'));
  await click(textButton('Edit Task', emailTask));
  let dialog = document.querySelector('[role="dialog"]');
  await value(dialog.querySelector('input:not([type="date"])'), 'Confirm revised interview time');
  await click(textButton('Save task', dialog));
  await navigate('/app/action-items');
  assert.ok(document.querySelector('.mm-main').textContent.includes('Confirm revised interview time'));
  await navigate('/app/tasks');
  await click(textButton('Create Task'));
  dialog = document.querySelector('[role="dialog"]');
  await value(dialog.querySelector('input:not([type="date"])'), 'Prepare demo checklist');
  await value(dialog.querySelector('input[type="date"]'), '2026-10-10');
  await click(textButton('Save task', dialog));
  let localTask = [...document.querySelectorAll('.mm-task-card')].find((item) => item.textContent.includes('Prepare demo checklist'));
  assert.ok(localTask);
  await click(textButton('Delete Task', localTask));
  await click(textButton('Cancel', document.querySelector('[role="dialog"]')));
  assert.ok(document.querySelector('.mm-main').textContent.includes('Prepare demo checklist'));
  localTask = [...document.querySelectorAll('.mm-task-card')].find((item) => item.textContent.includes('Prepare demo checklist'));
  await click(textButton('Delete Task', localTask));
  await click(textButton('Delete', document.querySelector('[role="dialog"]')));
  assert.ok(!document.querySelector('.mm-main').textContent.includes('Prepare demo checklist'));

  await navigate('/app/reminders');
  const before = document.querySelectorAll('.mm-reminder-card').length;
  await click(textButton('Dismiss', document.querySelector('.mm-reminder-card')));
  assert.equal(document.querySelectorAll('.mm-reminder-card').length, before - 1);

  await navigate('/app/inbox');
  await click(labelControl('Open Project Report Submission from Professor Sharma'));
  await click(textButton('Reply', document.querySelector('.mm-inbox-analysis')));
  const reply = document.querySelector('.mm-reply-editor');
  await value(reply, 'Edited contextual demo reply');
  await click(textButton('Summary', document.querySelector('.mm-inbox-analysis')));
  await click(textButton('Reply', document.querySelector('.mm-inbox-analysis')));
  assert.equal(document.querySelector('.mm-reply-editor').value, 'Edited contextual demo reply');
  await click(textButton('Copy Reply'));
  assert.equal(copied, 'Edited contextual demo reply');
  await click(textButton('Regenerate Example'));
  assert.notEqual(document.querySelector('.mm-reply-editor').value, copied);

  await click(textButton('Compose'));
  dialog = document.querySelector('[role="dialog"]');
  await value(dialog.querySelector('input[type="email"]'), 'demo@example.com');
  await value([...dialog.querySelectorAll('input')].find((item) => item.type !== 'email'), 'Project confirmation');
  await click(textButton('Generate Example Draft', dialog));
  assert.ok(dialog.querySelector('textarea').value.includes('Project confirmation'));
  await click(textButton('Save Draft', dialog));
  assert.equal(document.querySelector('[role="dialog"]'), null);
  await click(textButton('Compose'));
  dialog = document.querySelector('[role="dialog"]');
  assert.equal(dialog.querySelector('input[type="email"]').value, 'demo@example.com');
  await act(async () => dialog.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })));
  assert.ok(document.querySelector('[role="status"]').textContent.includes('Demo mode: email sending will be available after provider integration.'));
  await click(labelControl('Close dialog', dialog));

  await navigate('/app/settings');
  const securityToggle = [...document.querySelectorAll('.mm-setting-row')].find((item) => item.textContent.includes('Security alerts')).querySelector('input');
  await click(securityToggle);
  await click(labelControl('Notifications'));
  assert.ok(!document.querySelector('.mm-notification-popover').textContent.includes('risk examples'));
  await click(labelControl('Close notifications'));
  await navigate('/app/inbox');
  await click(labelControl('Open Project Report Submission from Professor Sharma'));
  await click(labelControl('Archive email'));
  assert.ok(!document.querySelector('.mm-inbox-list').textContent.includes('Project Report Submission'));
  await navigate('/app/archived');
  assert.ok(document.querySelector('.mm-main').textContent.includes('Project Report Submission'));
  await click(labelControl('Open Sprint recap from Team Updates'));
  await click(labelControl('Delete email'));
  await click(textButton('Delete', document.querySelector('[role="dialog"]')));
  await navigate('/app/archived');
  assert.ok(!document.querySelector('.mm-main').textContent.includes('Sprint recap'));

  await mount('/app/inbox', 390);
  assert.equal(document.querySelector('.mm-sidebar').getAttribute('aria-hidden'), 'true');
  await click(labelControl('Open navigation'));
  assert.equal(document.querySelector('.mm-sidebar').hasAttribute('inert'), false);
  await navigate('/app/tasks');
  assert.equal(document.querySelector('.mm-sidebar').getAttribute('aria-hidden'), 'true');
  await navigate('/app/inbox');
  await click(labelControl('Open Project Report Submission from Professor Sharma'));
  assert.equal(document.querySelector('.mm-inbox-page'), null);
  assert.ok(document.querySelector('.mm-detail-page'));
  await click(labelControl('Mark email unread'));
  assert.ok(document.querySelector('.mm-message-sender').textContent.includes('Unread'));
  await click(document.querySelector('.mm-back-link'));
  assert.ok(document.querySelector('.mm-inbox-page'));

  for (const width of [1440, 1280, 1024, 768, 430, 390, 375]) {
    await mount('/app/inbox', width);
    await click(labelControl('Open Interview Schedule from Cognizant Careers'));
    assert.equal(Boolean(document.querySelector('.mm-detail-page')), width <= 1020, `Incorrect selection routing at simulated width ${width}`);
  }
  await mount('/');
  await click(textButton('Get Started'));
  assert.equal(document.querySelector('.mm-page-heading h1').textContent, 'Your Email Workspace');

  assert.deepEqual(consoleErrors, []);
  console.log('Rendered handler checks passed: inbox, tasks, reminders, reply, compose, preferences, archive/delete, and mobile navigation logic. This is not a visual layout test.');
} finally {
  globalThis.fetch = originalFetch;
  if (root) await act(async () => root.unmount());
  console.error = originalError;
  await vite.close();
  dom.window.close();
}
