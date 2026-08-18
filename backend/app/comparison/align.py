from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from sqlalchemy.orm import Session

from app.models import Chunk, Document
from app.db import SessionLocal
from app.extraction.embeddings import cosine_similarity
from app.extraction.rules import looks_like_obligation


@dataclass
class Match:
    new_chunk: Chunk
    old_chunk: Chunk
    score: float


def _obligation_chunks(db: Session, doc_id: str) -> list[Chunk]:
    return (
        db.query(Chunk)
        .filter(Chunk.doc_id == doc_id, Chunk.is_obligation == True)  # noqa: E712
        .order_by(Chunk.chunk_index)
        .all()
    )


def align_chunks(db: Session, new_doc_id: str, old_doc_id: str, threshold: float = 0.6):
    new = _obligation_chunks(db, new_doc_id)
    old = _obligation_chunks(db, old_doc_id)
    used_old = set()
    matches: list[Match] = []
    unmatched_new: list[Chunk] = []
    for n in new:
        best = None
        best_score = threshold
        for o in old:
            if id(o) in used_old or o.id in used_old:
                continue
            s = cosine_similarity(n.embedding or [], o.embedding or [])
            if s > best_score:
                best_score = s
                best = o
        if best is not None:
            used_old.add(best.id)
            matches.append(Match(new_chunk=n, old_chunk=best, score=best_score))
        else:
            unmatched_new.append(n)
    unmatched_old = [o for o in old if o.id not in used_old]
    return matches, unmatched_new, unmatched_old


def previous_version_doc(db: Session, doc: Document) -> Optional[Document]:
    family = (
        db.query(Document)
        .filter(Document.family_id == doc.family_id, Document.id != doc.id)
        .all()
    )
    if not family:
        return None
    # pick the latest version that is not this one, by version string ordering
    def vkey(d):
        try:
            return [int(x) for x in d.version.lstrip("vV").split(".")]
        except Exception:
            return [0]

    others = sorted(family, key=lambda d: vkey(d), reverse=True)
    return others[0] if others else None
