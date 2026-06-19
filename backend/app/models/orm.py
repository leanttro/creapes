from sqlalchemy import Boolean, Column, Integer, String, Text, Date, Time, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Categoria(Base):
    __tablename__ = "categorias"
    id   = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)


class Case(Base):
    __tablename__ = "cases"
    id               = Column(Integer, primary_key=True, index=True)
    nome             = Column(String(200), nullable=False)
    descricao        = Column(Text)
    categoria_id     = Column(Integer)
    link_projeto     = Column(String(500))
    imagem           = Column(String(500))
    depoimento       = Column(Text)
    ficha_tecnica    = Column(Text)
    diretor          = Column(String(200))
    dop              = Column(String(200))
    whatsapp_projeto = Column(String(50))
    estoque          = Column(Integer, default=1)
    resumo           = Column(Text)
    sort             = Column(Integer, default=0)
    ano              = Column(String(10))


class Servico(Base):
    __tablename__ = "servicos"
    id     = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    resumo = Column(Text)


class BlogPost(Base):
    __tablename__ = "blog_posts"
    id              = Column(Integer, primary_key=True, index=True)
    titulo          = Column(String(300), nullable=False)
    slug            = Column(String(300), unique=True, nullable=False)
    resumo          = Column(Text)
    conteudo        = Column(Text)
    imagem_capa     = Column(String(500))
    publicado       = Column(Boolean, default=True)
    data_publicacao = Column(DateTime, server_default=func.now())


class Lead(Base):
    __tablename__ = "leads"
    id        = Column(Integer, primary_key=True, index=True)
    nome      = Column(String(200))
    email     = Column(String(200))
    whatsapp  = Column(String(50))
    mensagem  = Column(Text)
    criado_em = Column(DateTime, server_default=func.now())


class Horario(Base):
    __tablename__ = "agenda"
    id        = Column(Integer, primary_key=True, index=True)
    titulo    = Column(String(200), nullable=False)
    data      = Column(Date)
    hora      = Column(Time)
    descricao = Column(Text)


class Config(Base):
    __tablename__ = "config"
    id                 = Column(Integer, primary_key=True, index=True)
    sobre_titulo       = Column(String(300))
    sobre_texto        = Column(Text)
    logos_clientes     = Column(Text)
    whatsapp_comercial = Column(String(50))
    instagram_url      = Column(String(300))


class AdminUser(Base):
    __tablename__ = "admin_users"
    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String(255), nullable=False, unique=True)
    senha_hash = Column(String(255), nullable=False)
