import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.auth import exigir_admin
from app.models.orm import Config
from app.models.schemas import ConfigOut, ConfigSchema

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/config", tags=["Config"])


@router.get("", response_model=ConfigOut)
async def obter(db: AsyncSession = Depends(get_db)):
    """GET é público — alimenta o site."""
    result = await db.execute(select(Config).where(Config.id == 1))
    return result.scalar_one_or_none()


@router.put("", response_model=ConfigOut)
async def atualizar(
    data: ConfigSchema,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(exigir_admin),
):
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
    logger.info("Config atualizada.")
    return c
