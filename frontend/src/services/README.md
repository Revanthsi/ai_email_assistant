# Backend API client

`api.js` is the browser's only integration boundary. It calls FastAPI with HttpOnly session cookies, carries the server-provided CSRF token for POST/PATCH, handles recoverable API errors and adapts Gmail/analysis records for existing workspace components. It never calls Google or Gemini directly and never stores provider credentials.

Set only `VITE_API_BASE_URL` in frontend `.env`. The backend endpoint/schema/setup contract is documented in `backend/README.md`. Demo records stay separate from Gmail state in `AppState.jsx`.
