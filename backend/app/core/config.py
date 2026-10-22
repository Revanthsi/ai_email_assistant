"""Server-only configuration. Connecting Gmail requires a stable encryption key."""
import os
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
SCOPE = "https://www.googleapis.com/auth/gmail.readonly"


@dataclass
class Settings:
    environment: str = "development"
    frontend_origin: str = "http://localhost:3000"
    allowed_origins: list[str] = field(default_factory=lambda: ["http://localhost:3000"])
    allowed_hosts: list[str] = field(default_factory=lambda: ["localhost", "127.0.0.1", "testserver"])
    redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    google_client_id: str = ""
    google_client_secret: str = ""
    encryption_key: str = ""
    database_path: str = str(ROOT / "data" / "mailmate.sqlite3")
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    session_seconds: int = 86400 * 7
    timeout_seconds: float = 30
    ai_input_chars: int = 16000

    @property
    def production(self):
        return self.environment == "production"

    @property
    def oauth_configured(self):
        return bool(self.google_client_id and self.google_client_secret and self.encryption_key)

    def validate(self):
        if self.environment not in ("development", "production"):
            raise ValueError("ENVIRONMENT must be development or production")
        for origin in [self.frontend_origin, *self.allowed_origins]:
            parsed = urlparse(origin)
            if parsed.scheme not in ("http", "https") or not parsed.hostname or parsed.path not in ("", "/") or parsed.query or parsed.fragment or parsed.username:
                raise ValueError("Frontend origins must be exact HTTP(S) origins")
        callback = urlparse(self.redirect_uri)
        if callback.path != "/api/auth/google/callback" or callback.query or callback.fragment or callback.username or not callback.hostname:
            raise ValueError("Invalid Google redirect URI")
        if self.frontend_origin not in self.allowed_origins:
            raise ValueError("FRONTEND_ORIGIN must be included in ALLOWED_FRONTEND_ORIGINS")
        if self.production:
            if not self.encryption_key or any(urlparse(url).scheme != "https" for url in [self.redirect_uri, *self.allowed_origins]):
                raise ValueError("Production requires HTTPS and a persistent ENCRYPTION_KEY")
            if any("*" in host for host in self.allowed_hosts) or "testserver" in self.allowed_hosts:
                raise ValueError("Set explicit production ALLOWED_HOSTS")
        elif callback.scheme != "https" and not (callback.scheme == "http" and callback.hostname in ("localhost", "127.0.0.1")):
            raise ValueError("Non-local OAuth callbacks require HTTPS")


def load_settings():
    load_dotenv(ROOT / ".env")
    settings = Settings(
        environment=os.getenv("ENVIRONMENT", "development"),
        frontend_origin=os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").rstrip("/"),
        allowed_origins=[x.strip().rstrip("/") for x in os.getenv("ALLOWED_FRONTEND_ORIGINS", "http://localhost:3000").split(",")],
        allowed_hosts=[x.strip() for x in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,testserver").split(",")],
        redirect_uri=os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback"),
        google_client_id=os.getenv("GOOGLE_CLIENT_ID", ""),
        google_client_secret=os.getenv("GOOGLE_CLIENT_SECRET", ""),
        encryption_key=os.getenv("ENCRYPTION_KEY", ""),
        database_path=os.getenv("DATABASE_PATH", str(ROOT / "data" / "mailmate.sqlite3")),
        gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    )
    settings.validate()
    return settings
