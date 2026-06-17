from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.orm import Horario
from app.models.schemas import HorarioSchema

router = APIRouter(prefix="/agenda", tags=["agenda"])

@router.get("/")
async def listar(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Horario).order_by(Horario.data, Horario.hora))
    return result.scalars().all()

@router.post("/")
async def criar(data: HorarioSchema, db: AsyncSession = Depends(get_db)):
    h = Horario(**data.model_dump())
    db.add(h)
    await db.commit()
    await db.refresh(h)
    return h

@router.put("/{id}")
async def atualizar(id: int, data: HorarioSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Horario).where(Horario.id == id))
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(status_code=404, detail="Não encontrado")
    for k, v in data.model_dump().items():
        setattr(h, k, v)
    await db.commit()
    await db.refresh(h)
    return h

@router.delete("/{id}")
async def deletar(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Horario).where(Horario.id == id))
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(status_code=404, detail="Não encontrado")
    await db.delete(h)
    await db.commit()
    return {"ok": True}