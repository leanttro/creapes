"""
app/models/schemas.py
Modelos Pydantic exclusivamente — validação de entrada e serialização de saída.
Sem ORM, sem engine, sem SessionLocal, sem create_all.
  - ORM (tabelas SQLAlchemy) → app/models/orm.py
  - Conexão com o banco      → app/database.py
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, field_validator


# ── Autenticação ──────────────────────────────────────────────────────────────

class LoginInput(BaseModel):
    email: str
    senha: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


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


# ── Categorias ────────────────────────────────────────────────────────────────

class CategoriaInput(BaseModel):
    nome: str

    @field_validator("nome")
    @classmethod
    def nome_nao_vazio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Nome não pode ser vazio")
        return v.strip()


class CategoriaOut(BaseModel):
    id: int
    nome: str

    model_config = {"from_attributes": True}


# ── Cases ─────────────────────────────────────────────────────────────────────

class CaseInput(BaseModel):
    nome: str
    descricao: Optional[str] = None
    resumo: Optional[str] = None
    categoria_id: Optional[int] = None
    link_projeto: Optional[str] = None
    imagem: Optional[str] = None
    depoimento: Optional[str] = None
    ficha_tecnica: Optional[str] = None
    diretor: Optional[str] = None
    dop: Optional[str] = None
    ano: Optional[str] = None
    sort: int = 0

    @field_validator("categoria_id", mode="before")
    @classmethod
    def categoria_id_vazio_para_none(cls, v):
        if v == "" or v is None:
            return None
        return v


class CaseOut(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]
    resumo: Optional[str]
    categoria_id: Optional[int]
    categoria_nome: Optional[str] = None
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
    data_publicacao: Optional[datetime] = None
    publicado: bool = True

    @field_validator("data_publicacao", mode="before")
    @classmethod
    def parse_data(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, datetime):
            return v
        return datetime.fromisoformat(str(v))


class BlogPostOut(BaseModel):
    id: int
    titulo: str
    slug: str
    resumo: Optional[str]
    conteudo: Optional[str]
    imagem_capa: Optional[str]
    data_publicacao: Optional[datetime]
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
    data: str
    hora: str
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
    logos_clientes: Optional[str] = None
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
