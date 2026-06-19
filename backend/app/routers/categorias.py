import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.auth import exigir_admin
from app.models.orm import Categoria as CategoriaORM
from app.models.schemas import CategoriaInput, CategoriaOut, MensagemOut
from app.services.cache import cache_get, cache_invalidate, cache_set

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/categorias", tags=["Categorias"])

NS = "categorias"


# ── GET /categorias ──────────────────────────────────────────────────────────

@router.get("", response_model=List[CategoriaOut])
async def listar_categorias(db: AsyncSession = Depends(get_db)) -> List[CategoriaOut]:
    cached = cache_get(NS, "all")
    if cached is not None:
        return cached

    result = await db.execute(select(CategoriaORM).order_by(CategoriaORM.id))
    rows = result.scalars().all()
    data = [CategoriaOut.model_validate(r) for r in rows]
    cache_set(NS, "all", data)
    return data


# ── POST /categorias ─────────────────────────────────────────────────────────

@router.post("", response_model=CategoriaOut, status_code=201)
async def criar_categoria(
    dados: CategoriaInput,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(exigir_admin),
) -> CategoriaOut:
    nova = CategoriaORM(**dados.model_dump())
    db.add(nova)
    await db.commit()
    await db.refresh(nova)
    cache_invalidate(NS)
    logger.info("Categoria criada: id=%s nome=%s", nova.id, nova.nome)
    return CategoriaOut.model_validate(nova)


# ── PUT /categorias/{id} ─────────────────────────────────────────────────────

@router.put("/{categoria_id}", response_model=CategoriaOut)
async def atualizar_categoria(
    categoria_id: int,
    dados: CategoriaInput,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(exigir_admin),
) -> CategoriaOut:
    result = await db.execute(select(CategoriaORM).where(CategoriaORM.id == categoria_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")

    for campo, valor in dados.model_dump().items():
        setattr(row, campo, valor)

    await db.commit()
    await db.refresh(row)
    cache_invalidate(NS)
    logger.info("Categoria atualizada: id=%s", categoria_id)
    return CategoriaOut.model_validate(row)


# ── DELETE /categorias/{id} ──────────────────────────────────────────────────

@router.delete("/{categoria_id}", response_model=MensagemOut)
async def deletar_categoria(
    categoria_id: int, db: AsyncSession = Depends(get_db), _: str = Depends(exigir_admin)
) -> MensagemOut:
    result = await db.execute(select(CategoriaORM).where(CategoriaORM.id == categoria_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")

    await db.delete(row)
    await db.commit()
    cache_invalidate(NS)
    logger.info("Categoria deletada: id=%s", categoria_id)
    return MensagemOut(ok=True, mensagem=f"Categoria {categoria_id} removida.")
