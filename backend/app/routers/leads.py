import logging
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.orm import Lead as LeadORM
from app.models.schemas import LeadOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.get("", response_model=List[LeadOut])
async def listar_leads(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> List[LeadOut]:
    result = await db.execute(
        select(LeadORM)
        .order_by(LeadORM.criado_em.desc())
        .offset(skip)
        .limit(limit)
    )
    rows = result.scalars().all()
    return [LeadOut.model_validate(r) for r in rows]