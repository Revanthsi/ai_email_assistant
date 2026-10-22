"""Generate a local encryption key directly into ignored backend/.env without printing it."""
import re
from pathlib import Path

from cryptography.fernet import Fernet

env = Path(__file__).resolve().parents[1] / ".env"
if not env.exists():
    raise SystemExit("Copy backend/.env.example to backend/.env first.")
text = env.read_text(encoding="utf-8-sig")
existing = re.search(r"^ENCRYPTION_KEY=(.*)$", text, re.M)
if existing and existing.group(1).strip():
    raise SystemExit("ENCRYPTION_KEY is already set; it was not changed.")
key = Fernet.generate_key().decode()
text = re.sub(r"^ENCRYPTION_KEY=.*$", "ENCRYPTION_KEY=" + key, text, flags=re.M) if existing else text + "\nENCRYPTION_KEY=" + key + "\n"
env.write_text(text, encoding="utf-8")
print("Saved a new ENCRYPTION_KEY in backend/.env. Keep it secret and stable.")
