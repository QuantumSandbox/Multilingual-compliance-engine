from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.models import Conflict, Document, Task, Chunk
from app.db import SessionLocal
from app.comparison.align import align_chunks, previous_version_doc
from app.comparison.diff import text_diff, deadline_changed, conflict_phrase


def _make_conflict(db, **kw) -> Conflict:
    c = Conflict(conflict_id=str(uuid.uuid4()), **kw)
    db.add(c)
    return c


def detect_version_changes(new_doc_id: str) -> list[Conflict]:
    db = SessionLocal()
    out: list[Conflict] = []
    try:
        new_doc = db.query(Document).filter(Document.doc_id == new_doc_id).first()
        if not new_doc:
            return out
        old_doc = previous_version_doc(db, new_doc)
        if not old_doc:
            return out

        matches, unmatched_new, unmatched_old = align_chunks(db, new_doc.doc_id, old_doc.doc_id)

        # Modified / conflicting clauses
        for m in matches:
            d = text_diff(m.old_chunk.text, m.new_chunk.text)
            if not d["changed"]:
                continue
            dl_changed = deadline_changed(m.old_chunk.text, m.new_chunk.text)
            is_conflict = conflict_phrase(m.old_chunk.text, m.new_chunk.text) or (
                dl_changed and m.new_chunk.is_obligation
            )
            change_type = "conflict" if is_conflict else "modified"
            sev = "high" if is_conflict else "medium"
            c = _make_conflict(
                db,
                kind="version_change",
                change_type=change_type,
                obligation=m.new_chunk.text[:300],
                doc_a=old_doc.doc_id,
                doc_b=new_doc.doc_id,
                text_a=m.old_chunk.original_text,
                text_b=m.new_chunk.original_text,
                page_a=m.old_chunk.page,
                page_b=m.new_chunk.page,
                deadline_a=", ".join(__dates(m.old_chunk.text)),
                deadline_b=", ".join(__dates(m.new_chunk.text)),
                severity=sev,
            )
            out.append(c)

        # Added obligations
        for n in unmatched_new:
            c = _make_conflict(
                db,
                kind="version_change",
                change_type="added",
                obligation=n.text[:300],
                doc_a=old_doc.doc_id,
                doc_b=new_doc.doc_id,
                text_b=n.original_text,
                page_b=n.page,
                deadline_b=", ".join(__dates(n.text)),
                severity="low",
            )
            out.append(c)

        # Removed obligations
        for o in unmatched_old:
            c = _make_conflict(
                db,
                kind="version_change",
                change_type="removed",
                obligation=o.text[:300],
                doc_a=old_doc.doc_id,
                doc_b=new_doc.doc_id,
                text_a=o.original_text,
                page_a=o.page,
                deadline_a=", ".join(__dates(o.text)),
                severity="low",
            )
            out.append(c)

        db.commit()
        for c in out:
            db.refresh(c)
        return out
    finally:
        db.close()


def detect_cross_document_conflicts() -> list[Conflict]:
    """Flag same obligation with different deadlines across active documents."""
    db = SessionLocal()
    out: list[Conflict] = []
    try:
        tasks = db.query(Task).filter(Task.deadline.isnot(None)).all()
        # group by normalized obligation
        groups: dict[str, list[Task]] = {}
        for t in tasks:
            key = _norm(t.obligation)
            groups.setdefault(key, []).append(t)
        for key, grp in groups.items():
            if len(grp) < 2:
                continue
            deadlines = {str(t.deadline) for t in grp}
            if len(deadlines) > 1:
                c = _make_conflict(
                    db,
                    kind="cross_document",
                    change_type="conflict",
                    obligation=grp[0].obligation[:300],
                    doc_a=grp[0].doc_id,
                    doc_b=grp[1].doc_id,
                    text_a=grp[0].source_text,
                    text_b=grp[1].source_text,
                    page_a=grp[0].source_page,
                    page_b=grp[1].source_page,
                    deadline_a=str(grp[0].deadline),
                    deadline_b=str(grp[1].deadline),
                    severity="high",
                )
                # link tasks
                c.tasks.extend(grp[:2])
                out.append(c)
        db.commit()
        for c in out:
            db.refresh(c)
        return out
    finally:
        db.close()


def __dates(text: str) -> list[str]:
    from app.extraction.rules import extract_dates_regex

    return extract_dates_regex(text or "")


def _norm(text: str) -> str:
    import re

    t = re.sub(r"[^a-z ]", " ", (text or "").lower())
    stop = {"the", "a", "an", "shall", "must", "should", "is", "are", "to", "of", "and", "by", "within"}
    toks = [w for w in t.split() if w and w not in stop]
    return " ".join(sorted(set(toks)))
