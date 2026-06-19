import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import exigir_admin
from app.models.orm import Servico as ServicoORM
from app.models.schemas import MensagemOut, ServicoInput, ServicoOut
from app.services.cache import cache_get, cache_invalidate, cache_set

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/servicos", tags=["Serviços"])

NS = "servicos"


@router.get("", response_model=List[ServicoOut])
async def listar_servicos(db: AsyncSession = Depends(get_db)) -> List[ServicoOut]:
    """GET público — alimenta o site."""
    cached = cache_get(NS, "all")
    if cached is not None:
        return cached

    result = await db.execute(select(ServicoORM).order_by(ServicoORM.sort, ServicoORM.id))
    rows = result.scalars().all()
    data = [ServicoOut.model_validate(r) for r in rows]
    cache_set(NS, "all", data)
    return data


@router.get("/{servico_id}", response_model=ServicoOut)
async def detalhe_servico(servico_id: int, db: AsyncSession = Depends(get_db)) -> ServicoOut:
    """GET público."""
    result = await db.execute(select(ServicoORM).where(ServicoORM.id == servico_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")
    return ServicoOut.model_validate(row)


@router.post("", response_model=ServicoOut, status_code=201)
async def criar_servico(
    dados: ServicoInput,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(exigir_admin),
) -> ServicoOut:
    novo = ServicoORM(**dados.model_dump())
    db.add(novo)
    await db.commit()
    await db.refresh(novo)
    cache_invalidate(NS)
    logger.info("Serviço criado: id=%s titulo=%s", novo.id, novo.titulo)
    return ServicoOut.model_validate(novo)


@router.put("/{servico_id}", response_model=ServicoOut)
async def atualizar_servico(
    servico_id: int,
    dados: ServicoInput,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(exigir_admin),
) -> ServicoOut:
    result = await db.execute(select(ServicoORM).where(ServicoORM.id == servico_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")

    for campo, valor in dados.model_dump().items():
        setattr(row, campo, valor)

    await db.commit()
    await db.refresh(row)
    cache_invalidate(NS)
    logger.info("Serviço atualizado: id=%s", servico_id)
    return ServicoOut.model_validate(row)


@router.delete("/{servico_id}", response_model=MensagemOut)
async def deletar_servico(
    servico_id: int,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(exigir_admin),
) -> MensagemOut:
    result = await db.execute(select(ServicoORM).where(ServicoORM.id == servico_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")

    await db.delete(row)
    await db.commit()
    cache_invalidate(NS)
    logger.info("Serviço deletado: id=%s", servico_id)
    return MensagemOut(ok=True, mensagem=f"Serviço {servico_id} removido.")
