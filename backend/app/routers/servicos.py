import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.orm import Servico as ServicORM
from app.models.schemas import ServicoInput, ServicoOut, MensagemOut
from app.services.cache import cache_get, cache_invalidate, cache_set

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/servicos", tags=["Serviços"])

NS = "servicos"


@router.get("", response_model=List[ServicoOut])
async def listar_servicos(db: AsyncSession = Depends(get_db)) -> List[ServicoOut]:
    cached = cache_get(NS, "all")
    if cached is not None:
        return cached

    result = await db.execute(select(ServicORM).order_by(ServicORM.sort, ServicORM.id))
    rows = result.scalars().all()
    data = [ServicoOut.model_validate(r) for r in rows]
    cache_set(NS, "all", data)
    return data


@router.get("/{servico_id}", response_model=ServicoOut)
async def detalhe_servico(
    servico_id: int, db: AsyncSession = Depends(get_db)
) -> ServicoOut:
    result = await db.execute(select(ServicORM).where(ServicORM.id == servico_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")
    return ServicoOut.model_validate(row)


@router.post("", response_model=ServicoOut, status_code=201)
async def criar_servico(
    dados: ServicoInput, db: AsyncSession = Depends(get_db)
) -> ServicoOut:
    novo = ServicORM(**dados.model_dump())
    db.add(novo)
    await db.commit()
    await db.refresh(novo)
    cache_invalidate(NS)
    logger.info("Serviço criado: id=%s titulo=%s", novo.id, novo.titulo)
    return ServicoOut.model_validate(novo)


@router.put("/{servico_id}", response_model=ServicoOut)
async def atualizar_servico(
    servico_id: int, dados: ServicoInput, db: AsyncSession = Depends(get_db)
) -> ServicoOut:
    result = await db.execute(select(ServicORM).where(ServicORM.id == servico_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")

    for campo, valor in dados.model_dump().items():
        setattr(row, campo, valor)

    await db.commit()
    await db.refresh(row)
    cache_invalidate(NS)
    return ServicoOut.model_validate(row)


@router.delete("/{servico_id}", response_model=MensagemOut)
async def deletar_servico(
    servico_id: int, db: AsyncSession = Depends(get_db)
) -> MensagemOut:
    result = await db.execute(select(ServicORM).where(ServicORM.id == servico_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")

    await db.delete(row)
    await db.commit()
    cache_invalidate(NS)
    return MensagemOut(ok=True, mensagem=f"Serviço {servico_id} removido.")
