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

const calls = [];
let connected = true, mailError = false, analysisError = false, syncRelease = null, analysisRelease = null;
let holdSync = false, holdAnalysis = false, emptyInbox = false;
let consent = false;
let savedTasks = [];
const originalFetch = globalThis.fetch;
const action = { id: 'action-real', title: 'Prepare actual report', description: 'Prepare the requested report', deadline: '2026-10-15', deadline_confidence: 'explicit', evidence: 'Please prepare the report by 15 October 2026.', reason: 'A report is requested.', completion_requirement: 'Prepare and review the report' };
const analysis = { summary: 'The sender requests a report. It is due on 15 October 2026.', intent: { category: 'action_required', reason: 'The sender asks for the report.' }, priority: { level: 'high', reason: 'An explicit deadline is provided.' }, action_items: [action], recommended_action: 'Prepare the requested report' };
const emails = [1, 2].map((number) => ({ id: String(100200300 + number), source: 'gmail', sender: 'Professor Example', senderEmail: 'prof@example.test', recipient: 'owner@example.test', subject: `Real mailbox report ${number}`, timestamp: '2026-10-09T08:00:00Z', preview: 'A report is requested.', body: 'Please prepare the report by 15 October 2026.', attachments: ['report.pdf'], isRead: false, isStarred: false, archived: false, spam: false, deleted: false, analysisStatus: 'unanalyzed', analysis: null, analysisError: null }));
const response = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => structuredClone(body) });
globalThis.fetch = async (url, options) => {
  const parsed = new URL(url);
  const path = parsed.pathname.replace('/api', '');
  const body = options.body ? JSON.parse(options.body) : null;
  calls.push({ path, method: options.method, body, headers: options.headers, credentials: options.credentials });
  if (path === '/auth/google/status') return response({ connected, account_email: connected ? 'owner@example.test' : null, configured: true, ai_configured: true, csrf_token: 'test-csrf', preferences: { analysisConsent: consent } });
  if (path === '/settings') { consent = body.analysisConsent; return response({ analysisConsent: consent }); }
  if (path === '/auth/google/disconnect') { connected = false; savedTasks = []; return response({ message: 'Local account data deleted.', disconnected: true, revoked: true }); }
  if (path === '/emails') {
    if (holdSync) await new Promise((resolve) => { syncRelease = resolve; });
    if (!connected) return response({ error: { code: 'not_connected', message: 'Connect Gmail again.' } }, 401);
    if (mailError) return response({ error: { code: 'gmail_unavailable', message: 'Gmail could not be reached.' } }, 502);
    if (emptyInbox) return response({ emails: [], next_page_token: null, result_size_estimate: 0, synced_at: Date.now() / 1000, warnings: [] });
    const second = parsed.searchParams.has('page_token');
    return response({ emails: [emails[second ? 1 : 0]], next_page_token: second ? null : 'second', result_size_estimate: 2, synced_at: Date.now() / 1000, warnings: [] });
  }
  if (path === '/action-items') {
    if (options.method === 'POST') { const task = { ...body, id: 'task-real', origin: 'local', status: 'pending', emailId: null }; savedTasks.push(task); return response(task); }
    return response({ items: savedTasks.filter((task) => !task.deleted) });
  }
  if (path.startsWith('/action-items/')) {
    const id = path.split('/').at(-1);
    const task = savedTasks.find((item) => item.id === id);
    Object.assign(task, body);
    return response(task);
  }
  if (path.endsWith('/analyze')) {
    if (holdAnalysis) await new Promise((resolve) => { analysisRelease = resolve; });
    const email = emails.find((item) => path.includes(item.id));
    if (analysisError) { email.analysisStatus = 'failed'; return response({ error: { code: 'invalid_analysis', message: 'The AI returned invalid analysis. Retry.' } }, 502); }
    email.analysisStatus = 'completed'; email.analysis = analysis;
    if (!savedTasks.length) savedTasks = [{ ...action, emailId: email.id, dueDate: action.deadline, origin: 'email', status: 'pending', priority: 'high', reminderDismissed: false }];
    return response(email);
  }
  if (path.startsWith('/emails/')) return response(emails.find((item) => path.includes(item.id)));
  throw new Error(`Unexpected request ${path}`);
};
let AppRoutes;
try {
  ({ default: AppRoutes } = await vite.ssrLoadModule('/src/routes/AppRoutes.jsx'));
  await mount('/app/inbox');
  assert.ok(document.querySelector('.mm-inbox-list').textContent.includes('Project Report Submission'));
  assert.ok(!document.querySelector('.mm-inbox-list').textContent.includes('Real mailbox report'));
  assert.equal(calls.filter((call) => call.path === '/emails').length, 0, 'Connected status must not silently replace demo data');

  holdSync = true;
  await value(labelControl('Workspace data source'), 'gmail');
  assert.ok(document.querySelector('.mm-source-status').textContent.includes('Loading Gmail messages'));
  assert.equal(document.querySelectorAll('.mm-email-row').length, 0);
  await act(async () => { holdSync = false; syncRelease(); });
  assert.ok(document.querySelector('.mm-inbox-list').textContent.includes('Real mailbox report 1'));
  assert.ok(!document.querySelector('.mm-inbox-list').textContent.includes('Project Report Submission'));
  assert.ok(document.querySelector('.mm-analysis-status').textContent.includes('unanalyzed'));
  assert.ok(textButton('Analyze email').disabled);
  emptyInbox = true;
  await click(labelControl('Refresh Gmail'));
  assert.equal(document.querySelectorAll('.mm-email-row').length, 0);
  assert.ok(document.querySelector('.mm-inbox-list').textContent.includes('Your Gmail inbox has no messages'));
  emptyInbox = false;
  await click(labelControl('Refresh Gmail'));

  await navigate('/app/settings');
  await click(document.querySelector('.mm-analysis-consent input'));
  assert.equal(consent, true);
  await navigate('/app/inbox');
  holdAnalysis = true;
  await click(textButton('Analyze email'));
  assert.ok(textButton('Analyzing…').disabled);
  assert.equal(document.querySelector('.mm-analysis-status').textContent, 'analyzing');
  await act(async () => { holdAnalysis = false; analysisRelease(); });
  assert.ok(document.querySelector('.mm-inbox-analysis').textContent.includes(analysis.summary));
  assert.ok(document.querySelector('.mm-inbox-analysis').textContent.includes(analysis.priority.reason));
  await click(textButton('Action Items', document.querySelector('.mm-inbox-analysis')));
  assert.ok(document.querySelector('.mm-analysis-task').textContent.includes(action.evidence));
  await click(document.querySelector('.mm-analysis-task input'));
  assert.equal(savedTasks[0].status, 'completed');
  await navigate('/app/action-items');
  assert.ok(document.querySelector('.mm-task-card.completed'));
  await navigate('/app/reminders');
  await click(textButton('Dismiss', document.querySelector('.mm-reminder-card')));
  assert.equal(savedTasks[0].reminderDismissed, true);
  assert.equal(document.querySelector('.mm-reminder-card'), null);

  await navigate('/app/tasks');
  await click(textButton('Create Task'));
  let dialog = document.querySelector('[role="dialog"]');
  await value(dialog.querySelector('input:not([type="date"])'), 'Saved app task');
  await click(textButton('Save task', dialog));
  assert.ok(savedTasks.some((task) => task.title === 'Saved app task'));
  const taskCard = [...document.querySelectorAll('.mm-task-card')].find((item) => item.textContent.includes('Saved app task'));
  await click(textButton('Delete Task', taskCard));
  await click(textButton('Delete', document.querySelector('[role="dialog"]')));
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.ok(savedTasks.find((task) => task.title === 'Saved app task').deleted);

  await navigate('/app/inbox');
  await click(textButton('Load more Gmail messages'));
  assert.equal(document.querySelectorAll('.mm-inbox-list .mm-email-row').length, 2);
  await click(labelControl('Open Real mailbox report 2 from Professor Example'));
  analysisError = true;
  await click(textButton('Analyze email'));
  assert.ok(document.querySelector('.mm-inbox-analysis [role="alert"]').textContent.includes('invalid analysis'));
  assert.ok(!document.querySelector('.mm-inbox-analysis').textContent.includes(analysis.summary));
  analysisError = false;
  await click(textButton('Retry analysis'));
  assert.equal(document.querySelector('.mm-analysis-status.completed') !== null, true);
  await click(textButton('Security', document.querySelector('.mm-inbox-analysis')));
  assert.ok(document.querySelector('.mm-inbox-analysis').textContent.includes('No automated security assessment'));
  assert.ok(!document.querySelector('.mm-inbox-analysis').textContent.includes('low risk'));
  await click(document.querySelector('.mm-analysis-context a'));
  assert.ok(document.querySelector('.mm-detail-page').textContent.includes('Real mailbox report 2'), 'Numeric Gmail IDs must not resolve as demo IDs');
  await navigate('/app/inbox');
  mailError = true;
  await click(labelControl('Refresh Gmail'));
  assert.ok(document.querySelector('.mm-source-status [role="alert"]').textContent.includes('Gmail could not be reached'));
  mailError = false;
  await click(labelControl('Refresh Gmail'));
  assert.equal(document.querySelector('.mm-source-status [role="alert"]'), null);

  await value(labelControl('Workspace data source'), 'demo');
  assert.ok(document.querySelector('.mm-inbox-list').textContent.includes('Project Report Submission'));
  assert.ok(!document.querySelector('.mm-inbox-list').textContent.includes('Real mailbox report'));
  await value(labelControl('Workspace data source'), 'gmail');
  await navigate('/app/tasks');
  assert.ok(document.querySelector('.mm-task-card.completed'));
  await navigate('/app/inbox');
  holdSync = true;
  await click(labelControl('Refresh Gmail'));
  await value(labelControl('Workspace data source'), 'demo');
  await act(async () => { holdSync = false; syncRelease(); });
  assert.ok(!document.querySelector('.mm-inbox-list').textContent.includes('Real mailbox report'));
  await value(labelControl('Workspace data source'), 'gmail');
  connected = false;
  await click(labelControl('Refresh Gmail'));
  assert.equal(document.querySelectorAll('.mm-email-row').length, 0);
  assert.ok(document.querySelector('.mm-source-status').textContent.includes('Gmail disconnected'));
  await click(textButton('Use demo data'));
  assert.ok(document.querySelector('.mm-inbox-list').textContent.includes('Project Report Submission'));

  connected = true;
  await mount('/app/settings');
  await click(textButton('Disconnect Gmail'));
  await click(textButton('Disconnect', document.querySelector('[role="dialog"]')));
  assert.equal(connected, false);
  assert.equal(labelControl('Workspace data source').value, 'demo');
  assert.ok(calls.filter((call) => ['POST', 'PATCH'].includes(call.method)).every((call) => call.headers['X-CSRF-Token'] === 'test-csrf'));
  assert.ok(calls.every((call) => call.credentials === 'include'));
  assert.deepEqual(consoleErrors, []);
  console.log('Gmail UI checks passed: explicit source isolation, loading, empty/disconnected, sync failure/retry, pagination, analysis consent/progress/failure/retry, evidence, numeric IDs, persistent task/reminder requests, and disconnect. Providers were mocked; no visual browser QA.');
} finally {
  globalThis.fetch = originalFetch;
  if (root) await act(async () => root.unmount());
  console.error = originalError;
  await vite.close();
  dom.window.close();
}
