# MailMate AI

The existing React/Vite marketing site and email workspace now have a FastAPI Phase 1 backend for read-only Gmail OAuth/synchronization, explicit Gemini analysis and encrypted app task persistence. Demo mode remains available without credentials; Gmail records and demo records use separate state.

Start with the [backend setup guide](backend/README.md) for Google Cloud, environment variables, Windows/standard-terminal commands, API contract, privacy/deployment limits and the remaining live acceptance test. See the [frontend guide](frontend/README.md) for workspace behavior and test commands, and [implementation audit](IMPLEMENTATION.md) for the baseline and integration points.

Quick start after installing dependencies and configuring ignored `.env` files, in separate PowerShell terminals from the repository root:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host localhost --port 8000 --no-access-log
```

```powershell
cd frontend
npm run dev
```

Visit `http://localhost:3000/app/settings` to connect Gmail. Only the `gmail.readonly` scope is requested. Enable analysis consent and click Analyze email for a selected message. No Gmail sending, modification, deletion or automatic external action is implemented.

Mocked-provider tests verify the integration contract; valid Google/Gemini credentials have not been provided, so live OAuth, synchronization and AI analysis remain unverified. Marketing routes, styling, animations and the original demo interactions are preserved.
