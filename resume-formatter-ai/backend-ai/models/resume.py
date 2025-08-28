from pydantic import BaseModel
from typing import List, Optional

class Experience(BaseModel):
    title: Optional[str]
    company: Optional[str]
    dates: Optional[str]
    bullets: List[str] = []

class Education(BaseModel):
    school: Optional[str]
    degree: Optional[str]
    dates: Optional[str]

class ParsedResume(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    summary: Optional[str]
    skills: List[str] = []
    experience: List[Experience] = []
    education: List[Education] = []
    raw_text: str = ""
