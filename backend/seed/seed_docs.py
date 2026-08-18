from __future__ import annotations

"""Ingest the generated sample documents into the engine.

Run (from backend/):  python -m seed.seed_docs
Requires: sample_data/ populated (run make_samples.py first).
"""
import os
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))

from app.db import Base, engine  # noqa: E402
from app import models  # noqa: E402,F401
from app.tasks.task_manager import run_full_pipeline  # noqa: E402
from app.comparison.conflicts import detect_cross_document_conflicts  # noqa: E402
from app.retention.retention import apply_retention  # noqa: E402
from app.db import SessionLocal  # noqa: E402
from app.models import Document  # noqa: E402

SAMPLE_DIR = BACKEND.parent / "sample_data"


SPEC = [
    ("AICTE_v1.pdf", "AICTE Circular 2024/017 - Annual Compliance", "circular", "AICTE", "v1", "AICTE_2024_017", False),
    ("AICTE_v2.pdf", "AICTE Circular 2024/017 Rev-1 - Annual Compliance", "circular", "AICTE", "v2", "AICTE_2024_017", False),
    ("NAAC.pdf", "NAAC Accreditation Cycle 5 Data Requirements", "accreditation", "NAAC", "v1", "NAAC_C5", False),
    ("GFR.pdf", "GFR 2024 Procurement Compliance", "procurement", "GFR", "v1", "GFR_2024", False),
    ("Hindi_sample.txt", "Hindi Institutional Compliance Circular", "circular", "Institution", "v1", "HINDI_2024", False),
]


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    total = 0
    try:
        for fname, title, stype, dept, ver, fam, sens in SPEC:
            path = SAMPLE_DIR / fname
            if not path.exists():
                print(f"SKIP (missing): {fname}")
                continue
            ext = os.path.splitext(fname)[1].lstrip(".")
            import uuid
            doc_id = str(uuid.uuid4())
            meta = {
                "doc_id": doc_id,
                "title": title,
                "source_type": stype,
                "source_dept": dept,
                "version": ver,
                "family_id": fam,
                "filename": fname,
                "file_path": str(path),
                "file_type": ext,
                "sensitive": sens,
                "retention_days": 1825,
                "uploaded_by": 1,
            }
            try:
                res = run_full_pipeline(str(path), meta)
                doc = db.query(Document).filter(Document.doc_id == doc_id).first()
                if doc:
                    apply_retention(doc, db)
                    db.commit()
                print(f"OK  {fname:20s} tasks={res['tasks_created']:2d} method={res['processed_with']}")
                total += res["tasks_created"]
            except Exception as e:
                print(f"ERR {fname}: {e}")
        # version + cross-doc comparisons
        for fam in ["AICTE_2024_017"]:
            from app.comparison.conflicts import detect_version_changes
            v2 = db.query(Document).filter(Document.family_id == fam, Document.version == "v2").first()
            if v2:
                detect_version_changes(v2.doc_id)
        detect_cross_document_conflicts()
        db.commit()
        print(f"\nTotal obligations extracted: {total}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
