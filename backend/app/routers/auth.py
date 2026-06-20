"""
app/routers/auth.py
POST /auth/login — valida email + senha do admin e retorna um JWT.
GET  /auth/me     — retorna o email do admin autenticado (útil pro frontend
                     confirmar que o token ainda é válido ao carregar /painel).
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import jwt

from app.database import get_db
from app.models.orm import AdminUser
from app.models.schemas import LoginInput, TokenOut
from app.services.security import criar_token, verificar_senha, decodificar_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Autenticação"])

limiter = Limiter(key_func=get_remote_address)

_bearer = HTTPBearer(auto_error=False)

ERRO_CREDENCIAIS = "E-mail ou senha inválidos."


# ── Dependency reutilizável em todos os routers ───────────────────────────────

async def exigir_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """
    Extrai e valida o JWT do header Authorization: Bearer <token>.
    Retorna o email do admin se válido, levanta 401 caso contrário.
    Importe esta função nos outros routers:
        from app.routers.auth import exigir_admin
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Token não fornecido.")
    try:
        email = decodificar_token(credentials.credentials)
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido.")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenOut)
@limiter.limit("5/minute")
async def login(
    request: Request,
    dados: LoginInput,
    db: AsyncSession = Depends(get_db),
) -> TokenOut:
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
    return TokenOut(access_token=token)


@router.get("/me")
async def me(email: str = Depends(exigir_admin)):
    return {"email": email}
