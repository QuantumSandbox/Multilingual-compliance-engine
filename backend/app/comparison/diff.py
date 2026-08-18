from __future__ import annotations

import difflib
import re

from app.extraction.rules import extract_dates_regex


def text_diff(a: str, b: str) -> dict:
    """Return diff stats between two clause texts."""
    if not a and not b:
        return {"ratio": 1.0, "changed": False}
    ratio = difflib.SequenceMatcher(None, a or "", b or "").ratio()
    return {"ratio": round(ratio, 3), "changed": ratio < 0.85}


def deadline_changed(a: str, b: str) -> bool:
    da = set(extract_dates_regex(a or ""))
    db_ = set(extract_dates_regex(b or ""))
    if not da and not db_:
        return False
    return da != db_


def conflict_phrase(a: str, b: str) -> bool:
    """Heuristic: opposite requirements (shall / shall not)."""
    neg_a = bool(re.search(r"\b(shall not|must not|prohibited|not required)\b", a or "", re.I))
    neg_b = bool(re.search(r"\b(shall not|must not|prohibited|not required)\b", b or "", re.I))
    return neg_a != neg_b
