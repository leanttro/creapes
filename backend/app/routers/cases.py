import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.auth import exigir_admin
from app.models.orm import Case as CaseORM, Categoria as CategoriaORM
from app.models.schemas import CaseInput, CaseOut, MensagemOut
from app.services.cache import cache_get, cache_invalidate, cache_set

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cases", tags=["Cases"])

NS = "cases"


def _montar_case_out(case_row: CaseORM, nome_categoria: str | None) -> CaseOut:
    """Monta o CaseOut a partir da linha do Case + nome da categoria (já buscado via join)."""
    data = CaseOut.model_validate(case_row)
    data.categoria_nome = nome_categoria
    return data


# ── GET /cases ────────────────────────────────────────────────────────────────

@router.get("", response_model=List[CaseOut])
async def listar_cases(db: AsyncSession = Depends(get_db)) -> List[CaseOut]:
    cached = cache_get(NS, "all")
    if cached is not None:
        return cached

    # LEFT JOIN com categorias para trazer o nome junto
    result = await db.execute(
        select(CaseORM, CategoriaORM.nome)
        .outerjoin(CategoriaORM, CaseORM.categoria_id == CategoriaORM.id)
        .order_by(CaseORM.sort, CaseORM.id)
    )
    rows = result.all()  # lista de tuplas (CaseORM, nome_categoria)

    data = [_montar_case_out(case, nome_cat) for case, nome_cat in rows]
    cache_set(NS, "all", data)
    return data


# ── GET /cases/{id} ───────────────────────────────────────────────────────────

@router.get("/{case_id}", response_model=CaseOut)
async def detalhe_case(case_id: int, db: AsyncSession = Depends(get_db)) -> CaseOut:
    chave = f"id:{case_id}"
    cached = cache_get(NS, chave)
    if cached is not None:
        return cached

    result = await db.execute(
        select(CaseORM, CategoriaORM.nome)
        .outerjoin(CategoriaORM, CaseORM.categoria_id == CategoriaORM.id)
        .where(CaseORM.id == case_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Case não encontrado.")

    case, nome_cat = row
    data = _montar_case_out(case, nome_cat)
    cache_set(NS, chave, data)
    return data


# ── POST /cases ───────────────────────────────────────────────────────────────

@router.post("", response_model=CaseOut, status_code=201)
async def criar_case(
    dados: CaseInput, db: AsyncSession = Depends(get_db), _: str = Depends(exigir_admin)
) -> CaseOut:
    novo = CaseORM(**dados.model_dump())
    db.add(novo)
    await db.commit()
    await db.refresh(novo)
    cache_invalidate(NS)
    logger.info("Case criado: id=%s nome=%s", novo.id, novo.nome)

    nome_cat = None
    if novo.categoria_id:
        cat_result = await db.execute(
            select(CategoriaORM.nome).where(CategoriaORM.id == novo.categoria_id)
        )
        nome_cat = cat_result.scalar_one_or_none()

    return _montar_case_out(novo, nome_cat)


# ── PUT /cases/{id} ───────────────────────────────────────────────────────────

@router.put("/{case_id}", response_model=CaseOut)
async def atualizar_case(
    case_id: int,
    dados: CaseInput,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(exigir_admin),
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

    nome_cat = None
    if row.categoria_id:
        cat_result = await db.execute(
            select(CategoriaORM.nome).where(CategoriaORM.id == row.categoria_id)
        )
        nome_cat = cat_result.scalar_one_or_none()

    return _montar_case_out(row, nome_cat)


# ── DELETE /cases/{id} ────────────────────────────────────────────────────────

@router.delete("/{case_id}", response_model=MensagemOut)
async def deletar_case(
    case_id: int, db: AsyncSession = Depends(get_db), _: str = Depends(exigir_admin)
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
