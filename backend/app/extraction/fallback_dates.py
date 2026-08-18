from __future__ import annotations

import re
from datetime import date, timedelta
from dateutil import parser as dateparser

MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11,
    "december": 12,
}


def parse_deadline(raw: str | None, base: date = None) -> date | None:
    """Best-effort parse of a deadline phrase into a date."""
    if not raw:
        return None
    base = base or date.today()
    s = raw.strip().lower()

    # relative: "within N days/weeks/months/years"
    m = re.search(r"within\s+(\d+)\s+(day|week|month|year)", s)
    if m:
        n = int(m.group(1))
        unit = m.group(2)
        delta = {"day": 1, "week": 7, "month": 30, "year": 365}[unit]
        return base + timedelta(days=n * delta)

    # "every year/quarter/month"
    m = re.search(r"every\s+(year|quarter|month|six months)", s)
    if m:
        return base + timedelta(days=365)

    # absolute dates
    try:
        # normalize ordinals and month names
        norm = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", raw)
        norm = re.sub(r"(\d{1,2})\s*([/-])\s*(\d{1,2})\s*([/-])\s*(\d{2,4})",
                      lambda x: f"{x.group(1):>02}/{x.group(3):>02}/{x.group(5)}", norm)
        dt = dateparser.parse(norm, default=base, dayfirst=True)
        return dt.date()
    except Exception:
        # try month name + year only -> end of that month
        m = re.search(r"([a-z]+)\s+(\d{4})", s)
        if m and m.group(1) in MONTHS:
            y = int(m.group(2))
            mo = MONTHS[m.group(1)]
            if mo == 2:
                return date(y, 2, 28)
            if mo in (4, 6, 9, 11):
                return date(y, mo, 30)
            return date(y, mo, 31)
        return None
