from __future__ import annotations

import logging
from typing import Any

from supabase import Client, create_client

from app.config import settings
from app.models.schemas import DocumentoJuridico

logger = logging.getLogger(__name__)

_client: Client = create_client(settings.supabase_url, settings.supabase_key)


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
