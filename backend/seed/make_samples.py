from __future__ import annotations

"""Generate realistic sample regulatory documents used to demo the engine.

Run:  python -m seed.make_samples
Produces PDFs + a Hindi text file in ../sample_data/
"""
import os
from pathlib import Path

from fpdf import FPDF

SAMPLE_DIR = Path(__file__).resolve().parent.parent.parent / "sample_data"
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)


def _pdf(title: str, paragraphs: list[str], filename: str):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    pdf.multi_cell(0, 8, title)
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 11)
    for p in paragraphs:
        pdf.multi_cell(0, 6, p)
        pdf.ln(1)
    out = SAMPLE_DIR / filename
    pdf.output(str(out))
    return out


AICTE_V1 = [
    "No. AICTE/2024/Circular/017  |  Dated: 15 January 2024",
    "Subject: Annual Compliance Reporting for Approved Institutions.",
    "1. Every approved institution shall submit an annual compliance report by March 31, 2025.",
    "2. The institution is required to maintain a register of faculty qualifications and submit it within 60 days of the academic session commencement.",
    "3. The Finance Department must ensure that fee reimbursement statements are filed by June 30 each year, supported by a certified audit report.",
    "4. The Head of the Institution shall appoint a Compliance Officer responsible for coordinating all regulatory submissions.",
    "5. Institutions are required to upload outcome-based education data every quarter to the AICTE portal.",
    "6. Failure to comply with the above shall attract penal action including withdrawal of approval.",
]

AICTE_V2 = [
    "No. AICTE/2024/Circular/017 (Rev-1)  |  Dated: 20 February 2024",
    "Subject: Annual Compliance Reporting for Approved Institutions (Revised).",
    "1. Every approved institution shall submit an annual compliance report by April 30, 2025.",
    "2. The institution is required to maintain a register of faculty qualifications and submit it within 45 days of the academic session commencement.",
    "3. The Finance Department must ensure that fee reimbursement statements are filed by June 30 each year, supported by a certified audit report.",
    "4. The Head of the Institution shall appoint a Compliance Officer responsible for coordinating all regulatory submissions.",
    "5. Institutions are required to upload outcome-based education data every month to the AICTE portal.",
    "6. A self-attested declaration of compliance must be submitted by the Registrar within 15 days of report submission.",
    "7. Failure to comply with the above shall attract penal action including withdrawal of approval.",
]

NAAC = [
    "NAAC/SSR/2024/03  |  National Assessment and Accreditation Council",
    "Subject: Data Requirements for Accreditation (Cycle 5).",
    "1. The Institution shall submit the Self Study Report (SSR) through the NAAC portal by September 15, 2025.",
    "2. The IQAC Coordinator must ensure that all metric data is validated by the Principal before submission.",
    "3. Evidence of student feedback shall be maintained for a period of five years and produced on demand.",
    "4. The Institution is required to conduct an internal quality audit every six months.",
    "5. The Librarian shall submit an annual collection development report by December 31 each year.",
]

GFR = [
    "General Financial Rules (GFR) 2024 - Procurement Compliance",
    "1. Every purchase above INR 25,00,000 shall be procured through open tendering by the Purchase Committee.",
    "2. The Finance Department must obtain three competitive quotations for all procurement between INR 5,00,000 and 25,00,000.",
    "3. The Registrar is required to publish all awarded contracts on the institutional website within 30 days.",
    "4. Annual procurement returns shall be submitted to the competent authority by March 31 each year with supporting vouchers.",
    "5. The Head of Department shall certify the technical specifications before floating any tender.",
]

HINDI = """भारतीय प्रौद्योगिकी संस्थान - अनुपालन परिपत्र

1. संस्थान को हर वर्ष 31 मार्च तक वार्षिक अनुपालन रिपोर्ट जमा करनी चाहिए।
2. वित्त विभाग को हर साल 30 जून तक लेखा परीक्षा रिपोर्ट के साथ शुल्क प्रतिपूर्ति बयान जमा करना अनिवार्य है।
3. संस्थान के प्रमुख को नियामक प्रस्तुतियों के समन्वय के लिए एक अनुपालन अधिकारी नियुक्त करना चाहिए।
4. संस्थान को हर तिमाही में परिणाम आधारित शिक्षा डेटा पोर्टल पर अपलोड करना आवश्यक है।
"""


def main():
    _pdf("AICTE Circular 2024/017 - Annual Compliance Reporting", AICTE_V1, "AICTE_v1.pdf")
    _pdf("AICTE Circular 2024/017 (Rev-1) - Annual Compliance Reporting", AICTE_V2, "AICTE_v2.pdf")
    _pdf("NAAC Accreditation Data Requirements (Cycle 5)", NAAC, "NAAC.pdf")
    _pdf("GFR 2024 - Procurement Compliance", GFR, "GFR.pdf")
    (SAMPLE_DIR / "Hindi_sample.txt").write_text(HINDI, encoding="utf-8")
    print(f"Sample documents written to {SAMPLE_DIR}")


if __name__ == "__main__":
    main()
