from __future__ import annotations

import json
import logging
from typing import Any

from openai import AsyncOpenAI
from pydantic import ValidationError

from app.config import settings
from app.models.schemas import DocumentoJuridico, StatusLeitura

logger = logging.getLogger(__name__)

_client = AsyncOpenAI(
    api_key=settings.openai_api_key,
    base_url="https://api.groq.com/openai/v1",
)

_SYSTEM_PROMPT = (
    "Você é um sistema de triagem jurídica. Analise o texto e retorne APENAS um JSON válido. "
    "Extraia: 'tipo' (String), 'categoria_area' (Cível, Trabalhista, Tributário, Criminal, "
    "Contratual, Administrativo, Outros), 'numero_processo_ou_id' (String ou null), "
    "'data_identificada' (YYYY-MM-DD ou null), 'polo_ativo_ou_contratante' (Array de Strings), "
    "'polo_passivo_ou_contratado' (Array de Strings), 'sintese' (Resumo técnico de até 3 linhas) "
    "e 'status_leitura' (Sucesso ou Falha)."
)


async def extract_structured_data(text: str) -> DocumentoJuridico:
    raw = await _call_llm(text)
    return _parse_and_validate(raw)


async def _call_llm(text: str) -> str:
    response = await _client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": f"Texto extraído do documento:\n\n{text[:12000]}"},
        ],
        response_format={"type": "json_object"},
        temperature=0,
        max_tokens=1024,
    )
    return response.choices[0].message.content or "{}"


def _parse_and_validate(raw_json: str) -> DocumentoJuridico:
    try:
        data: dict[str, Any] = json.loads(raw_json)
        return DocumentoJuridico.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.warning("LLM output failed validation: %s | raw=%s", exc, raw_json[:500])
        return _fallback_document(str(exc))


def _fallback_document(reason: str) -> DocumentoJuridico:
    return DocumentoJuridico(
        tipo="Indeterminado",
        categoria_area="Outros",
        numero_processo_ou_id=None,
        data_identificada=None,
        polo_ativo_ou_contratante=[],
        polo_passivo_ou_contratado=[],
        sintese=f"Extração automática falhou: {reason[:200]}",
        status_leitura=StatusLeitura.FALHA,
    )
