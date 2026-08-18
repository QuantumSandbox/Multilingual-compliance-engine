from __future__ import annotations

import re

# Split a page into clause-like segments preserving traceability.
# Primary split: numbered clauses (1. / (a) / Article 5 / १.), then newlines,
# then over-long segments are broken on sentence boundaries.

_NUM_SPLIT = re.compile(r"(?=\s*\b\d{1,3}[.)]\s+|(?:\n\s*)+(?=\d{1,3}[.)]\s))")
_SENT_SPLIT = re.compile(r"(?<=[.;:])\s+")


def chunk_text(text: str, max_chars: int = 500) -> list[str]:
    if not text:
        return []
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    segs: list[str] = []
    for line in lines:
        parts = _NUM_SPLIT.split(line)
        segs.extend(p.strip() for p in parts if p and p.strip())

    chunks: list[str] = []
    for seg in segs:
        if len(seg) <= max_chars:
            chunks.append(seg)
            continue
        # break long clause into sentences
        for s in _SENT_SPLIT.split(seg):
            s = s.strip()
            if s:
                chunks.append(s)
    return chunks or [text.strip()]
