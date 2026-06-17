import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.orm import Case as CaseORM
from app.models.schemas import CaseInput, CaseOut, MensagemOut
from app.services.cache import cache_get, cache_invalidate, cache_set

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cases", tags=["Cases"])

NS = "cases"


# ── GET /cases ────────────────────────────────────────────────────────────────

@router.get("", response_model=List[CaseOut])
async def listar_cases(db: AsyncSession = Depends(get_db)) -> List[CaseOut]:
    cached = cache_get(NS, "all")
    if cached is not None:
        return cached

    result = await db.execute(select(CaseORM).order_by(CaseORM.sort, CaseORM.id))
    rows = result.scalars().all()
    data = [CaseOut.model_validate(r) for r in rows]
    cache_set(NS, "all", data)
    return data


# ── GET /cases/{id} ───────────────────────────────────────────────────────────

@router.get("/{case_id}", response_model=CaseOut)
async def detalhe_case(case_id: int, db: AsyncSession = Depends(get_db)) -> CaseOut:
    chave = f"id:{case_id}"
    cached = cache_get(NS, chave)
    if cached is not None:
        return cached

    result = await db.execute(select(CaseORM).where(CaseORM.id == case_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Case não encontrado.")

    data = CaseOut.model_validate(row)
    cache_set(NS, chave, data)
    return data


# ── POST /cases ───────────────────────────────────────────────────────────────

@router.post("", response_model=CaseOut, status_code=201)
async def criar_case(dados: CaseInput, db: AsyncSession = Depends(get_db)) -> CaseOut:
    novo = CaseORM(**dados.model_dump())
    db.add(novo)
    await db.commit()
    await db.refresh(novo)
    cache_invalidate(NS)
    logger.info("Case criado: id=%s nome=%s", novo.id, novo.nome)
    return CaseOut.model_validate(novo)


# ── PUT /cases/{id} ───────────────────────────────────────────────────────────

@router.put("/{case_id}", response_model=CaseOut)
async def atualizar_case(
    case_id: int, dados: CaseInput, db: AsyncSession = Depends(get_db)
) -> CaseOut:
    result = await db.execute(select(CaseORM).where(CaseORM.id == case_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Case não encontrado.")

    for campo, valor in dados.model_dump().items():
        setattr(row, campo, valor)

    await db.commit()
    await db.refresh(row)
    cache_invalidate(NS)
    logger.info("Case atualizado: id=%s", case_id)
    return CaseOut.model_validate(row)


# ── DELETE /cases/{id} ────────────────────────────────────────────────────────

@router.delete("/{case_id}", response_model=MensagemOut)
async def deletar_case(
    case_id: int, db: AsyncSession = Depends(get_db)
) -> MensagemOut:
    result = await db.execute(select(CaseORM).where(CaseORM.id == case_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Case não encontrado.")

    await db.delete(row)
    await db.commit()
    cache_invalidate(NS)
    logger.info("Case deletado: id=%s", case_id)
    return MensagemOut(ok=True, mensagem=f"Case {case_id} removido.")