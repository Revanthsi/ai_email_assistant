# MailMate Phase 1 backend

FastAPI provides Google OAuth, read-only Gmail synchronization, Gemini analysis and encrypted app task persistence. All upstream requests are server-side. This implementation has been tested with mocked providers; live Google/Gemini access is unverified until credentials are configured and the acceptance flow below is completed.

## Local setup: Windows PowerShell

Run from the repository root using Python 3.11+:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe scripts/setup_key.py
```

Edit the ignored `backend/.env` locally to set the Google client ID/secret and Gemini API key. Do not put keys in JavaScript, `VITE_*` variables, committed files, screenshots or logs. `setup_key.py` writes the key without displaying it. Preserve this key across restarts; changing it makes existing encrypted data unreadable. Protect `.env`, the DB directory and backups with OS permissions. Do not rerun the copy command over an existing `.env`.

Start the API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host localhost --port 8000 --no-access-log
```

In a second terminal, from the repository root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Use `http://localhost:3000` consistently, with the API at `http://localhost:8000`. Mixing `localhost` and `127.0.0.1` breaks cookie/origin assumptions. Only the API URL goes in frontend configuration. No Vite proxy is required.

Health: `http://localhost:8000/api/health`; interactive contract: `http://localhost:8000/docs`. The server starts without provider secrets for health and demo development, but OAuth is disabled until both Google values and a persistent encryption key are set. Gemini analysis requires the server API key and account consent. An ephemeral key in unconfigured mode must never be used for connected-account persistence.

## Local setup: standard terminals

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
cp .env.example .env
.venv/bin/python scripts/setup_key.py
# Configure backend/.env locally, then:
.venv/bin/python -m uvicorn app.main:app --host localhost --port 8000 --no-access-log
```

Second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Google Cloud setup still required

1. Create/select your own Google Cloud project and enable **Gmail API**.
2. Configure Google Auth Platform branding, support/developer contacts, audience and data access. For external development choose Testing and add your Gmail address as a test user. Internal audience is available only for eligible Workspace organizations.
3. Add **only** `https://www.googleapis.com/auth/gmail.readonly` to the data access scopes. The app does not request OpenID, send, modify, delete or full-mailbox scopes.
4. Create an OAuth client of type **Web application**. Register this exact authorized redirect URI: `http://localhost:8000/api/auth/google/callback`. If an authorized JavaScript origin is requested, use `http://localhost:3000`; the code exchange itself runs entirely on the backend.
5. Put that client's ID and secret in backend `.env`. The `GOOGLE_REDIRECT_URI` must match the registration exactly, including scheme, host, port and path. Restart the API after configuration changes.
6. Obtain a Gemini API key for an appropriate Google project, set `GEMINI_API_KEY` and a model available to that project using `GEMINI_MODEL`. The default is `gemini-2.5-flash`; change it if unavailable. Model availability and provider response compatibility need live verification.

Testing users can encounter Google's unverified-app screen. External apps in Testing generally receive refresh tokens that expire after seven days with this scope; reconnect when required. See Google's [OAuth token expiration documentation](https://developers.google.com/identity/protocols/oauth2#expiration) and [web-server OAuth guide](https://developers.google.com/identity/protocols/oauth2/web-server).

Gmail read-only is a restricted scope. Public distribution needs the applicable OAuth verification; storing or transmitting restricted-scope data can require a security assessment. Plan consent branding, a privacy policy, deletion/retention disclosures and verification before public launch. See [Gmail scope requirements](https://developers.google.com/workspace/gmail/api/auth/scopes).

Real email data must use provider terms and processing settings compatible with Google Workspace's Limited Use restrictions. Gemini unpaid-service data handling differs from paid-service terms; do not use an unpaid configuration that permits training/product improvement with Gmail content. This app cannot inspect the billing/processing policy associated with an API key. Confirm the project configuration before enabling real-mail analysis. See [Workspace user data policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy) and [Gemini terms](https://ai.google.dev/gemini-api/terms).

## Environment contract

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Backend OAuth web client credentials |
| `GOOGLE_REDIRECT_URI` | Fixed callback; no client-provided return URL |
| `ENCRYPTION_KEY` | Stable Fernet key for tokens, cached messages, analysis, task payloads and OAuth verifier storage |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Backend-only provider credential and model selection |
| `FRONTEND_ORIGIN` | Fixed trusted OAuth return origin |
| `ALLOWED_FRONTEND_ORIGINS` | Comma-separated exact origins for credentialed CORS and CSRF |
| `ALLOWED_HOSTS` | Trusted API hostnames; explicit production hostnames required |
| `ENVIRONMENT` | `development` or `production`; production enforces HTTPS and secure cookies |
| `DATABASE_PATH` | SQLite path; relative to backend with the documented commands |
| Frontend `VITE_API_BASE_URL` | Public API base URL ending in `/api`; never a secret |

Opaque random session cookies are HttpOnly, SameSite=Lax and Secure in production, with a seven-day absolute lifetime. Only a hash of the cookie is stored. Production uses a `__Host-` cookie. OAuth state is session-bound, expires in ten minutes, is consumed once, and uses S256 PKCE. Successful OAuth rotates the session. Status supplies a CSRF token; every POST/PATCH also requires the exact allowed Origin and `X-CSRF-Token`. Gmail profile identity determines the account; client-supplied identity is never accepted. Uncached or other-account message IDs return 404.

## API

All endpoints except health, status and OAuth entry/callback require a connected-account session. Disconnect also works with an expired credential but valid app session. Mutation endpoints require CSRF. Do not put credentials in request URLs.

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/api/health` | Service/configuration flags, no secrets |
| GET | `/api/auth/google/start` | Fixed read-only consent redirect |
| GET | `/api/auth/google/callback` | State/PKCE validation, code exchange, session rotation |
| GET | `/api/auth/google/status` | Connection email, config flags, CSRF token and analysis consent |
| POST | `/api/auth/google/disconnect` | Attempts revocation, deletes account/session/cached data; reports revocation failure |
| GET | `/api/emails?limit=20&page_token=...` | Synchronizes latest INBOX page; 1–50 messages per request |
| GET | `/api/emails/{message_id}` | Reads an owner-scoped cached message |
| POST | `/api/emails/{message_id}/analyze` | Explicit consent required; validated, cached analysis or recoverable error |
| POST | `/api/emails/analyze-batch` | Up to five IDs; validates ownership of all IDs before any provider call |
| GET | `/api/action-items` | Saved extracted and locally created app tasks |
| POST | `/api/action-items` | Create local app task |
| PATCH | `/api/action-items/{item_id}` | Edit/complete/reopen/delete app task or dismiss/restore reminder |
| PATCH | `/api/settings` | Save `analysisConsent` |

Errors use `{"error":{"code":"...","message":"..."}}`; validation errors use FastAPI's 422 detail contract. Rate-limit responses are 429; refresh-token rejection is 401 and requires reconnection. API responses are no-store. Application logging never records bodies/tokens; access-query redaction is a defense in depth. Keep proxy access logs free of callback query strings too.

## Message and analysis contract

Normalized messages contain `id`, `source=gmail`, sender/address, recipient, subject, ISO timestamp, snippet as `preview`, bounded plain-text `body`, attachment **names**, read/star labels, Gmail `historyId`, content fingerprint, `analysisStatus`, `analysisError` and nullable `analysis`. Message IDs are retained exactly. The frontend's API adapter maps these fields onto existing components without copying demo analysis into Gmail records.

`analysisStatus` is `unanalyzed`, `completed` or `failed` in persistent storage. `analyzing` is a frontend request state, so a process crash cannot leave a permanent pending marker. Invalid or unavailable provider output is stored as failed and can be retried. A completed result is reused; refreshing never initiates AI analysis.

`analysis` contains `summary`, extensible snake-case `intent.category` with `reason`, `priority.level` (urgent/high/normal/low) with `reason`, `recommended_action`, and up to twelve `action_items`. Each action contains a stable server-generated ID, title, description, nullable ISO deadline, confidence (explicit/uncertain/unknown), completion requirement, verbatim evidence and reason. Pydantic forbids extra fields and validates all output. Evidence must appear in the actual submitted body; a non-null date must be supported by a complete explicit date in that evidence. Relative, incomplete and ambiguous dates remain null. The conservative check accepts ISO, named-month and unambiguous numeric complete dates; unsupported formats fail for review rather than inventing a date. App task edits may set a due date independently of original extracted evidence.

The provider receives only subject (up to 500 characters), sender display name (300), received timestamp and the first 16,000 plain-text body characters. Recipients, attachments, OAuth tokens and secrets are excluded. Quoted history inside the body is currently included within that limit. The structured-output [Gemini API contract](https://ai.google.dev/api/generate-content) is validated again on return. Email content is untrusted JSON data under a fixed system prompt; no tools, link opening, code execution, sending or external actions are available. This limits consequences of injection but cannot prove semantic correctness of model output. Users must review recommendations and evidence.

Synchronization checks metadata/history IDs for cached messages and only downloads the full body when needed. Unchanged content retains analysis, even if Gmail labels changed. No history-delta synchronization, push subscription or background polling is implemented. Plain text is preferred over HTML; HTML is reduced to text and never inserted into trusted HTML. Script/style content is discarded, external images are not rendered, and no attachment endpoint is called. Bodies are capped at 60,000 characters; text parts stored as Gmail attachments are not fetched. Empty/unreadable bodies cannot be analyzed. Per-message failures are shown as warnings; authentication/quota failures stop the refresh.

## Acceptance flow after credentials are configured

1. Open `/app/settings`, click Connect Gmail, consent as an allowed test user. Verify return status and connected email.
2. Open Inbox in Gmail account mode. Confirm actual message IDs, sender, subject, body and attachment names; Refresh Gmail and Load more should work. No demo records should appear.
3. Enable **Allow analysis with Gemini** after reviewing the provider data terms, select one readable email and click **Analyze email**.
4. Confirm Summary, intent/priority reasons, extracted tasks/evidence and confidence. Complete a task, reload, explicitly select Gmail mode again and confirm saved completion.
5. Switch to Demo data and confirm the original interactions remain available. Disconnect and confirm local data deletion and Google revocation status.

This is the remaining live acceptance test, not a claim that live integration has already been tested. Missing configuration: Google Cloud project/API/consent/test user/web client values, Gemini API key/project/model, and a locally generated persistent encryption key.

## Tests

From backend:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Standard terminal: `.venv/bin/python -m pytest -q`.

Tests mock all Google/Gemini HTTP requests, including OAuth, refresh/revocation, ownership, CSRF, pagination/cache, MIME/HTML/charset, absent/ambiguous deadlines, malformed output, rate limits/outages, injection-boundary requests, task persistence and deletion. Frontend test commands are in [frontend README](../frontend/README.md). No tests require accounts or paid credits.

The installed Authlib/Starlette versions emit two deprecation warnings about legacy httpx compatibility during tests. Tests still pass; dependency migration to httpx2 has not been performed in this phase.

## Deployment limitations

This is a local Phase 1 implementation, not a production certification. Deploy UI and API on the same HTTPS site (or subdomains of the same site); arbitrary cross-site deployments are not supported by the Lax session cookie. Set exact origins/hosts/callback URLs and `ENVIRONMENT=production`. Configure TLS, SPA fallback routing, hardened proxy limits/timeouts and log redaction, a secret manager, restricted DB/backup access, key rotation/re-encryption, retention/purge jobs and an incident response/deletion process. SQLite encryption covers sensitive payloads, not record identifiers or indexes. Disconnect logically deletes data; secure erasure from backups/filesystem is an operational responsibility.

Use a single API worker for this phase: request limits, refresh locks and analysis locks are in memory. Production needs shared rate limiting and coordination/job handling to prevent duplicate upstream work across workers, plus per-user AI budgets. Current limits: 120 API calls/session/minute, 10 syncs/account/minute, 10 uncached analyses/account/minute, five analyses/batch, two concurrent provider requests, five parallel Gmail fetches, 8 KiB mutation bodies, 30-second Google request timeouts, 90-second synchronization timeout and 60-second AI timeout. Add monitored global/IP protections before exposure; the local limiter is not a complete abuse defense.

The frontend loads 20 messages per page, up to 200 in the current view. Dashboard numbers cover loaded records and saved app tasks, not a full mailbox scan. Session expiry requires reconnect; persisted account tasks survive same-account reconnection until Disconnect deletes them. UI preferences/profile/drafts and local email read/star/archive/hide changes are session-only and reset on reload/refresh. Reminders do not schedule notifications. Replies/compose examples and scheduling remain demonstrations; security has no live detector or safety verdict. Automated DOM checks do not verify browser consent screens, visual responsiveness or CSS overflow.
