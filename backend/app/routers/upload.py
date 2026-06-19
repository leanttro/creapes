"""
app/routers/upload.py
POST /upload — recebe um arquivo via multipart/form-data,
salva em backend/uploads/ com nome único (uuid) e retorna a URL pública.
Requer autenticação de admin.
"""

import logging
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.dependencies.auth import exigir_admin
from app.models.schemas import UploadOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

EXTENSOES_PERMITIDAS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
    ".mp4", ".mov", ".pdf",
}

MAX_SIZE_MB = 50


@router.post("", response_model=UploadOut)
async def upload_arquivo(
    file: UploadFile = File(...),
    _: str = Depends(exigir_admin),
) -> UploadOut:
    sufixo = Path(file.filename or "").suffix.lower()
    if sufixo not in EXTENSOES_PERMITIDAS:
        raise HTTPException(
            status_code=415,
            detail=f"Tipo de arquivo não permitido: '{sufixo}'. "
                   f"Permitidos: {sorted(EXTENSOES_PERMITIDAS)}",
        )

    conteudo = await file.read()
    tamanho_mb = len(conteudo) / (1024 * 1024)
    if tamanho_mb > MAX_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"Arquivo muito grande ({tamanho_mb:.1f} MB). Máximo: {MAX_SIZE_MB} MB.",
        )

    nome_unico = f"{uuid.uuid4().hex}{sufixo}"
    caminho = UPLOAD_DIR / nome_unico

    with open(caminho, "wb") as f:
        f.write(conteudo)

    logger.info("Upload salvo: %s (%.2f MB) → %s", file.filename, tamanho_mb, caminho)

    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    url_publica = f"{base_url}/uploads/{nome_unico}"

    return UploadOut(url=url_publica, filename=nome_unico)


@router.get("/{filename}")
async def servir_arquivo(filename: str):
    """GET público — serve os arquivos (imagens do site)."""
    caminho = UPLOAD_DIR / filename
    if not caminho.exists() or not caminho.is_file():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    if not str(caminho.resolve()).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Caminho inválido.")
    return FileResponse(caminho)
