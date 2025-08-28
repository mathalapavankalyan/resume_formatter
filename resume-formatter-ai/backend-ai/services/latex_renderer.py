# services/latex_renderer.py
import os, shutil, subprocess, tempfile
from typing import Tuple
from jinja2 import Environment, FileSystemLoader, select_autoescape

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

def _render_template(template_name: str, context: dict) -> bytes:
    env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIR),
        autoescape=select_autoescape(enabled_extensions=(), default_for_string=False),
        trim_blocks=True, lstrip_blocks=True,
    )
    return env.get_template(template_name).render(**context).encode("utf-8")

def _tectonic_available() -> bool:
    return shutil.which("tectonic") is not None

# NEW: public helper used by the router
def tectonic_available() -> bool:
    return _tectonic_available()

def render_tex_or_pdf(template_name: str, context: dict) -> Tuple[bytes, str]:
    """
    Returns (bytes, ext) where ext is '.pdf' if Tectonic is available and compilation succeeds,
    otherwise '.tex' (so you can open on Overleaf).
    """
    tex_bytes = _render_template(template_name, context)
    if not _tectonic_available():
        return tex_bytes, ".tex"

    with tempfile.TemporaryDirectory() as workdir:
        tex_path = os.path.join(workdir, "resume.tex")
        pdf_path = os.path.join(workdir, "resume.pdf")
        with open(tex_path, "wb") as f:
            f.write(tex_bytes)

        proc = subprocess.run(
            ["tectonic", "-X", "compile", tex_path, "--outdir", workdir, "--keep-logs"],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, cwd=workdir
        )
        if proc.returncode != 0 or not os.path.exists(pdf_path):
            return tex_bytes, ".tex"

        with open(pdf_path, "rb") as f:
            return f.read(), ".pdf"
