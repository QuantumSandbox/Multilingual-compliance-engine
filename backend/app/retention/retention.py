from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import Document, AuditLog
from app.db import SessionLocal
from app.config import settings


def apply_retention(doc: Document, db: Session) -> None:
    """Set retention_expiry based on upload date + retention_days."""
    base = doc.created_at.date() if doc.created_at else date.today()
    doc.retention_expiry = base + timedelta(days=doc.retention_days)


def check_expirations() -> list[Document]:
    """Flag documents whose retention period has elapsed. Returns expired docs."""
    db = SessionLocal()
    out: list[Document] = []
    try:
        docs = db.query(Document).filter(Document.status == "active").all()
        today = date.today()
        for d in docs:
            if d.retention_expiry and d.retention_expiry <= today:
                d.status = "expired"
                out.append(d)
        if out:
            db.commit()
        return out
    finally:
        db.close()


def archive_document(doc_id: str, db: Session) -> None:
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if doc:
        doc.status = "archived"
        db.add(AuditLog(action="archive", resource=doc_id, detail="retention/archive"))
        db.commit()
