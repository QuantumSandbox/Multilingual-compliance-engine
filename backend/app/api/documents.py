from __future__ import annotations

import os
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.auth import get_current_user, log_audit, require_roles
from app.config import UPLOAD_DIR, settings
from app.db import get_db
from app.models import Document, User
from app.schemas import DocumentOut, UploadResponse
from app.tasks.task_manager import run_full_pipeline
from app.comparison.conflicts import detect_version_changes
from app.retention.retention import apply_retention

router = APIRouter(prefix="/api/documents", tags=["documents"])


ALLOWED = {".pdf", ".docx", ".doc", ".txt"}


@router.post("/upload", response_model=UploadResponse)
def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    source_type: str = Form("circular"),
    source_dept: str = Form(""),
    version: str = Form("v1"),
    family_id: str = Form(""),
    sensitive: bool = Form(False),
    retention_days: int = Form(settings.default_retention_days),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    doc_id = str(uuid.uuid4())
    fam = family_id or doc_id
    save_name = f"{doc_id}{ext}"
    save_path = UPLOAD_DIR / save_name

    contents = file.file.read()
    with open(save_path, "wb") as f:
        f.write(contents)

    meta = {
        "doc_id": doc_id,
        "title": title,
        "source_type": source_type,
        "source_dept": source_dept,
        "version": version,
        "family_id": fam,
        "filename": file.filename,
        "file_path": str(save_path),
        "file_type": ext.lstrip("."),
        "sensitive": sensitive,
        "retention_days": retention_days,
        "uploaded_by": user.id,
    }

    try:
        result = run_full_pipeline(str(save_path), meta, base_date=date.today())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

    # retention
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if doc:
        apply_retention(doc, db)
        db.commit()

    if sensitive:
        log_audit(db, user, "upload_sensitive", resource=doc_id, detail=f"retention={retention_days}d")
    else:
        log_audit(db, user, "upload", resource=doc_id)

    # run version comparison if a previous version exists
    detect_version_changes(doc_id)

    return UploadResponse(**result)


@router.get("", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role == "viewer":
        docs = db.query(Document).filter(Document.sensitive == False).all()  # noqa: E712
    else:
        docs = db.query(Document).all()
    return docs


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(doc_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.sensitive and user.role == "viewer":
        raise HTTPException(status_code=403, detail="Sensitive document restricted")
    return doc


@router.post("/{doc_id}/compare", response_model=list[dict])
def compare_document(doc_id: str, db: Session = Depends(get_db),
                     user: User = Depends(get_current_user)):
    conflicts = detect_version_changes(doc_id)
    return [
        {
            "conflict_id": c.conflict_id,
            "kind": c.kind,
            "change_type": c.change_type,
            "obligation": c.obligation,
            "text_a": c.text_a,
            "text_b": c.text_b,
            "page_a": c.page_a,
            "page_b": c.page_b,
            "deadline_a": c.deadline_a,
            "deadline_b": c.deadline_b,
            "severity": c.severity,
        }
        for c in conflicts
    ]
