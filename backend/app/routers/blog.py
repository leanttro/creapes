import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.orm import BlogPost as BlogPostORM
from app.models.schemas import BlogPostInput, BlogPostOut, MensagemOut
from app.services.cache import cache_get, cache_invalidate, cache_set

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/blog", tags=["Blog"])

NS = "blog"


# ── GET /blog ─────────────────────────────────────────────────────────────────

@router.get("", response_model=List[BlogPostOut])
async def listar_posts(db: AsyncSession = Depends(get_db)) -> List[BlogPostOut]:
    cached = cache_get(NS, "all")
    if cached is not None:
        return cached

    result = await db.execute(
        select(BlogPostORM)
        .where(BlogPostORM.publicado == True)  # noqa: E712
        .order_by(BlogPostORM.data_publicacao.desc(), BlogPostORM.id.desc())
    )
    rows = result.scalars().all()
    data = [BlogPostOut.model_validate(r) for r in rows]
    cache_set(NS, "all", data)
    return data


# ── GET /blog/{slug} ──────────────────────────────────────────────────────────

@router.get("/{slug}", response_model=BlogPostOut)
async def detalhe_post(slug: str, db: AsyncSession = Depends(get_db)) -> BlogPostOut:
    chave = f"slug:{slug}"
    cached = cache_get(NS, chave)
    if cached is not None:
        return cached

    result = await db.execute(
        select(BlogPostORM).where(
            BlogPostORM.slug == slug,
            BlogPostORM.publicado == True,  # noqa: E712
        )
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Post não encontrado.")

    data = BlogPostOut.model_validate(row)
    cache_set(NS, chave, data)
    return data


# ── POST /blog ────────────────────────────────────────────────────────────────

@router.post("", response_model=BlogPostOut, status_code=201)
async def criar_post(
    dados: BlogPostInput, db: AsyncSession = Depends(get_db)
) -> BlogPostOut:
    # Slug deve ser único
    existente = await db.execute(
        select(BlogPostORM).where(BlogPostORM.slug == dados.slug)
    )
    if existente.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail=f"Já existe um post com o slug '{dados.slug}'.",
        )

    novo = BlogPostORM(**dados.model_dump())
    db.add(novo)
    await db.commit()
    await db.refresh(novo)
    cache_invalidate(NS)
    logger.info("Post criado: id=%s slug=%s", novo.id, novo.slug)
    return BlogPostOut.model_validate(novo)


# ── PUT /blog/{id} ────────────────────────────────────────────────────────────

@router.put("/{post_id}", response_model=BlogPostOut)
async def atualizar_post(
    post_id: int, dados: BlogPostInput, db: AsyncSession = Depends(get_db)
) -> BlogPostOut:
    result = await db.execute(select(BlogPostORM).where(BlogPostORM.id == post_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Post não encontrado.")

    # Verifica conflito de slug com outro post
    conflito = await db.execute(
        select(BlogPostORM).where(
            BlogPostORM.slug == dados.slug,
            BlogPostORM.id != post_id,
        )
    )
    if conflito.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail=f"Slug '{dados.slug}' já está em uso por outro post.",
        )

    for campo, valor in dados.model_dump().items():
        setattr(row, campo, valor)

    await db.commit()
    await db.refresh(row)
    cache_invalidate(NS)
    logger.info("Post atualizado: id=%s slug=%s", post_id, row.slug)
    return BlogPostOut.model_validate(row)


# ── DELETE /blog/{id} ─────────────────────────────────────────────────────────

@router.delete("/{post_id}", response_model=MensagemOut)
async def deletar_post(
    post_id: int, db: AsyncSession = Depends(get_db)
) -> MensagemOut:
    result = await db.execute(select(BlogPostORM).where(BlogPostORM.id == post_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Post não encontrado.")

    await db.delete(row)
    await db.commit()
    cache_invalidate(NS)
    logger.info("Post deletado: id=%s", post_id)
    return MensagemOut(ok=True, mensagem=f"Post {post_id} removido.")