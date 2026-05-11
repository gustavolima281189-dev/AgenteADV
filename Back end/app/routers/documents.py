from __future__ import annotations

import logging

from typing import Optional

from fastapi import APIRouter, File, Header, HTTPException, UploadFile, status

from app.config import settings
from app.models.schemas import DocumentoResponse
from app.services import db_service, llm_service, ocr_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Triagem Jurídica"])

_ALLOWED_CONTENT_TYPES = {"application/pdf", "application/octet-stream"}
_MAX_BYTES = settings.max_pdf_size_mb * 1024 * 1024


@router.post(
    "/upload",
    response_model=DocumentoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Recebe PDF jurídico e retorna dados estruturados",
)
async def upload_document(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
) -> DocumentoResponse:
    if file.content_type not in _ALLOWED_CONTENT_TYPES and not (
        file.filename or ""
    ).lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Apenas arquivos PDF são aceitos.",
        )

    pdf_bytes = await file.read()

    if len(pdf_bytes) > _MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Arquivo excede o limite de {settings.max_pdf_size_mb} MB.",
        )

    try:
        text = ocr_service.pdf_to_text(pdf_bytes)
    except Exception as exc:
        logger.exception("OCR pipeline failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha no processamento de OCR: {exc}",
        ) from exc

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Não foi possível extrair texto legível do PDF.",
        )

    user_id: Optional[str] = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        user_id = db_service.get_user_id(token)

    try:
        documento = await llm_service.extract_structured_data(text)
    except Exception as exc:
        logger.exception("LLM extraction failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Falha na extração de dados via LLM: {exc}",
        ) from exc

    documento.user_id = user_id

    try:
        saved = await db_service.insert_document(documento)
    except Exception as exc:
        logger.exception("Database insert failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Falha ao persistir no banco de dados: {exc}",
        ) from exc

    return DocumentoResponse(**documento.model_dump(), id=saved.get("id"))
