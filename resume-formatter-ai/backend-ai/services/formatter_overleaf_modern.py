# services/formatter_overleaf_modern.py
import os, json, re
from typing import List, Tuple, Optional
from openai import AsyncOpenAI
from .latex_renderer import render_tex_or_pdf


def _score_experience(exp: dict, jd_skills: List[str]) -> int:
    s, jd_lower = 0, [x.lower() for x in (jd_skills or [])]
    for field in [exp.get("title",""), exp.get("company",""), exp.get("location","")]:
        fl = str(field).lower()
        s += sum(1 for js in jd_lower if js in fl)
    for b in exp.get("bullets", []) or []:
        bl = str(b).lower()
        s += sum(1 for js in jd_lower if js in bl)
    return s

def _reorder_experience(exps: List[dict], jd_skills: List[str]) -> List[dict]:
    return sorted(exps or [], key=lambda e: _score_experience(e, jd_skills), reverse=True)

def _trim_one_page(education, experience, projects, skills_groups, skills_list, certifications):
    edu = (education or [])[:2]
    ex  = [{**e, "bullets": (e.get("bullets") or [])[:4]} for e in (experience or [])[:3]]
    pr  = [{**p, "bullets": (p.get("bullets") or [])[:3]} for p in (projects or [])[:2]]
    sgroups = (skills_groups or [])[:6]   # cap groups
    slist   = (skills_list or [])[:16]    # cap flat list (fallback)
    certs   = (certifications or [])[:4]
    return edu, ex, pr, sgroups, slist, certs

def _group_skills(skills: list[str]) -> list[dict]:
    """
    Auto-group a flat list of skills into common categories.
    """
    groups = {
        "Frontend": ["html", "css", "javascript", "typescript", "react", "angular", "vue"],
        "Backend": ["java", "python", "go", "c#", "node", "php", "spring", "django", "flask"],
        "Frameworks": ["spring boot", "express", "hibernate", "jpa", "next.js", "fastapi"],
        "Databases": ["mysql", "postgres", "mongodb", "oracle", "sqlite", "redis", "dynamodb"],
        "Tools": ["git", "docker", "kubernetes", "maven", "gradle", "postman", "vscode", "intellij"],
        "Concepts": ["oop", "object-oriented", "microservices", "algorithms", "data structures", "ci/cd", "agile"],
    }

    result = []
    if not skills:
        return result

    for label, keywords in groups.items():
        found = [s for s in skills if any(k in s.lower() for k in keywords)]
        if found:
            result.append({"label": label, "items": found})

    # Leftover uncategorized skills
    categorized = {s for g in result for s in g["items"]}
    leftover = [s for s in skills if s not in categorized]
    if leftover:
        result.append({"label": "Other", "items": leftover})

    return result

# ---------------------- Education detail sanitizers ----------------------

def _normalize_cgpa_gpa_line(s: str) -> str:
    """
    Normalize CGPA/GPA tokens and values, fixing patterns like:
    'C G P A : 8 . 6 / 1 0' -> 'CGPA: 8.6/10'
    Also removes stray bullets/dots and shrinks whitespace.
    """
    if not s:
        return s
    s2 = s.replace("•", " ").replace("●", " ")
    s2 = re.sub(r"\s+", " ", s2).strip()
    # Force tokens CGPA/GPA if spaced out
    s2 = re.sub(r"C\s*G\s*P\s*A", "CGPA", s2, flags=re.I)
    s2 = re.sub(r"G\s*P\s*A", "GPA", s2, flags=re.I)
    # Join digit-by-digit numbers like "8 0 7 4 ..." -> "8074..."
    s2 = re.sub(r"(?:\d\s+){5,}\d", lambda m: m.group(0).replace(" ", ""), s2)
    # Normalize values: "CGPA : 8 . 6 / 1 0" -> "CGPA: 8.6/10"
    s2 = re.sub(
        r"\b(CGPA|GPA)\b\s*[:\-\s]*([0-9\s\.]+/[0-9\s\.]+)",
        lambda m: f"{m.group(1).upper()}: {m.group(2).replace(' ', '')}",
        s2,
        flags=re.I,
    )
    return s2

def _collapse_char_details(details: list[str]) -> list[str]:
    """
    If 'details' is mostly one/two-character fragments (from broken PDF extraction),
    collapse them into a single normalized string; otherwise normalize each line.
    """
    if not details:
        return details
    cleaned = [str(x).strip().replace("•", "").replace("●", "") for x in details if str(x).strip()]
    if not cleaned:
        return []

    short_count = sum(1 for x in cleaned if len(x) <= 2)
    # If the majority are short fragments, join them into one line
    if short_count >= max(3, int(0.6 * len(cleaned))):
        joined = "".join(cleaned)
        joined = _normalize_cgpa_gpa_line(joined)
        return [joined] if joined else []

    # Otherwise, just normalize each detail line
    return [_normalize_cgpa_gpa_line(x) for x in cleaned]

# ------------------------------------------------------------------------

async def build_overleaf_modern(
    resume: dict, jd: dict, client: Optional[AsyncOpenAI]
) -> Tuple[bytes, str, str]:
    jd_skills = jd.get("skills_required", []) or []

    # Normalize inputs
    education    = resume.get("education", [])
    experience   = _reorder_experience(resume.get("experience", []), jd_skills)
    projects     = resume.get("projects", [])
    certifications = resume.get("certifications", [])
    achievements = resume.get("achievements", [])  # rendered by template if present

    # ---- Sanitize education details to fix vertical CGPA/GPA lines ----
    sanitized_education = []
    for e in (education or []):
        e = dict(e or {})
        if isinstance(e.get("details"), list):
            e["details"] = _collapse_char_details(e["details"])
        else:
            # If detail is a single string, at least normalize CGPA/GPA patterns
            if isinstance(e.get("details"), str):
                e["details"] = [_normalize_cgpa_gpa_line(e["details"])]
        # Also normalize dates that might arrive broken like "A u g 2 0 2 0"
        if e.get("dates"):
            e["dates"] = re.sub(
                r"([A-Za-z]{3,9})\s*([0-9]{4})",
                lambda m: f"{m.group(1)} {m.group(2)}",
                str(e["dates"])
            )
        sanitized_education.append(e)

    # Skills
    skills = resume.get("skills", []) or []
    skills_groups = resume.get("skills_groups")
    skills_list   = None

    # If parser didn't already group, auto-group them
    if not skills_groups and skills:
        skills_groups = _group_skills(skills)

    # Trim to fit one page
    edu, ex, pr, sgroups, slist, certs = _trim_one_page(
        sanitized_education, experience, projects, skills_groups, skills_list, certifications
    )

    context = {
        "resume": {
            "name": resume.get("name", "Candidate Name"),
            "email": resume.get("email", ""),
            "phone": resume.get("phone", ""),
            "linkedin": resume.get("linkedin", ""),
            "github": resume.get("github", ""),
            "location": resume.get("location", ""),
        },
        "education": edu,
        "experience": ex,
        "projects": pr,
        "skills_groups": sgroups,
        "skills_list": slist,
        "certifications": certs,
        "achievements": achievements,
    }

    pdf_or_tex, ext = render_tex_or_pdf("resume_modern.tex.j2", context)
    media_type = "application/pdf" if ext == ".pdf" else "application/x-tex"
    return pdf_or_tex, media_type, ext
