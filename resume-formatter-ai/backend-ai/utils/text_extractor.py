import re
import docx2txt
from pypdf import PdfReader


import re

def clean_extracted_text(text: str) -> str:
    """
    Clean up noisy text from PDF/DOCX extraction.
    Fixes CGPA/GPA, phone numbers, dates, and collapses vertical character-by-character sequences.
    """
    if not text:
        return ""

    # Collapse sequences like "C G P A" into "CGPA"
    text = re.sub(r'\b(?:[A-Za-z]\s){2,}[A-Za-z]\b', lambda m: m.group(0).replace(" ", ""), text)

    # Handle lines and merge them better, avoiding collapsing useful content
    lines = text.splitlines()
    merged_lines, buffer = [], []

    for line in lines:
        stripped = line.strip().replace("•", "").replace("●", "")
        if not stripped:
            continue
        if len(stripped) == 1: 
            buffer.append(stripped)
        else:
            if buffer:
                merged_lines.append("".join(buffer))
                buffer = []
            merged_lines.append(stripped)

    if buffer:
        merged_lines.append("".join(buffer))

    text = " ".join(merged_lines)

    # Fix phone numbers with spaces (e.g. "8 0 7 4 1 5 8 9 8 5")
    text = re.sub(r"(?:\d\s+){5,}\d", lambda m: m.group(0).replace(" ", ""), text)

    # Normalize CGPA/GPA and remove unwanted space between values
    text = re.sub(r"C\s*G\s*P\s*A", "CGPA", text, flags=re.I)
    text = re.sub(r"G\s*P\s*A", "GPA", text, flags=re.I)
    text = re.sub(
        r"(CGPA|GPA)\s*[:\-\s]*([0-9\s\.]+/[0-9\s\.]+)",
        lambda m: f"{m.group(1).upper()}: {m.group(2).replace(' ', '')}",
        text,
        flags=re.I,
    )

    # Fix dates like "A u g 2 0 2 0" -> "Aug 2020"
    text = re.sub(
        r"([A-Za-z]{3,9})\s*([0-9]{4})",
        lambda m: f"{m.group(1)} {m.group(2)}",
        text
    )

    text = re.sub(r"\s{2,}", " ", text).strip()
    text = re.sub(r'\b(?:[A-Za-z]\s){2,}[A-Za-z]\b', lambda m: m.group(0).replace(" ", ""), text)
    
    return text




async def extract_text(file_path: str, mime_type: str) -> str:
    """
    Extract raw text from PDF or DOCX and clean it.
    """
    mime_type = (mime_type or "").lower()
    text = ""

    if "pdf" in mime_type or file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        text = "\n".join([page.extract_text() or "" for page in reader.pages])

    elif ("word" in mime_type
          or "officedocument" in mime_type
          or file_path.endswith(".docx")):
        text = docx2txt.process(file_path)

    elif mime_type == "application/octet-stream":
        if file_path.endswith(".pdf"):
            reader = PdfReader(file_path)
            text = "\n".join([page.extract_text() or "" for page in reader.pages])
        elif file_path.endswith(".docx"):
            text = docx2txt.process(file_path)
    else:
        raise ValueError(f"Unsupported file type: {mime_type}, path: {file_path}")

    return clean_extracted_text(text)
