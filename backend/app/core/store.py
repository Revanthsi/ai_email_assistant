"""Small SQLite store. Sensitive payloads are Fernet encrypted; queries are owner-scoped."""
import hashlib
import json
import secrets
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path

from cryptography.fernet import Fernet
from app.core.errors import ServiceError


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


class Store:
    def __init__(self, path, key):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.path = path
        self.cipher = Fernet(key.encode() if key else Fernet.generate_key())
        with self.db() as db:
            db.executescript("""
                PRAGMA journal_mode=WAL;
                CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, identity TEXT UNIQUE, payload TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, expires REAL, account_id TEXT, csrf TEXT NOT NULL, oauth TEXT);
                CREATE TABLE IF NOT EXISTS records (owner TEXT, kind TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(owner,kind,id));
            """)

    @contextmanager
    def db(self):
        conn = sqlite3.connect(self.path, timeout=10)
        conn.row_factory = sqlite3.Row
        try:
            with conn:
                yield conn
        finally:
            conn.close()

    def encrypt(self, payload):
        return self.cipher.encrypt(json.dumps(payload).encode()).decode()

    def decrypt(self, payload):
        return json.loads(self.cipher.decrypt(payload.encode()))

    def new_session(self, seconds, owner=None):
        raw, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        with self.db() as db:
            db.execute("DELETE FROM sessions WHERE expires < ?", (time.time(),))
            db.execute("INSERT INTO sessions VALUES (?,?,?,?,NULL)", (digest(raw), time.time() + seconds, owner, csrf))
        return raw, self.session(raw)

    def session(self, raw):
        if not raw or len(raw) > 100:
            return None
        with self.db() as db:
            row = db.execute("SELECT * FROM sessions WHERE id=? AND expires>?", (digest(raw), time.time())).fetchone()
        return dict(row) if row else None

    def remove_session(self, raw):
        with self.db() as db:
            db.execute("DELETE FROM sessions WHERE id=?", (digest(raw),))

    def set_oauth(self, session_id, payload):
        with self.db() as db:
            db.execute("UPDATE sessions SET oauth=? WHERE id=?", (self.encrypt(payload), session_id))

    def consume_oauth(self, session_id):
        with self.db() as db:
            # Atomic consumption prevents callback replay even across worker processes.
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT oauth FROM sessions WHERE id=?", (session_id,)).fetchone()
            db.execute("UPDATE sessions SET oauth=NULL WHERE id=?", (session_id,))
        return self.decrypt(row[0]) if row and row[0] else None

    def connect_account(self, email, credentials):
        identity = digest(email.strip().lower())
        with self.db() as db:
            row = db.execute("SELECT id FROM accounts WHERE identity=?", (identity,)).fetchone()
            owner = row[0] if row else secrets.token_hex(16)
            db.execute("INSERT OR REPLACE INTO accounts VALUES (?,?,?)", (owner, identity, self.encrypt({"email": email, "credentials": credentials})))
        return owner

    def account(self, owner):
        with self.db() as db:
            row = db.execute("SELECT payload FROM accounts WHERE id=?", (owner,)).fetchone()
        return self.decrypt(row[0]) if row else None

    def credentials(self, owner, credentials):
        account = self.account(owner)
        if account:
            account["credentials"] = credentials
            with self.db() as db:
                db.execute("UPDATE accounts SET payload=? WHERE id=?", (self.encrypt(account), owner))

    def disconnect(self, owner):
        with self.db() as db:
            db.execute("DELETE FROM records WHERE owner=?", (owner,))
            db.execute("DELETE FROM accounts WHERE id=?", (owner,))
            db.execute("DELETE FROM sessions WHERE account_id=?", (owner,))

    def put(self, owner, kind, record_id, payload):
        with self.db() as db:
            db.execute("BEGIN IMMEDIATE")
            if not db.execute("SELECT id FROM accounts WHERE id=?", (owner,)).fetchone():
                raise ServiceError("not_connected", "The account was disconnected. Connect again.", 401)
            db.execute("INSERT OR REPLACE INTO records VALUES (?,?,?,?)", (owner, kind, record_id, self.encrypt(payload)))

    def save_analysis(self, owner, email, actions, priority):
        # Tasks and analysis commit together; concurrent disconnect cannot resurrect data.
        with self.db() as db:
            db.execute("BEGIN IMMEDIATE")
            if not db.execute("SELECT id FROM accounts WHERE id=?", (owner,)).fetchone():
                raise ServiceError("not_connected", "The account was disconnected. Connect again.", 401)
            rows = db.execute("SELECT id,payload FROM records WHERE owner=? AND kind='task'", (owner,)).fetchall()
            existing = {row["id"]: self.decrypt(row["payload"]) for row in rows}
            current_ids = {action["id"] for action in actions}
            for task_id, task in existing.items():
                if task.get("emailId") == email["id"] and task_id not in current_ids:
                    task["retired"] = True
                    db.execute("UPDATE records SET payload=? WHERE owner=? AND kind='task' AND id=?", (self.encrypt(task), owner, task_id))
            for action in actions:
                previous = existing.get(action["id"], {})
                task = {**action, "emailId": email["id"], "dueDate": action["deadline"], "priority": priority, "origin": "email", "status": "pending", "deleted": False, "reminderDismissed": False, **previous, "retired": False}
                db.execute("INSERT OR REPLACE INTO records VALUES (?,?,?,?)", (owner, "task", task["id"], self.encrypt(task)))
            db.execute("INSERT OR REPLACE INTO records VALUES (?,?,?,?)", (owner, "email", email["id"], self.encrypt(email)))

    def get(self, owner, kind, record_id):
        with self.db() as db:
            row = db.execute("SELECT payload FROM records WHERE owner=? AND kind=? AND id=?", (owner, kind, record_id)).fetchone()
        return self.decrypt(row[0]) if row else None

    def all(self, owner, kind):
        with self.db() as db:
            rows = db.execute("SELECT payload FROM records WHERE owner=? AND kind=? ORDER BY rowid", (owner, kind)).fetchall()
        return [self.decrypt(row[0]) for row in rows]
