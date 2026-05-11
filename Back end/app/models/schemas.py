from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, field_validator


class CategoriaArea(str, Enum):
    CIVEL = "Cível"
    TRABALHISTA = "Trabalhista"
    TRIBUTARIO = "Tributário"
    CRIMINAL = "Criminal"
    CONTRATUAL = "Contratual"
    ADMINISTRATIVO = "Administrativo"
    OUTROS = "Outros"


class StatusLeitura(str, Enum):
    SUCESSO = "Sucesso"
    FALHA = "Falha"


class DocumentoJuridico(BaseModel):
    tipo: str
    categoria_area: CategoriaArea
    numero_processo_ou_id: Optional[str] = None
    data_identificada: Optional[str] = None
    polo_ativo_ou_contratante: List[str]
    polo_passivo_ou_contratado: List[str]
    sintese: str
    status_leitura: StatusLeitura
    user_id: Optional[str] = None

    @field_validator("data_identificada", mode="before")
    @classmethod
    def normalize_date(cls, v: Optional[str]) -> Optional[str]:
        if not v or str(v).lower() in ("null", "none", ""):
            return None
        return v

    @field_validator("numero_processo_ou_id", mode="before")
    @classmethod
    def normalize_id(cls, v: Optional[str]) -> Optional[str]:
        if not v or str(v).lower() in ("null", "none", ""):
            return None
        return v


class DocumentoResponse(DocumentoJuridico):
    id: Optional[str] = None
