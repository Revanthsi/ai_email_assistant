"""Google OAuth via Authlib and a fixed, read-only Gmail API client."""
import asyncio
import re
import time

import httpx
from authlib.integrations.httpx_client import AsyncOAuth2Client
from authlib.integrations.base_client.errors import OAuthError

from app.core.config import SCOPE
from app.core.errors import ServiceError

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL_URL = "https://gmail.googleapis.com/gmail/v1/users/me"
MESSAGE_ID = re.compile(r"^[A-Za-z0-9_-]{1,128}$")


class GoogleService:
    def __init__(self, settings, store, transport=None):
        self.settings, self.store, self.transport = settings, store, transport
        self._refresh_locks = {}

    def oauth_client(self, **kwargs):
        return AsyncOAuth2Client(
            self.settings.google_client_id,
            client_secret=self.settings.google_client_secret,
            scope=SCOPE, redirect_uri=self.settings.redirect_uri,
            token_endpoint_auth_method="client_secret_post",
            code_challenge_method="S256", timeout=self.settings.timeout_seconds,
            transport=self.transport, **kwargs,
        )

    def authorization_url(self, state, verifier):
        client = self.oauth_client()
        url, _ = client.create_authorization_url(AUTH_URL, state=state, code_verifier=verifier, access_type="offline", prompt="consent")
        return url

    async def exchange(self, code, verifier):
        try:
            async with self.oauth_client() as client:
                token = dict(await client.fetch_token(TOKEN_URL, code=code, code_verifier=verifier))
            if not token.get("access_token") or SCOPE not in token.get("scope", SCOPE).split():
                raise ServiceError("oauth_scope", "Gmail read-only permission was not granted.", 400)
            return token
        except (httpx.HTTPError, OAuthError, ValueError, KeyError):
            raise ServiceError("oauth_exchange", "Google authorization could not be completed. Connect again.", 400) from None

    async def token(self, owner):
        async with self._refresh_locks.setdefault(owner, asyncio.Lock()):
            account = self.store.account(owner)
            token = account.get("credentials") if account else None
            if not token:
                raise ServiceError("reconnect_required", "Connect Gmail again to continue.", 401)
            if float(token.get("expires_at", 0)) > time.time() + 60:
                return token["access_token"]
            if not token.get("refresh_token"):
                self.store.credentials(owner, None)
                raise ServiceError("reconnect_required", "Google credentials expired. Connect Gmail again.", 401)
            try:
                async with self.oauth_client() as client:
                    updated = dict(await client.refresh_token(TOKEN_URL, refresh_token=token["refresh_token"]))
                updated.setdefault("refresh_token", token["refresh_token"])
                if not updated.get("access_token"):
                    raise ValueError("Missing token")
                self.store.credentials(owner, updated)
                return updated["access_token"]
            except OAuthError as exc:
                if exc.error == "invalid_grant":
                    self.store.credentials(owner, None)
                    raise ServiceError("reconnect_required", "Google access expired or was revoked. Connect Gmail again.", 401) from None
                raise ServiceError("google_unavailable", "Google token refresh failed. Try again later.") from None
            except (httpx.HTTPError, ValueError, KeyError):
                raise ServiceError("google_unavailable", "Google token refresh is unavailable. Try again later.") from None

    async def request(self, access_token, path, params=None):
        try:
            async with httpx.AsyncClient(timeout=self.settings.timeout_seconds, transport=self.transport) as client:
                response = await client.get(GMAIL_URL + path, params=params, headers={"Authorization": f"Bearer {access_token}"})
            if response.status_code == 401:
                raise ServiceError("reconnect_required", "Google access was rejected. Connect Gmail again.", 401)
            if response.status_code == 403:
                raise ServiceError("gmail_permission", "Gmail access was denied. Check API setup, consent and quota.", 403)
            if response.status_code == 404:
                raise ServiceError("message_missing", "This Gmail message is no longer available.", 404)
            if response.status_code == 429:
                raise ServiceError("gmail_rate_limit", "Gmail is rate limited. Wait before refreshing.", 429)
            response.raise_for_status()
            result = response.json()
            if not isinstance(result, dict):
                raise ValueError("Invalid response")
            return result
        except (httpx.HTTPError, ValueError):
            raise ServiceError("gmail_unavailable", "Gmail could not be reached. Try refreshing later.") from None

    async def profile(self, access_token):
        return await self.request(access_token, "/profile")

    async def list_messages(self, owner, limit, page_token):
        token = await self.token(owner)
        params = {"maxResults": limit, "labelIds": "INBOX", "includeSpamTrash": "false"}
        if page_token:
            params["pageToken"] = page_token
        try:
            return await self.request(token, "/messages", params)
        except ServiceError as exc:
            if exc.status == 401:
                self.store.credentials(owner, None)
            raise

    async def message(self, owner, message_id, metadata=False):
        if not MESSAGE_ID.fullmatch(message_id):
            raise ServiceError("invalid_message_id", "Invalid message identifier.", 422)
        token = await self.token(owner)
        try:
            return await self.request(token, f"/messages/{message_id}", {"format": "metadata" if metadata else "full"})
        except ServiceError as exc:
            if exc.status == 401:
                self.store.credentials(owner, None)
            raise

    async def revoke(self, token):
        if not token:
            return False
        try:
            async with httpx.AsyncClient(timeout=10, transport=self.transport) as client:
                response = await client.post("https://oauth2.googleapis.com/revoke", data={"token": token})
            return response.status_code == 200
        except httpx.HTTPError:
            return False
