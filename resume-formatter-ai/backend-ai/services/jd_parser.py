import os, json
from openai import AsyncOpenAI

async def parse_jd(text: str, client: AsyncOpenAI) -> dict:
    prompt = f"""
Extract the following fields from this Job Description and return valid JSON only.
If a field is not present, return an empty string or empty list (do not omit).

Fields:
- title
- company
- skills_required (list of strings)
- nice_to_have (list of strings)
- projects (list of objects: name, dates optional, description optional, bullets optional, tech optional)
- achievements (list of strings)
- certifications (list of objects: name, authority optional, date optional)
- awards (list of objects: title, issuer optional, date optional)
- publications (list of objects: title, publisher optional, date optional)
- languages (list of strings)
- hobbies (list of strings)

Job description:
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

    # Ensure all fields exist (fallbacks if model omits them)
    data.setdefault("title", "")
    data.setdefault("company", "")
    data.setdefault("skills_required", [])
    data.setdefault("nice_to_have", [])
    data.setdefault("projects", [])
    data.setdefault("achievements", [])
    data.setdefault("certifications", [])
    data.setdefault("awards", [])
    data.setdefault("publications", [])
    data.setdefault("languages", [])
    data.setdefault("hobbies", [])

    return data
