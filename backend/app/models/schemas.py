"""
app/models/schemas.py
Modelos Pydantic exclusivamente — validação de entrada e serialização de saída.
Sem ORM, sem engine, sem SessionLocal, sem create_all.
  - ORM (tabelas SQLAlchemy) → app/models/orm.py
  - Conexão com o banco      → app/database.py
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


# ── Contato ───────────────────────────────────────────────────────────────────

class ContatoInput(BaseModel):
    nome: str
    email: str
    whatsapp: Optional[str] = None
    mensagem: str

    @field_validator("nome")
    @classmethod
    def nome_nao_vazio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Nome não pode ser vazio")
        return v.strip()

    @field_validator("mensagem")
    @classmethod
    def mensagem_nao_vazia(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Mensagem não pode ser vazia")
        return v.strip()


# ── Cases ─────────────────────────────────────────────────────────────────────

class CaseInput(BaseModel):
    nome: str
    descricao: Optional[str] = None
    resumo: Optional[str] = None
    categoria: Optional[str] = None
    link_projeto: Optional[str] = None
    imagem: Optional[str] = None
    depoimento: Optional[str] = None
    ficha_tecnica: Optional[str] = None
    diretor: Optional[str] = None
    dop: Optional[str] = None
    ano: Optional[str] = None
    sort: int = 0


class CaseOut(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]
    resumo: Optional[str]
    categoria: Optional[str]
    link_projeto: Optional[str]
    imagem: Optional[str]
    depoimento: Optional[str]
    ficha_tecnica: Optional[str]
    diretor: Optional[str]
    dop: Optional[str]
    ano: Optional[str]
    sort: int

    model_config = {"from_attributes": True}


# ── Serviços ──────────────────────────────────────────────────────────────────

class ServicoInput(BaseModel):
    titulo: str
    resumo: Optional[str] = None
    icone: Optional[str] = None
    sort: int = 0


class ServicoOut(BaseModel):
    id: int
    titulo: str
    resumo: Optional[str]
    icone: Optional[str]
    sort: int

    model_config = {"from_attributes": True}


# ── Blog ──────────────────────────────────────────────────────────────────────

class BlogPostInput(BaseModel):
    titulo: str
    slug: str
    resumo: Optional[str] = None
    conteudo: Optional[str] = None
    imagem_capa: Optional[str] = None
    data_publicacao: Optional[str] = None   # ISO date: "2024-06-01"
    publicado: bool = True


class BlogPostOut(BaseModel):
    id: int
    titulo: str
    slug: str
    resumo: Optional[str]
    conteudo: Optional[str]
    imagem_capa: Optional[str]
    data_publicacao: Optional[str]
    publicado: bool

    model_config = {"from_attributes": True}


# ── Leads ─────────────────────────────────────────────────────────────────────

class LeadOut(BaseModel):
    id: int
    nome: str
    email: Optional[str]
    whatsapp: Optional[str]
    mensagem: Optional[str]
    criado_em: datetime

    model_config = {"from_attributes": True}


# ── Agenda / Horários ─────────────────────────────────────────────────────────

class HorarioSchema(BaseModel):
    titulo: str
    data: str           # ISO date: "2024-07-10"
    hora: str           # "14:00"
    descricao: Optional[str] = None


class HorarioOut(HorarioSchema):
    id: int
    disponivel: bool
    cliente_nome: Optional[str]

    model_config = {"from_attributes": True}


# ── Configurações do site ─────────────────────────────────────────────────────

class ConfigSchema(BaseModel):
    sobre_titulo: Optional[str] = None
    sobre_texto: Optional[str] = None
    logos_clientes: Optional[str] = None    # URLs separadas por vírgula
    whatsapp_comercial: Optional[str] = None
    instagram_url: Optional[str] = None


class ConfigOut(ConfigSchema):
    id: int

    model_config = {"from_attributes": True}


# ── Upload ────────────────────────────────────────────────────────────────────

class UploadOut(BaseModel):
    url: str
    filename: str


# ── Resposta genérica ─────────────────────────────────────────────────────────

class MensagemOut(BaseModel):
    ok: bool
    mensagem: str