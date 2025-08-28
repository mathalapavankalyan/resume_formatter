from pydantic import BaseModel
from typing import List, Optional

class ParsedJD(BaseModel):
    title: Optional[str]
    company: Optional[str]
    skills_required: List[str] = []
    nice_to_have: List[str] = []
    raw_text: str = ""
