from __future__ import annotations

import re
from datetime import date

from app.extraction.rules import (
    looks_like_obligation,
    extract_dates_regex,
    extract_units_regex,
    MODAL_RE,
)
from app.extraction.fallback_dates import parse_deadline

EVIDENCE_RE = re.compile(
    r"\b(report|certificate|certified|proof|document|record|statement|"
    r"annual return|audit|approval|signature|affidavit|return)\b",
    re.IGNORECASE,
)


def extract_obligations_rules(chunks: list[dict]) -> list[dict]:
    results: list[dict] = []
    for c in chunks:
        if not looks_like_obligation(c["text"]):
            continue
        dates = extract_dates_regex(c["text"])
        units = extract_units_regex(c["text"])
        has_evidence = bool(EVIDENCE_RE.search(c["text"]))
        obligation = _clean_obligation(c["text"])
        results.append(
            {
                "obligation": obligation,
                "deadline_raw": dates[0] if dates else None,
                "responsible_unit": units[0] if units else "",
                "evidence_required": "Documentation/record as cited" if has_evidence else "",
                "source_text": c["original_text"],
                "source_text_en": c["text"],
                "page": c["page"],
                "paragraph": c["paragraph"],
                "confidence": 0.55,
                "method": "rules",
            }
        )
    return results


def _clean_obligation(text: str) -> str:
    # Trim to a readable clause: first sentence containing a modal verb.
    sentences = re.split(r"(?<=[.;])\s+", text)
    for s in sentences:
        if MODAL_RE.search(s):
            return s.strip().strip(";")
    return text.strip()
