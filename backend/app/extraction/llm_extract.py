from __future__ import annotations

import json
import re
from typing import Optional

from app.config import settings

PROMPT = """You are a regulatory compliance extraction engine.
Given the following clauses extracted from an official regulatory document,
identify every OBLIGATION (a duty, requirement, or action that an institution
or unit MUST or SHALL perform). Ignore purely informational text.

For each obligation return a JSON object with these fields:
- "obligation": a concise statement of what must be done
- "deadline_raw": the exact deadline phrase if present (e.g. "by March 31, 2025",
  "within 30 days"), else null
- "responsible_unit": the role/department responsible if stated, else null
- "evidence_required": the proof/documentation required, else null
- "source_text": the EXACT verbatim span from the clauses that expresses the
  obligation (copy it character-for-character; used for citation)
- "confidence": a number between 0 and 1

Return ONLY a JSON array (may be empty []). Do not wrap in markdown.

CLAUSES:
---
{clauses}
---
"""


def _call_gemini(prompt: str) -> Optional[str]:
    if not settings.gemini_api_key:
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model)
        resp = model.generate_content(prompt)
        return resp.text
    except Exception:
        return None


def _parse_json_array(text: str) -> list[dict]:
    if not text:
        return []
    text = text.strip()
    # strip markdown fences
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if m:
        text = m.group(1)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # try to extract first [ ... ] block
        m = re.search(r"\[.*\]", text, re.DOTALL)
        if not m:
            return []
        try:
            data = json.loads(m.group(0))
        except json.JSONDecodeError:
            return []
    if isinstance(data, dict):
        data = data.get("obligations", [data])
    return data if isinstance(data, list) else []


def extract_obligations_llm(chunks: list[dict], batch: int = 5) -> tuple[list[dict], bool]:
    """Return (obligations, used_llm). Each obligation references its source chunk."""
    used_llm = False
    results: list[dict] = []
    for i in range(0, len(chunks), batch):
        group = chunks[i : i + batch]
        numbered = "\n\n".join(f"[{idx}] {c['text']}" for idx, c in enumerate(group))
        raw = _call_gemini(PROMPT.format(clauses=numbered))
        if raw is None:
            # fall back to rule-based for this group
            from app.extraction.fallback import extract_obligations_rules

            results.extend(extract_obligations_rules(group))
            continue
        used_llm = True
        items = _parse_json_array(raw)
        for item in items:
            # find best matching chunk by source_text overlap
            src = (item.get("source_text") or "").strip()
            best = _match_chunk(src, group)
            base = best or group[0]
            results.append(
                {
                    "obligation": item.get("obligation") or (best["text"] if best else ""),
                    "deadline_raw": item.get("deadline_raw"),
                    "responsible_unit": item.get("responsible_unit") or "",
                    "evidence_required": item.get("evidence_required") or "",
                    "source_text": base["original_text"],
                    "source_text_en": base["text"],
                    "page": base["page"],
                    "paragraph": base["paragraph"],
                    "confidence": float(item.get("confidence") or 0.6),
                    "method": "llm",
                }
            )
    return results, used_llm


def _match_chunk(src: str, group: list[dict]):
    if not src:
        return None
    src_l = src.lower()
    best = None
    best_score = 0
    for c in group:
        cl = c["text"].lower()
        # token overlap
        toks = set(re.findall(r"[a-z0-9]+", src_l))
        overlap = sum(1 for t in toks if t in cl)
        score = overlap / (len(toks) or 1)
        if score > best_score:
            best_score = score
            best = c
    return best if best_score > 0.4 else None
