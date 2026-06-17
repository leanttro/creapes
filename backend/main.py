"""
main.py
Ponto de entrada da aplicação FastAPI da Creapes.
Registra todos os routers, configura CORS e rate limiting.
As tabelas já existem no PostgreSQL — não há create_all aqui.
"""

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

load_dotenv()

from app.routers import blog, cases, contato, leads, servicos, upload, agenda, config

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀  Creapes Backend iniciando…")
    uploads_dir = Path(__file__).parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    logger.info("✅  Diretório de uploads verificado.")
    yield
    logger.info("🛑  Creapes Backend encerrando.")


app = FastAPI(
    title="Creapes API",
    description="Backend da produtora audiovisual Creapes.",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:4173",
)
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("CORS permitido para: %s", allowed_origins)

API_PREFIX = "/api"

app.include_router(cases.router,    prefix=API_PREFIX)
app.include_router(servicos.router, prefix=API_PREFIX)
app.include_router(blog.router,     prefix=API_PREFIX)
app.include_router(leads.router,    prefix=API_PREFIX)
app.include_router(contato.router,  prefix=API_PREFIX)
app.include_router(upload.router,   prefix=API_PREFIX)
app.include_router(agenda.router,   prefix=API_PREFIX)
app.include_router(config.router,   prefix=API_PREFIX)

uploads_path = Path(__file__).parent / "uploads"
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")


@app.get("/health", tags=["Status"])
def health():
    return {"status": "ok", "service": "creapes-api"}


@app.get("/", tags=["Status"])
def root():
    return {
        "api": "Creapes API",
        "version": "1.0.0",
        "docs": "/docs",
    }