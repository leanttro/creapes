"""
app/services/security.py
Funções centrais de segurança: hash de senha (bcrypt) e JWT.
SECRET_KEY e JWT_EXPIRE_HOURS vêm do .env.
"""

import os
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

# ── Configuração ──────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    raise RuntimeError(
        "Variável de ambiente SECRET_KEY não definida. "
        "Adicione SECRET_KEY=<string-aleatória-longa> no seu .env"
    )

ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "12"))

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Senha ─────────────────────────────────────────────────────────────────────

def hash_senha(senha: str) -> str:
    """Retorna o hash bcrypt da senha em texto puro."""
    return _pwd_ctx.hash(senha)


def verificar_senha(senha: str, senha_hash: str) -> bool:
    """Compara senha em texto puro com o hash armazenado."""
    return _pwd_ctx.verify(senha, senha_hash)


# ── JWT ───────────────────────────────────────────────────────────────────────

def criar_token(email: str) -> str:
    """Cria um JWT com o email do admin como subject."""
    expiracao = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {"sub": email, "exp": expiracao}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token(token: str) -> str:
    """
    Decodifica e valida o JWT.
    Levanta jwt.ExpiredSignatureError ou jwt.PyJWTError em caso de falha.
    Retorna o email (subject) se válido.
    """
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email: str = payload.get("sub", "")
    if not email:
        raise jwt.PyJWTError("Token sem subject.")
    return email
