"""Render email as bounded text, never trusted HTML or downloadable attachments."""
import base64
import hashlib
import json
import re
from datetime import datetime, timezone
from email.header import decode_header, make_header
from email.utils import parseaddr
from html.parser import HTMLParser

MAX_BODY = 60000


def clean(value, limit=1000):
    return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", str(value or ""))[:limit]


def header(value):
    try:
        return clean(str(make_header(decode_header(value))))
    except (LookupError, UnicodeError, ValueError):
        return clean(value)


class TextHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hidden = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "iframe", "object"):
            self.hidden += 1
        elif tag in ("p", "div", "br", "li", "tr") and not self.hidden:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "iframe", "object"):
            self.hidden = max(0, self.hidden - 1)

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


def decode_body(part):
    data = part.get("body", {}).get("data", "")
    if not isinstance(data, str):
        return ""
    # Limit decoding work even when the remote MIME payload is malformed or huge.
    data = data[:MAX_BODY * 8]
    content_type = next((h.get("value", "") for h in part.get("headers", []) if h.get("name", "").lower() == "content-type"), "")
    charset = re.search(r"charset\s*=\s*[\"']?([\w-]+)", content_type, re.I)
    try:
        raw = base64.b64decode(data + "=" * (-len(data) % 4), altchars=b"-_", validate=True)
        try:
            return clean(raw.decode(charset.group(1) if charset else "utf-8", errors="replace"), MAX_BODY)
        except LookupError:
            return clean(raw.decode("utf-8", errors="replace"), MAX_BODY)
    except (ValueError, TypeError):
        return ""


def parse_mime(payload):
    plain, html, attachments = [], [], []
    nodes = [payload]
    visited = 0
    while nodes and visited < 200:
        part = nodes.pop(0)
        visited += 1
        if not isinstance(part, dict):
            continue
        filename = clean(part.get("filename"), 200)
        if filename:
            attachments.append(filename)
            continue  # Do not decode attached text or embedded messages as the email body.
        mime = part.get("mimeType", "").lower()
        if mime == "text/plain":
            plain.append(decode_body(part))
        elif mime == "text/html":
            html.append(decode_body(part))
        elif mime.startswith("multipart/"):
            nodes.extend(part.get("parts", [])[:100])
    body = "\n".join(x for x in plain if x.strip())
    if not body.strip() and html:
        parser = TextHTML()
        parser.feed("\n".join(html)[:MAX_BODY * 2])
        body = "".join(parser.parts)
    return clean(body.strip(), MAX_BODY), list(dict.fromkeys(attachments))[:50]


def normalize_message(message):
    payload = message.get("payload") or {}
    headers = {h.get("name", "").lower(): header(h.get("value", "")) for h in payload.get("headers", []) if isinstance(h, dict)}
    sender, sender_email = parseaddr(headers.get("from", ""))
    body, attachments = parse_mime(payload)
    try:
        timestamp = datetime.fromtimestamp(int(message.get("internalDate", 0)) / 1000, timezone.utc).isoformat()
    except (ValueError, TypeError, OverflowError, OSError):
        timestamp = datetime.fromtimestamp(0, timezone.utc).isoformat()
    labels = message.get("labelIds", [])
    normalized = {
        "id": str(message["id"]), "source": "gmail", "sender": sender or sender_email or "Unknown sender",
        "senderEmail": sender_email, "recipient": headers.get("to", ""),
        "subject": headers.get("subject") or "(No subject)", "timestamp": timestamp,
        "preview": clean(message.get("snippet"), 500), "body": body, "attachments": attachments,
        "isRead": "UNREAD" not in labels, "isStarred": "STARRED" in labels,
        "archived": "INBOX" not in labels, "spam": "SPAM" in labels, "deleted": False,
        "historyId": str(message.get("historyId", "")), "analysisStatus": "unanalyzed",
        "analysis": None, "analysisError": None,
    }
    content = {key: normalized[key] for key in ("subject", "sender", "senderEmail", "recipient", "timestamp", "body")}
    normalized["fingerprint"] = hashlib.sha256(json.dumps(content, sort_keys=True).encode()).hexdigest()
    return normalized
