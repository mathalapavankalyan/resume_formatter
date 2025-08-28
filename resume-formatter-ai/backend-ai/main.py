# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import AsyncOpenAI
from routers import resume, saved
import logging
import os

load_dotenv()
logger = logging.getLogger(__name__)

app = FastAPI(title="Resume Formatter AI Service")

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared OpenAI client on app.state
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logger.warning("OPENAI_API_KEY is not set; formatting may fail when calling OpenAI.")

app.state.openai_client = AsyncOpenAI(api_key=api_key) if api_key else None

# Optional save location exposed on app.state
app.state.allowed_save_root = os.getenv("ALLOWED_SAVE_ROOT", "./saved_resumes")

# Routers
app.include_router(resume.router, prefix="/api", tags=["resume"])
app.include_router(saved.router,  prefix="/api", tags=["saved"])
