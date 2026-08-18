from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.models import Document, Chunk, Task
from app.db import SessionLocal
from app.ingestion.extract_text import ingest_file, save_document_and_chunks
from app.extraction.llm_extract import extract_obligations_llm
from app.extraction.fallback import extract_obligations_rules
from app.extraction.fallback_dates import parse_deadline
from app.config import settings


def _run_extraction(chunks: list[dict]) -> tuple[list[dict], str]:
    """Hybrid: LLM extraction with rule-based supplementation. Returns (obligations, method)."""
    obligations: list[dict] = []
    used_llm = False

    llm_results, used = extract_obligations_llm(chunks)
    if used:
        used_llm = True
    obligations.extend(llm_results)

    # Rule-based coverage for chunks the LLM did not capture.
    covered = {(o.get("page"), o.get("paragraph")) for o in llm_results}
    for r in extract_obligations_rules(chunks):
        key = (r.get("page"), r.get("paragraph"))
        if key not in covered:
            obligations.append(r)

    if used_llm and obligations:
        method = "llm" if any(o["method"] == "llm" for o in obligations) else "rules"
        if any(o["method"] == "rules" for o in obligations) and any(o["method"] == "llm" for o in obligations):
            method = "partial"
    else:
        method = "rules"
    return obligations, method


def process_document(doc_id: str, base_date: date = None) -> dict:
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.doc_id == doc_id).first()
        if not doc:
            raise ValueError("Document not found")
        chunks = (
            db.query(Chunk)
            .filter(Chunk.doc_id == doc_id)
            .order_by(Chunk.chunk_index)
            .all()
        )
        chunk_dicts = [
            {
                "text": c.text,
                "original_text": c.original_text,
                "page": c.page,
                "paragraph": c.paragraph,
            }
            for c in chunks
        ]

        obligations, method = _run_extraction(chunk_dicts)

        created = 0
        for o in obligations:
            deadline = parse_deadline(o.get("deadline_raw"), base=base_date or date.today())
            task = Task(
                task_id=str(uuid.uuid4()),
                doc_id=doc.doc_id,
                obligation=o["obligation"],
                deadline=deadline,
                deadline_raw=o.get("deadline_raw"),
                responsible_unit=o.get("responsible_unit", ""),
                evidence_required=o.get("evidence_required", ""),
                source_page=o.get("page"),
                source_paragraph=o.get("paragraph"),
                source_text=o.get("source_text", ""),
                source_text_en=o.get("source_text_en", ""),
                confidence=float(o.get("confidence", 0.5)),
                extraction_method=o.get("method", method),
            )
            db.add(task)
            created += 1

        doc.processed = True
        db.commit()
        return {
            "doc_id": doc.doc_id,
            "title": doc.title,
            "language": doc.language,
            "chunks": len(chunk_dicts),
            "tasks_created": created,
            "processed_with": method,
        }
    finally:
        db.close()


def run_full_pipeline(
    file_path: str,
    meta: dict,
    base_date: date = None,
) -> dict:
    """Ingest a file, store chunks, then extract obligations into tasks."""
    ingestion = ingest_file(file_path, meta)
    meta["file_type"] = meta.get("file_type") or ingestion.get("file_type", "pdf")
    doc = save_document_and_chunks(meta, ingestion)
    return process_document(doc.doc_id, base_date=base_date)
