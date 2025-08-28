import os, json, re
from openai import AsyncOpenAI

# Regex to detect valid emails
_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

def _clean_email(addr: str) -> str:
    """
    Normalize email addresses, stripping accidental prefixes (e.g., 'pe').
    Returns the first valid-looking email if multiple are found.
    """
    if not addr:
        return ""
    addr = addr.strip()

    # Find all valid-looking emails in the string
    matches = _EMAIL_RE.findall(addr)
    if matches:
        # If multiple candidates, prefer the one with the shortest prefix (cleaner)
        return sorted(matches, key=len)[0]
    return addr

def _best_email_from_text(text: str, parsed_email: str | None = None) -> str:
    """
    Use the parsed email if valid; otherwise scan the raw text for a better candidate.
    """
    # If parser returned a valid email, trust it (after cleaning)
    if parsed_email:
        cleaned = _clean_email(parsed_email)
        if _EMAIL_RE.fullmatch(cleaned):
            return cleaned

    # Otherwise, scan the text
    candidates = _EMAIL_RE.findall(text or "")
    if not candidates:
        return parsed_email or ""

    # Prefer gmail/outlook/yahoo addresses, then shortest clean string
    def score(addr: str) -> tuple:
        a = addr.lower()
        pref = 1 if any(d in a for d in ["gmail.com", "outlook.", "yahoo."]) else 0
        return (pref, -len(a))  # prefer known domains, then shorter

    return sorted(candidates, key=score, reverse=True)[0]


async def parse_resume(text: str, client: AsyncOpenAI) -> dict:
    prompt = f"""
Extract the following fields from this resume and return valid JSON only.
If a field is not present, return it as an empty list or empty string, do not omit it.

Fields:
- name
- email
- phone
- summary
- skills (list)
- experience (list of objects: title, company, dates, bullets, location optional, impact optional)
- education (list of objects: school, degree, dates, location optional, details optional)
- projects (list of objects: name, dates, description optional, bullets optional)
- achievements (list of strings)
- certifications (list of objects: name, authority optional, date optional)
- awards (list of objects: title, issuer optional, date optional)
- publications (list of objects: title, publisher optional, date optional)
- languages (list of strings)
- hobbies (list of strings)

Resume text:
{text}
"""
    resp = await client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    raw = resp.choices[0].message.content

    try:
        data = json.loads(raw)
    except Exception:
        return {"raw": raw, "error": "JSON parse failed"}

    return data
