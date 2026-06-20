import logging
import os

from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.orm import Lead as LeadORM
from app.models.schemas import ContatoInput, MensagemOut
from app.services.email import enviar_email, montar_corpo_contato

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/contato", tags=["Contato"])


@router.post("", response_model=MensagemOut)
@limiter.limit("5/minute")
async def enviar_contato(
    request: Request,
    dados: ContatoInput,
    db: AsyncSession = Depends(get_db),
) -> MensagemOut:
    """
    1. Persiste o lead no banco.
    2. Envia e-mail de notificação para EMAIL_DESTINO.
    3. Retorna confirmação ao front-end.
    """

    # 1 — Salvar lead
    lead = LeadORM(
        nome=dados.nome,
        email=dados.email,
        whatsapp=dados.whatsapp,
        mensagem=dados.mensagem,
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    logger.info("Novo lead salvo: id=%s nome=%s", lead.id, lead.nome)

    # 2 — Enviar e-mail (operação síncrona isolada — smtplib não é async)
    destino = os.getenv("EMAIL_DESTINO", os.getenv("SMTP_USER", ""))
    if destino:
        texto, html = montar_corpo_contato(
            nome=dados.nome,
            email=dados.email,
            whatsapp=dados.whatsapp,
            mensagem=dados.mensagem,
        )
        enviado = enviar_email(
            destinatario=destino,
            assunto=f"[Creapes] Nova mensagem de {dados.nome}",
            corpo=texto,
            corpo_html=html,
        )
        if not enviado:
            logger.warning("Lead %s salvo, mas e-mail não pôde ser enviado.", lead.id)
    else:
        logger.warning("EMAIL_DESTINO não configurado — e-mail não enviado.")

    return MensagemOut(
        ok=True,
        mensagem="Mensagem recebida! Entraremos em contato em breve.",
    )