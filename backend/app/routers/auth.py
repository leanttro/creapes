"""
app/routers/auth.py
POST /auth/login — valida email + senha do admin e retorna um JWT.
GET  /auth/me     — retorna o email do admin autenticado (útil pro frontend
                     confirmar que o token ainda é válido ao carregar /painel).
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import exigir_admin
from app.models.orm import AdminUser
from app.models.schemas import LoginInput, LoginOut
from app.services.security import criar_token, verificar_senha

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Autenticação"])

limiter = Limiter(key_func=get_remote_address)

# Mensagem genérica de propósito: não revela se foi o e-mail ou a senha que errou.
ERRO_CREDENCIAIS = "E-mail ou senha inválidos."


@router.post("/login", response_model=LoginOut)
@limiter.limit("5/minute")
async def login(
    request: Request,
    dados: LoginInput,
    db: AsyncSession = Depends(get_db),
) -> LoginOut:
    email_normalizado = dados.email.strip().lower()

    result = await db.execute(
        select(AdminUser).where(AdminUser.email == email_normalizado)
    )
    admin = result.scalar_one_or_none()

    if not admin or not verificar_senha(dados.senha, admin.senha_hash):
        logger.warning("Tentativa de login falhou para email=%s", email_normalizado)
        raise HTTPException(status_code=401, detail=ERRO_CREDENCIAIS)

    token = criar_token(admin.email)
    logger.info("Login bem-sucedido: %s", admin.email)
    return LoginOut(access_token=token, email=admin.email)


@router.get("/me")
async def me(email: str = Depends(exigir_admin)):
    return {"email": email}
