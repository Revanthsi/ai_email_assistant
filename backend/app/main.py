"""MailMate Phase 1 API. No sending or Gmail modification endpoints exist."""
import asyncio
import hmac
import logging
import secrets
import time
from collections import defaultdict, deque
from urllib.parse import urlencode
from cryptography.fernet import InvalidToken

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import Settings, load_settings
from app.core.errors import ServiceError
from app.core.store import Store, digest
from app.schemas.email import BatchRequest, Preferences, TaskInput, TaskPatch
from app.services.ai import GeminiProvider
from app.services.google import GoogleService
from app.services.mailbox import MailboxService


class RedactQueries(logging.Filter):
    def filter(self, record):
        # Uvicorn logs request path as its third formatting argument. Never log OAuth codes.
        if isinstance(record.args, tuple) and len(record.args) == 5:
            args = list(record.args)
            args[2] = str(args[2]).split("?", 1)[0]
            record.args = tuple(args)
        return True


logging.getLogger("uvicorn.access").addFilter(RedactQueries())


def create_app(settings: Settings | None = None, google_transport=None, ai_transport=None, provider=None):
    settings = settings or load_settings()
    settings.validate()
    store = Store(settings.database_path, settings.encryption_key)
    google = GoogleService(settings, store, google_transport)
    mailbox = MailboxService(store, google, provider or GeminiProvider(settings, ai_transport))
    api = FastAPI(title="MailMate AI", version="1.0.0")
    api.state.store, api.state.google, api.state.mailbox = store, google, mailbox
    api.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=True, allow_methods=["GET", "POST", "PATCH"], allow_headers=["Content-Type", "X-CSRF-Token"])
    api.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)
    cookie = "__Host-mm_session" if settings.production else "mm_session"
    requests = defaultdict(deque)
    semaphore = asyncio.Semaphore(2)

    def limit(key, bucket, maximum):
        now = time.monotonic()
        queue = requests[(key, bucket)]
        while queue and queue[0] < now - 60:
            queue.popleft()
        if len(queue) >= maximum:
            raise ServiceError("rate_limit", "Too many requests. Wait a minute before retrying.", 429)
        queue.append(now)

    def set_cookie(response, raw):
        response.set_cookie(cookie, raw, max_age=settings.session_seconds, httponly=True, secure=settings.production, samesite="lax", path="/")

    def session(request, connected=True):
        current = store.session(request.cookies.get(cookie))
        account = store.account(current["account_id"]) if current and current["account_id"] else None
        if not current or (connected and (not account or not account.get("credentials"))):
            raise ServiceError("not_connected", "Connect Gmail to use your account workspace.", 401)
        if request.method not in ("GET", "HEAD", "OPTIONS"):
            origin = request.headers.get("origin")
            if origin not in settings.allowed_origins or not hmac.compare_digest(request.headers.get("x-csrf-token", "").encode(), current["csrf"].encode()):
                raise ServiceError("csrf_failed", "The session check failed. Refresh the page and try again.", 403)
        limit(current["id"], "api", 120)
        return current

    @api.exception_handler(ServiceError)
    async def service_error(request, exc):
        return JSONResponse(status_code=exc.status, content={"error": {"code": exc.code, "message": exc.message}})

    @api.exception_handler(InvalidToken)
    async def invalid_encryption_key(request, exc):
        return JSONResponse(status_code=503, content={"error": {"code": "storage_key", "message": "Stored data could not be decrypted. Restore the original backend ENCRYPTION_KEY."}})

    @api.middleware("http")
    async def safe_responses(request, call_next):
        try:
            if int(request.headers.get("content-length", "0")) > 8192:
                return JSONResponse(status_code=413, content={"error": {"code": "request_size", "message": "Request is too large."}})
        except ValueError:
            return JSONResponse(status_code=400, content={"error": {"code": "invalid_request", "message": "Invalid request size."}})
        if request.method in ("POST", "PATCH"):
            chunks, size = [], 0
            async for chunk in request.stream():
                size += len(chunk)
                if size > 8192:
                    return JSONResponse(status_code=413, content={"error": {"code": "request_size", "message": "Request is too large."}})
                chunks.append(chunk)
            request._body = b"".join(chunks)
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @api.get("/api/health")
    async def health():
        return {"status": "ok", "service": "mailmate", "gmail_configured": settings.oauth_configured, "ai_configured": bool(settings.gemini_api_key)}

    @api.get("/api/auth/google/status")
    async def status(request: Request):
        limit(request.client.host, "status", 60)
        current = store.session(request.cookies.get(cookie))
        raw = None
        if not current:
            raw, current = store.new_session(settings.session_seconds)
        account = store.account(current["account_id"]) if current["account_id"] else None
        connected = bool(account and account.get("credentials"))
        preferences = store.get(current["account_id"], "settings", "preferences") if connected else None
        response = JSONResponse({"connected": connected, "account_email": account["email"] if account else None, "reconnect_required": bool(account and not connected), "configured": settings.oauth_configured, "ai_configured": bool(settings.gemini_api_key), "csrf_token": current["csrf"], "preferences": preferences or {"analysisConsent": False}})
        if raw:
            set_cookie(response, raw)
        return response

    @api.get("/api/auth/google/start")
    async def start(request: Request):
        limit(request.client.host, "oauth", 10)
        if not settings.oauth_configured:
            raise ServiceError("oauth_not_configured", "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and ENCRYPTION_KEY on the backend.", 503)
        current = store.session(request.cookies.get(cookie))
        raw = None
        if not current:
            raw, current = store.new_session(settings.session_seconds)
        state, verifier = secrets.token_urlsafe(32), secrets.token_urlsafe(48)
        store.set_oauth(current["id"], {"state": digest(state), "verifier": verifier, "expires": time.time() + 600})
        response = RedirectResponse(google.authorization_url(state, verifier), status_code=302)
        if raw:
            set_cookie(response, raw)
        return response

    @api.get("/api/auth/google/callback")
    async def callback(request: Request, state: str = Query(default="", max_length=200), code: str = Query(default="", max_length=4096), error: str = Query(default="", max_length=200)):
        current = session(request, connected=False)
        pending = store.consume_oauth(current["id"])
        if not pending or pending["expires"] < time.time() or not hmac.compare_digest(pending["state"], digest(state)):
            raise ServiceError("invalid_oauth_state", "Google authorization state is invalid or expired. Connect again.", 400)
        def frontend(outcome):
            return RedirectResponse(settings.frontend_origin + "/app/settings?" + urlencode({"gmail": outcome}), status_code=303)
        if error:
            return frontend("cancelled" if error == "access_denied" else "authorization_error")
        if not code:
            return frontend("authorization_error")
        try:
            credentials = await google.exchange(code, pending["verifier"])
            profile = await google.profile(credentials["access_token"])
            email = profile.get("emailAddress")
            if not isinstance(email, str) or "@" not in email or len(email) > 320:
                raise ServiceError("invalid_profile", "Google did not return a Gmail account.", 400)
            owner = store.connect_account(email, credentials)
        except ServiceError:
            return frontend("authorization_error")
        # Rotate on authentication to prevent fixation. Identity comes only from Google.
        store.remove_session(request.cookies.get(cookie))
        raw, _ = store.new_session(settings.session_seconds, owner)
        response = frontend("connected")
        set_cookie(response, raw)
        return response

    @api.post("/api/auth/google/disconnect")
    async def disconnect(request: Request):
        current = session(request, connected=False)
        account = store.account(current["account_id"]) if current["account_id"] else None
        credentials = account.get("credentials") if account else None
        revoked = await google.revoke((credentials or {}).get("refresh_token") or (credentials or {}).get("access_token"))
        if current["account_id"]:
            store.disconnect(current["account_id"])
        else:
            store.remove_session(request.cookies.get(cookie))
        response = JSONResponse({"disconnected": True, "revoked": revoked, "message": "Local account data deleted." if revoked else "Local account data deleted. If Google revocation failed, remove access in your Google Account permissions."})
        response.delete_cookie(cookie, path="/", secure=settings.production, httponly=True, samesite="lax")
        return response

    @api.get("/api/emails")
    async def emails(request: Request, limit_count: int = Query(20, alias="limit", ge=1, le=50), page_token: str | None = Query(None, max_length=2048)):
        current = session(request)
        limit(current["account_id"], "sync", 10)
        return await mailbox.sync(current["account_id"], limit_count, page_token)

    @api.get("/api/emails/{message_id}")
    async def email_detail(message_id: str, request: Request):
        current = session(request)
        return mailbox.email(current["account_id"], message_id)

    async def run_analysis(current, message_id):
        owner = current["account_id"]
        preferences = store.get(owner, "settings", "preferences") or {}
        if not preferences.get("analysisConsent"):
            raise ServiceError("analysis_consent_required", "Enable email analysis in Settings before sharing content with Gemini.", 403)
        cached = mailbox.email(owner, message_id)
        if cached["analysisStatus"] != "completed":
            limit(owner, "analysis", 10)
        async with semaphore:
            return await mailbox.analyze(owner, message_id)

    @api.post("/api/emails/analyze-batch")
    async def batch(body: BatchRequest, request: Request):
        current = session(request)
        # Verify every ID before any paid provider request.
        for message_id in body.message_ids:
            mailbox.email(current["account_id"], message_id)
        results = []
        for message_id in dict.fromkeys(body.message_ids):
            try:
                results.append({"message_id": message_id, "email": await run_analysis(current, message_id)})
            except ServiceError as exc:
                results.append({"message_id": message_id, "error": {"code": exc.code, "message": exc.message}})
        return {"results": results}

    @api.post("/api/emails/{message_id}/analyze")
    async def analyze(message_id: str, request: Request):
        return await run_analysis(session(request), message_id)

    @api.get("/api/action-items")
    async def action_items(request: Request):
        current = session(request)
        return {"items": [item for item in store.all(current["account_id"], "task") if not item.get("deleted") and not item.get("retired")]}

    @api.post("/api/action-items")
    async def create_task(body: TaskInput, request: Request):
        current = session(request)
        task = {**body.model_dump(mode="json"), "id": "task-" + secrets.token_hex(16), "origin": "local", "emailId": None, "status": "pending", "deleted": False, "reminderDismissed": False}
        store.put(current["account_id"], "task", task["id"], task)
        return task

    @api.patch("/api/action-items/{item_id}")
    async def patch_task(item_id: str, body: TaskPatch, request: Request):
        current = session(request)
        task = store.get(current["account_id"], "task", item_id)
        if not task:
            raise ServiceError("task_not_found", "Task was not found in this account.", 404)
        patch = body.model_dump(mode="json", exclude_unset=True)
        if any(value is None for key, value in patch.items() if key != "dueDate"):
            raise ServiceError("invalid_task", "Only a due date can be cleared.", 422)
        task.update(patch)
        store.put(current["account_id"], "task", item_id, task)
        return task

    @api.patch("/api/settings")
    async def save_settings(body: Preferences, request: Request):
        current = session(request)
        preferences = body.model_dump()
        store.put(current["account_id"], "settings", "preferences", preferences)
        return preferences

    return api


app = create_app()
