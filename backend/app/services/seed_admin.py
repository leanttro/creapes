"""
app/services/seed_admin.py
Cria o usuário admin no banco na primeira vez que o backend sobe,
lendo ADMIN_EMAIL e ADMIN_SENHA do .env.
Se o admin já existir, não faz nada (idempotente — seguro em todo restart).
"""

import logging
import os

from sqlalchemy import select, text

from app.database import AsyncSessionLocal
from app.models.orm import AdminUser
from app.services.security import hash_senha

logger = logging.getLogger(__name__)


async def seed_admin_from_env() -> None:
    """
    Chamado no lifespan do FastAPI (startup).
    Garante que a tabela admin_users existe e que há pelo menos um admin cadastrado.
    """
    email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    senha = os.getenv("ADMIN_SENHA", "").strip()

    if not email or not senha:
        logger.warning(
            "ADMIN_EMAIL ou ADMIN_SENHA não definidos no .env — "
            "nenhum admin será criado automaticamente."
        )
        return

    async with AsyncSessionLocal() as db:
        # Garante que a tabela existe (cria se não existir, sem afetar outras tabelas)
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS admin_users (
                id         SERIAL PRIMARY KEY,
                email      VARCHAR(255) NOT NULL UNIQUE,
                senha_hash VARCHAR(255) NOT NULL
            )
        """))
        await db.commit()

        # Verifica se já existe
        result = await db.execute(
            select(AdminUser).where(AdminUser.email == email)
        )
        existente = result.scalar_one_or_none()

        if existente:
            logger.info("Admin já cadastrado: %s — nenhuma ação necessária.", email)
            return

        # Cria o admin
        novo = AdminUser(email=email, senha_hash=hash_senha(senha))
        db.add(novo)
        await db.commit()
        logger.info("✅  Admin criado com sucesso: %s", email)
