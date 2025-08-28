import pypandoc, tempfile, os
try:
    from docx2pdf import convert as docx2pdf_convert
    HAS_DOCX2PDF = True
except ImportError:
    HAS_DOCX2PDF = False

try:
    pypandoc.get_pandoc_path()
except OSError:
    try:
        pypandoc.download_pandoc()
    except Exception:
        pass

async def convert_to_pdf(docx_bytes: bytes) -> bytes:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_docx:
        tmp_docx.write(docx_bytes)
        tmp_docx_path = tmp_docx.name
    tmp_pdf_path = tmp_docx_path.replace(".docx", ".pdf")
    try:
        try:
            pypandoc.convert_file(tmp_docx_path, "pdf", outputfile=tmp_pdf_path)
            with open(tmp_pdf_path, "rb") as f:
                return f.read()
        except Exception:
            if HAS_DOCX2PDF:
                try:
                    docx2pdf_convert(tmp_docx_path, tmp_pdf_path)
                    with open(tmp_pdf_path, "rb") as f:
                        return f.read()
                except Exception:
                    pass
            # final fallback: return original docx if pdf conversion fails
            with open(tmp_docx_path, "rb") as f:
                return f.read()
    finally:
        if os.path.exists(tmp_docx_path): os.remove(tmp_docx_path)
        if os.path.exists(tmp_pdf_path):  os.remove(tmp_pdf_path)
