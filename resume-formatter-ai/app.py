import os
import re
import requests
import streamlit as st

API_URL = os.getenv("API_URL", "http://localhost:8000/api/format")

STYLE_CHOICES = {
    "Overleaf — Single Page (ATS)": "overleaf_single",
    "Word — Classic (DOCX/PDF)": "docx_default",
}

STYLE_HELP = {
    "Overleaf — Single Page (ATS)": "Single-page, ATS-friendly PDF (or .tex if local LaTeX compiler is not available).",
    "Word — Classic (DOCX/PDF)": "Generate a Word document or PDF with tailored content.",
}

st.set_page_config(page_title="AI Resume Formatter", layout="centered")
st.title("AI Resume Formatter")
st.caption("Tailor your resume to a job description with an ATS-friendly, professional template.")

left, right = st.columns([1, 1])

with left:
    resume_file = st.file_uploader("Resume Upload (PDF/DOCX)", type=["pdf", "docx"])

with right:
    jd_text = st.text_area("Job Description", height=220, placeholder="Paste the target JD here...")

style_display = st.selectbox("Resume Template Style", options=list(STYLE_CHOICES.keys()))
style = STYLE_CHOICES[style_display]
if STYLE_HELP.get(style_display):
    st.caption(STYLE_HELP[style_display])

format_choice = None
if style == "docx_default":
    format_choice = st.radio("Output Format", ["docx", "pdf"], horizontal=True)
else:
    st.caption("Output will be PDF if available; otherwise you receive a .tex file ready for Overleaf.")

# Helpers
def _filename_from_headers(headers: dict, fallback: str) -> str:
    cd = headers.get("Content-Disposition", "")
    m = re.search(r'filename="([^"]+)"', cd)
    return m.group(1) if m else fallback

def _ext_from_media_type(mt: str) -> str:
    if mt == "application/pdf": return ".pdf"
    if mt == "application/x-tex": return ".tex"
    if mt == "application/vnd.openxmlformats-officedocument.wordprocessingml.document": return ".docx"
    return ""

# Session state for post-form rendering
if "last_file_bytes" not in st.session_state:
    st.session_state.last_file_bytes = None
    st.session_state.last_file_name = None
    st.session_state.last_error = None
    st.session_state.last_success = False

with st.form("resume_form", clear_on_submit=False):
    submitted = st.form_submit_button("Generate Resume")
    if submitted:
        st.session_state.last_file_bytes = None
        st.session_state.last_file_name = None
        st.session_state.last_error = None
        st.session_state.last_success = False

        if not resume_file or not jd_text.strip():
            st.session_state.last_error = "Please upload a resume and provide a job description."
        else:
            try:
                files = {"resume": (resume_file.name, resume_file, "application/octet-stream")}
                data = {"jd_text": jd_text, "style": style}
                if style == "docx_default" and format_choice:
                    data["format"] = format_choice

                resp = requests.post(API_URL, files=files, data=data, timeout=300)

                if resp.status_code == 200:
                    media_type = resp.headers.get("Content-Type", "application/octet-stream")
                    default_base = "resume"
                    default_ext = _ext_from_media_type(media_type) or (f".{format_choice}" if format_choice else ".pdf")
                    fallback_name = default_base + default_ext

                    st.session_state.last_file_bytes = resp.content
                    st.session_state.last_file_name = _filename_from_headers(resp.headers, fallback=fallback_name)
                    st.session_state.last_success = True
                else:
                    st.session_state.last_error = f"Error {resp.status_code}: {resp.text}"

            except requests.exceptions.ConnectionError:
                st.session_state.last_error = "Could not connect to the API. Is the FastAPI server running?"
            except requests.exceptions.Timeout:
                st.session_state.last_error = "The request timed out. Try again or reduce input size."
            except Exception as e:
                st.session_state.last_error = f"Unexpected error: {e}"

# Results (outside the form)
if st.session_state.last_success and st.session_state.last_file_bytes:
    st.success("Resume generated successfully.")
    st.download_button(
        "Download Resume",
        data=st.session_state.last_file_bytes,
        file_name=st.session_state.last_file_name or "resume.pdf",
    )
elif st.session_state.last_error:
    st.error(st.session_state.last_error)
