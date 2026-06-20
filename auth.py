"""
app/services/email.py
Serviço de envio de e-mail via SMTP.
Variáveis lidas do .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD.
"""

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


def enviar_email(
    destinatario: str,
    assunto: str,
    corpo: str,
    corpo_html: str | None = None,
) -> bool:
    """
    Envia um e-mail via SMTP.

    Retorna True se enviado com sucesso, False caso contrário.
    Nunca lança exceção — apenas loga o erro, para não derrubar
    o endpoint /contato caso o SMTP esteja indisponível.
    """
    host     = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port     = int(os.getenv("SMTP_PORT", "587"))
    user     = os.getenv("SMTP_USER", "")
    password = os.getenv("SMTP_PASSWORD", "")

    if not user or not password:
        logger.warning(
            "SMTP_USER ou SMTP_PASSWORD não configurados — e-mail não enviado."
        )
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = assunto
    msg["From"]    = user
    msg["To"]      = destinatario

    # Parte texto simples (fallback)
    msg.attach(MIMEText(corpo, "plain", "utf-8"))

    # Parte HTML (opcional)
    if corpo_html:
        msg.attach(MIMEText(corpo_html, "html", "utf-8"))

    try:
        with smtplib.SMTP(host, port, timeout=10) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(user, password)
            smtp.sendmail(user, destinatario, msg.as_string())
        logger.info("E-mail enviado para %s | assunto: %s", destinatario, assunto)
        return True
    except smtplib.SMTPAuthenticationError:
        logger.error("Falha de autenticação SMTP — verifique SMTP_USER e SMTP_PASSWORD")
    except smtplib.SMTPConnectError:
        logger.error("Não foi possível conectar ao servidor SMTP %s:%s", host, port)
    except Exception as exc:  # noqa: BLE001
        logger.error("Erro inesperado ao enviar e-mail: %s", exc)

    return False


def montar_corpo_contato(nome: str, email: str, whatsapp: str | None, mensagem: str) -> tuple[str, str]:
    """Retorna (corpo_texto, corpo_html) para e-mails de contato do site."""

    texto = (
        f"Nova mensagem de contato via site — Creapes\n"
        f"{'='*50}\n"
        f"Nome:      {nome}\n"
        f"E-mail:    {email}\n"
        f"WhatsApp:  {whatsapp or '—'}\n"
        f"{'='*50}\n\n"
        f"{mensagem}\n"
    )

    html = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;background:#0b0d0f;color:#f0f0f0;padding:32px;">
      <div style="max-width:560px;margin:0 auto;background:#111416;border-radius:8px;
                  border:1px solid rgba(255,255,255,.08);overflow:hidden;">
        <div style="background:#d0ff00;padding:20px 32px;">
          <h2 style="margin:0;color:#000;font-size:18px;letter-spacing:-0.02em;">
            Nova mensagem de contato
          </h2>
          <p style="margin:4px 0 0;color:rgba(0,0,0,.6);font-size:13px;">Creapes — Site</p>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;font-size:12px;text-transform:uppercase;
                         letter-spacing:.1em;color:rgba(240,240,240,.4);width:90px;">Nome</td>
              <td style="padding:10px 0;font-size:15px;color:#f0f0f0;">{nome}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,.06);">
              <td style="padding:10px 0;font-size:12px;text-transform:uppercase;
                         letter-spacing:.1em;color:rgba(240,240,240,.4);">E-mail</td>
              <td style="padding:10px 0;font-size:15px;color:#d0ff00;">{email}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,.06);">
              <td style="padding:10px 0;font-size:12px;text-transform:uppercase;
                         letter-spacing:.1em;color:rgba(240,240,240,.4);">WhatsApp</td>
              <td style="padding:10px 0;font-size:15px;color:#f0f0f0;">{whatsapp or '—'}</td>
            </tr>
          </table>
          <div style="margin-top:24px;padding:20px;background:rgba(255,255,255,.03);
                      border-radius:6px;border-left:2px solid #d0ff00;">
            <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(240,240,240,.75);">
              {mensagem.replace(chr(10), '<br>')}
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
    """

    return texto, html
