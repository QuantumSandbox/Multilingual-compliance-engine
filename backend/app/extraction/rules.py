from __future__ import annotations

import re

MODAL_RE = re.compile(
    r"\b(shall|must|should|required to|is required|are required|mandatory|"
    r"obligation|ensure|comply|submit|file|maintain|report|undertake|"
    r"responsible for|accountable)\b",
    re.IGNORECASE,
)

DATE_RE = re.compile(
    r"\b(?:\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|"
    r"july|august|september|october|november|december)|"
    r"(?:january|february|march|april|may|june|july|august|september|"
    r"october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}|"
    r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|"
    r"\b\d{4}[/-]\d{1,2}[/-]\d{1,2}|"
    r"within\s+\d+\s+(?:days|weeks|months|years)|"
    r"by\s+\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|"
    r"every\s+(?:year|quarter|month|six months))\b",
    re.IGNORECASE,
)

UNIT_RE = re.compile(
    r"\b(registrar|dean|principal|head of (?:the )?department|hod|"
    r"finance (?:department|dept)|academic (?:affairs|section)|"
    r"administration|director|compliance (?:officer|cell)|"
    r"institution|university|college|university)\b",
    re.IGNORECASE,
)


def looks_like_obligation(text: str) -> bool:
    return bool(MODAL_RE.search(text or ""))


def extract_dates_regex(text: str) -> list[str]:
    return DATE_RE.findall(text or "")


def extract_units_regex(text: str) -> list[str]:
    return UNIT_RE.findall(text or "")
