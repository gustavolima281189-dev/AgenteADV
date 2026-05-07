-- Execute no SQL Editor do Supabase Dashboard

create table if not exists documentos_juridicos (
    id              uuid primary key default gen_random_uuid(),
    tipo            text not null,
    categoria_area  text not null,
    numero_processo_ou_id text,
    data_identificada     date,
    polo_ativo_ou_contratante  text[] not null default '{}',
    polo_passivo_ou_contratado text[] not null default '{}',
    sintese         text not null,
    status_leitura  text not null check (status_leitura in ('Sucesso', 'Falha')),
    criado_em       timestamptz not null default now()
);

-- Índices para buscas frequentes
create index if not exists idx_documentos_categoria  on documentos_juridicos (categoria_area);
create index if not exists idx_documentos_status     on documentos_juridicos (status_leitura);
create index if not exists idx_documentos_criado_em  on documentos_juridicos (criado_em desc);

-- Row Level Security (RLS) — habilite conforme sua política de acesso
alter table documentos_juridicos enable row level security;
