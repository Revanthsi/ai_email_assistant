# MailMate frontend

The existing React 18/Vite/React Router workspace uses Tailwind, scoped light workspace CSS, Framer Motion and Lucide. Marketing routes and components remain intact. Get Started opens `/app` in Demo data mode.

## Run

From frontend:

```bash
npm install
npm run dev
```

Vite uses `http://localhost:3000`. Copy `.env.example` to ignored `.env` if the default API base needs changing. `VITE_API_BASE_URL` defaults to `http://localhost:8000/api`; it contains no credentials. For both services and Google Cloud configuration, follow the [backend guide](../backend/README.md).

## Data sources and behavior

The header and Settings expose an explicit Demo data/Gmail account selector. A connected-account status alone does not replace demo records. The successful OAuth return intentionally opens Gmail mode. Reload defaults to Demo data; choose Gmail again to load saved account data.

- Demo data remains the canonical 12-record `src/data/mockEmails.js` dataset, with its fixed 9 October 2026 timeline and session-only reducer interactions.
- Gmail data is normalized through `src/services/api.js` and held in a separate reducer. `AppState.jsx` owns status, refresh, pagination, explicit analysis, persistent app task actions and source isolation. There is no localStorage token or mailbox storage.
- Connection controls are in `ConnectionPanel.jsx` and Settings. Loading, disconnected, empty, partial-message warnings and errors are displayed. Refresh Gmail loads the newest page; Load more loads further pages, up to 200 messages in the current view. Dashboard/Insights count loaded messages and saved tasks only.
- Email details retain Summary, Action Items, Reply and Security. Gmail Summary/intent/priority/actions use backend-validated analysis; consent and a configured AI key are required. Unanalyzed/analyzing/completed/failed states are visible; failed requests can be retried. Source task links can retrieve older owner-scoped cached messages.
- Extracted/local Gmail-mode app tasks, completion, edits, deletion and reminder dismissal are persisted on the backend. These actions never modify Gmail. Confirmed/extracted and app-edited due dates are grouped around the current date in Asia/Kolkata. Demo date grouping remains fixed.
- Read/star/archive/hide controls change the current app view only; refreshing restores provider labels. Profile display preferences, notification-menu toggles and compose drafts remain session-only. Changing display identity does not change the connected Google account.
- Reply drafts and compose assistance remain clearly labeled predefined examples, with editing/copying/local saving. Sending is unavailable. Scheduled examples are available only in Demo data mode. Security examples remain in demo; Gmail security is explicitly not assessed and never labeled safe/malicious.

No Google/Gemini secret is exposed to the browser. The frontend sends credentialed backend requests and a CSRF header for mutations; all provider calls are on FastAPI. Late account/source responses are guarded from updating the wrong view. UI components and existing routes remain modular.

## Verification

```bash
npm run build
npm run smoke
npm run smoke:app
npm run smoke:state
```

The optional rendered tests use jsdom in a temporary QA dependency directory to avoid adding frontend runtime packages. Install once:

PowerShell:

```powershell
$qaPath = Join-Path $env:TEMP 'mailmate-workspace-qa'
npm install --prefix $qaPath --no-save --package-lock=false --ignore-scripts jsdom@25.0.1
$env:MAILMATE_QA_ROOT = $qaPath
node scripts/interaction-check.mjs
node scripts/integration-check.mjs
```

Standard terminal:

```bash
export MAILMATE_QA_ROOT="${TMPDIR:-/tmp}/mailmate-workspace-qa"
npm install --prefix "$MAILMATE_QA_ROOT" --no-save --package-lock=false --ignore-scripts jsdom@25.0.1
node scripts/interaction-check.mjs
node scripts/integration-check.mjs
```

The first rendered suite exercises the original demo; the second mocks the API and checks explicit source switching, loading/disconnected/errors, pagination, analysis consent/progress/failure/retry, evidence, stable Gmail IDs, persistent task/reminder request behavior and disconnect. They do not contact real providers or measure visual layout/overflow. Live OAuth and real-email analysis require the acceptance flow in the backend guide.
