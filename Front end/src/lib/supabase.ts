import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface DocumentoJuridico {
  id: string
  tipo: string
  categoria_area: string
  numero_processo_ou_id: string | null
  data_identificada: string | null
  polo_ativo_ou_contratante: string[]
  polo_passivo_ou_contratado: string[]
  sintese: string
  status_leitura: 'Sucesso' | 'Falha'
  criado_em: string
}
