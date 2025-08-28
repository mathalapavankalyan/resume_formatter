# routers/resume.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
import tempfile, os, logging

from openai import AsyncOpenAI
from utils import text_extractor
from services import resume_parser, jd_parser

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/parse")
async def parse_resume_and_jd(
    request: Request,
    resume: UploadFile = File(...),
    jd_text: str = Form(...),
    prompt: str = Form(None),
):
    tmp_path = None
    try:
        client: AsyncOpenAI = request.app.state.openai_client
        if not client:
            raise HTTPException(status_code=500, detail="OpenAI client not configured")

        # Save resume to temp
        orig_filename = resume.filename or "resume"
        orig_root, orig_ext = os.path.splitext(orig_filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix=orig_ext or ".docx") as tmp:
            tmp.write(await resume.read())
            tmp_path = tmp.name

        # Extract text & parse resume
        text = await text_extractor.extract_text(tmp_path, resume.content_type)
        parsed_resume = await resume_parser.parse_resume(text, client)

        # Merge tailoring prompt into JD text if provided
        effective_jd_text = jd_text.strip()
        if prompt and prompt.strip():
            effective_jd_text += f"\n\n[TAILORING_INSTRUCTIONS]\n{prompt.strip()}"

        parsed_jd = await jd_parser.parse_jd(effective_jd_text, client)

        # Return structured JSON for frontend templates
        return {
            "resume": parsed_resume,
            "job": parsed_jd,
            "meta": {
                "filename": orig_filename,
                "has_prompt": bool(prompt and prompt.strip()),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error parsing resume/JD")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                logger.warning("Failed to remove temp file: %s", tmp_path)
