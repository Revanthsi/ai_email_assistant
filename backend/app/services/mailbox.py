import asyncio
import hashlib
import time

from app.core.errors import ServiceError
from app.services.mime import normalize_message


class MailboxService:
    def __init__(self, store, google, provider):
        self.store, self.google, self.provider = store, google, provider
        self._locks = {}

    async def sync(self, owner, limit, page_token):
        # Sync and analysis share an account lock so a stale refresh cannot erase a result.
        async with self._locks.setdefault(owner, asyncio.Lock()):
            try:
                return await asyncio.wait_for(self._sync(owner, limit, page_token), timeout=90)
            except asyncio.TimeoutError:
                raise ServiceError("gmail_timeout", "Gmail synchronization timed out. Refresh to retry.", 504) from None

    async def _sync(self, owner, limit, page_token):
        page = await self.google.list_messages(owner, limit, page_token)
        messages = page.get("messages", [])
        if not isinstance(messages, list):
            raise ServiceError("invalid_gmail_response", "Gmail returned an invalid message list. Try again.")
        concurrency = asyncio.Semaphore(5)
        async def load(item):
            async with concurrency:
                try:
                    message_id = item["id"]
                    old = self.store.get(owner, "email", message_id)
                    data = await self.google.message(owner, message_id, metadata=bool(old))
                    if old and data.get("historyId") and str(data["historyId"]) == old["historyId"]:
                        return old, None
                    if old:
                        data = await self.google.message(owner, message_id)
                    email = normalize_message(data)
                    if old and email["fingerprint"] == old["fingerprint"]:
                        for key in ("analysis", "analysisStatus", "analysisError"):
                            email[key] = old[key]
                    self.store.put(owner, "email", email["id"], email)
                    return email, None
                except ServiceError as exc:
                    if exc.status in (401, 403, 429):
                        raise
                    return None, "A message could not be loaded; refresh to retry."
                except (ValueError, KeyError, TypeError, AttributeError):
                    return None, "A malformed message was skipped."
        loaded = await asyncio.gather(*(load(item) for item in messages[:limit]), return_exceptions=True)
        # All requests settle before releasing the lock; no orphan writes after an error.
        for result in loaded:
            if isinstance(result, Exception):
                raise result
        return {"emails": [email for email, _ in loaded if email], "next_page_token": page.get("nextPageToken"), "result_size_estimate": page.get("resultSizeEstimate", 0), "warnings": list(dict.fromkeys(warning for _, warning in loaded if warning)), "synced_at": time.time()}

    def email(self, owner, message_id):
        email = self.store.get(owner, "email", message_id)
        if not email:
            raise ServiceError("message_not_found", "Refresh Gmail to load this message into your account workspace.", 404)
        return email

    async def analyze(self, owner, message_id):
        # Serial per-account analysis prevents duplicate billing and overlapping task writes.
        async with self._locks.setdefault(owner, asyncio.Lock()):
            email = self.email(owner, message_id)
            if email["analysisStatus"] == "completed":
                return email
            try:
                preferences = self.store.get(owner, "settings", "preferences") or {}
                if not preferences.get("analysisConsent"):
                    raise ServiceError("analysis_consent_required", "Analysis consent was withdrawn. Enable it in Settings to continue.", 403)
                analysis = await self.provider.analyze(email)
                data = analysis.model_dump(mode="json")
                for action in data["action_items"]:
                    stable = hashlib.sha256((message_id + action["title"] + action["evidence"]).encode()).hexdigest()[:24]
                    action["id"] = "action-" + stable
                email.update(analysis=data, analysisStatus="completed", analysisError=None)
                self.store.save_analysis(owner, email, data["action_items"], data["priority"]["level"])
                return email
            except ServiceError as exc:
                email.update(analysisStatus="failed", analysisError={"code": exc.code, "message": exc.message})
                self.store.put(owner, "email", message_id, email)
                raise
