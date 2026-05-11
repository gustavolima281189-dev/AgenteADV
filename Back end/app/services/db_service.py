from __future__ import annotations

import logging
from typing import Any, Optional

from supabase import Client, create_client

from app.config import settings
from app.models.schemas import DocumentoJuridico

logger = logging.getLogger(__name__)

_client: Client = create_client(settings.supabase_url, settings.supabase_key)


def get_user_id(token: str) -> Optional[str]:
    try:
        response = _client.auth.get_user(token)
        return str(response.user.id) if response.user else None
    except Exception:
        logger.warning("Failed to get user from token")
        return None


async def insert_document(documento: DocumentoJuridico) -> dict[str, Any]:
    payload = documento.model_dump(mode="json")
    result = (
        _client.table(settings.supabase_table)
        .insert(payload)
        .execute()
    )
    if result.data:
        return result.data[0]
    logger.warning("Supabase insert returned no data. Payload: %s", payload)
    return payload
