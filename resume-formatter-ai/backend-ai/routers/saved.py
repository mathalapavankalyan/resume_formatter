from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from typing import Optional, List
import os
import math
import mimetypes
from datetime import datetime

router = APIRouter()

def _root(request: Request) -> Path:
    return Path(getattr(request.app.state, "allowed_save_root", "./saved_resumes")).resolve()

def _safe_resolve(request: Request, subpath: Optional[str]) -> Path:
    base = _root(request)
    target = (base / (subpath or "")).resolve()
    # prevent path traversal
    if base not in target.parents and target != base:
        raise HTTPException(status_code=400, detail="Invalid path.")
    return target

def _fmt_size(bytes_: int) -> str:
    if bytes_ <= 0: return "0 B"
    units = ["B","KB","MB","GB","TB"]
    i = int(math.floor(math.log(bytes_, 1024)))
    p = math.pow(1024, i)
    s = round(bytes_ / p, 2)
    return f"{s} {units[i]}"

def _file_info(p: Path, base: Path, request: Request) -> dict:
    stat = p.stat()
    rel_path = str(p.relative_to(base)).replace("\\", "/")
    return {
        "name": p.name,
        "path": rel_path,
        "size_bytes": stat.st_size,
        "size": _fmt_size(stat.st_size),
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "is_dir": p.is_dir(),
        "download_url": f"/api/saved/download?path={rel_path}" if p.is_file() else None,
    }

@router.get("/saved")
async def list_saved(
    request: Request,
    subdir: Optional[str] = Query(None, description="Subdirectory under ALLOWED_SAVE_ROOT"),
    pattern: Optional[str] = Query(None, description="Optional filename contains filter"),
    include_dirs: bool = Query(False, description="Include directories in listing"),
):
    """
    List files saved under ALLOWED_SAVE_ROOT (optionally in a subdirectory).
    """
    base = _root(request)
    target = _safe_resolve(request, subdir)
    if not target.exists():
        return {"root": str(base), "items": []}

    items: List[dict] = []
    for entry in target.iterdir():
        if entry.is_dir() and not include_dirs:
            continue
        if pattern and pattern.lower() not in entry.name.lower():
            continue
        items.append(_file_info(entry, base, request))

    # Sort: directories first, then files by modified desc
    items.sort(key=lambda x: (not x["is_dir"], x["modified"]), reverse=True)
    return {"root": str(base), "dir": str(target), "items": items}

@router.get("/saved/download")
async def download_saved(request: Request, path: str = Query(..., description="Path relative to ALLOWED_SAVE_ROOT")):
    """
    Download a single saved file (must be within ALLOWED_SAVE_ROOT).
    """
    base = _root(request)
    target = _safe_resolve(request, path)
    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="File not found.")

    media_type, _ = mimetypes.guess_type(target.name)
    headers = {"Content-Disposition": f'attachment; filename="{target.name}"'}
    return FileResponse(path=str(target), media_type=media_type or "application/octet-stream", headers=headers)

@router.delete("/saved")
async def delete_saved(request: Request, path: str = Query(..., description="File path relative to ALLOWED_SAVE_ROOT")):
    """
    Delete a single saved file (optional feature).
    """
    target = _safe_resolve(request, path)
    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="File not found.")
    try:
        target.unlink()
        return JSONResponse({"deleted": path})
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied.")
