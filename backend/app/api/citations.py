from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import Task, User
from app.schemas import CitationOut

router = APIRouter(prefix="/api/citations", tags=["citations"])


@router.get("/{task_id}", response_model=CitationOut)
def get_citation(task_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    t = db.query(Task).filter(Task.task_id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    doc = t.document
    if doc.sensitive and user.role == "viewer":
        raise HTTPException(status_code=403, detail="Restricted")
    return CitationOut(
        doc_id=doc.doc_id,
        title=doc.title,
        file_path=doc.file_path,
        file_type=doc.file_type,
        page=t.source_page,
        paragraph=t.source_paragraph,
        source_text=t.source_text,
        source_text_en=t.source_text_en,
    )


@router.get("/file/{doc_id}")
def get_file(doc_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    if doc.sensitive and user.role == "viewer":
        raise HTTPException(status_code=403, detail="Restricted")
    from app.auth import log_audit

    log_audit(db, user, "access_document", resource=doc_id)
    try:
        with open(doc.file_path, "rb") as f:
            data = f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File missing")
    media = {
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "doc": "application/msword",
        "txt": "text/plain",
    }.get(doc.file_type, "application/octet-stream")
    return Response(content=data, media_type=media)
