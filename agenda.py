"""
app/services/cache.py
Cache em memória com TTL usando cachetools.TTLCache.
Usado nos endpoints de leitura (GET /cases, GET /blog) para evitar
queries repetidas ao banco em intervalos curtos.
"""

import functools
import logging
from typing import Any, Callable

from cachetools import TTLCache

logger = logging.getLogger(__name__)

# ── Instâncias de cache por recurso ──────────────────────────────────────────
# maxsize = número máximo de entradas; ttl = segundos de vida de cada entrada

_cache_cases    = TTLCache(maxsize=128, ttl=60)   # 1 minuto
_cache_blog     = TTLCache(maxsize=256, ttl=120)  # 2 minutos
_cache_servicos = TTLCache(maxsize=64,  ttl=120)

_CACHES: dict[str, TTLCache] = {
    "cases":    _cache_cases,
    "blog":     _cache_blog,
    "servicos": _cache_servicos,
}


# ── API pública ───────────────────────────────────────────────────────────────

def cache_get(namespace: str, key: str) -> Any | None:
    """Retorna o valor em cache ou None se ausente/expirado."""
    store = _CACHES.get(namespace)
    if store is None:
        return None
    return store.get(key)


def cache_set(namespace: str, key: str, value: Any) -> None:
    """Armazena um valor no cache do namespace."""
    store = _CACHES.get(namespace)
    if store is not None:
        store[key] = value


def cache_invalidate(namespace: str, key: str | None = None) -> None:
    """
    Invalida uma chave específica ou todo o namespace.
    Chamado nas operações de escrita (POST/PUT/DELETE) para manter
    os dados de leitura sempre frescos.
    """
    store = _CACHES.get(namespace)
    if store is None:
        return
    if key is None:
        store.clear()
        logger.debug("Cache '%s' limpo completamente.", namespace)
    else:
        store.pop(key, None)
        logger.debug("Cache '%s' invalidado para chave '%s'.", namespace, key)


def invalidate_all() -> None:
    """Limpa todos os caches (útil em deploys/migrações)."""
    for store in _CACHES.values():
        store.clear()
    logger.info("Todos os caches foram limpos.")
