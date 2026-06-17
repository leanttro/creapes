from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.orm import Config
from app.models.schemas import ConfigSchema

router = APIRouter(prefix="/config", tags=["config"])

@router.get("")
async def obter(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Config).where(Config.id == 1))
    return result.scalar_one_or_none()

@router.put("")
async def atualizar(data: ConfigSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Config).where(Config.id == 1))
    c = result.scalar_one_or_none()
    if not c:
        c = Config(id=1, **data.model_dump())
        db.add(c)
    else:
        for k, v in data.model_dump().items():
            setattr(c, k, v)
    await db.commit()
    await db.refresh(c)
    return c
