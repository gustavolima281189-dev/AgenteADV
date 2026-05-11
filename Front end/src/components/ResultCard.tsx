import { DocumentoJuridico } from '@/lib/supabase'

const CATEGORIA_COLORS: Record<string, string> = {
  'Cível': 'bg-blue-100 text-blue-700',
  'Trabalhista': 'bg-orange-100 text-orange-700',
  'Tributário': 'bg-yellow-100 text-yellow-700',
  'Criminal': 'bg-red-100 text-red-700',
  'Contratual': 'bg-purple-100 text-purple-700',
  'Administrativo': 'bg-cyan-100 text-cyan-700',
  'Outros': 'bg-gray-100 text-gray-600',
}

interface Props {
  documento: DocumentoJuridico
}

export default function ResultCard({ documento }: Props) {
  const isSuccess = documento.status_leitura === 'Sucesso'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Resultado</h2>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {documento.status_leitura}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Tipo</p>
          <p className="text-sm font-medium text-gray-900">{documento.tipo}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Área</p>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORIA_COLORS[documento.categoria_area] ?? 'bg-gray-100 text-gray-600'}`}>
              {documento.categoria_area}
            </span>
          </div>
          {documento.data_identificada && (
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Data</p>
              <p className="text-sm text-gray-700">{new Date(documento.data_identificada).toLocaleDateString('pt-BR')}</p>
            </div>
          )}
          {documento.numero_processo_ou_id && (
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Processo</p>
              <p className="text-sm text-gray-700 font-mono">{documento.numero_processo_ou_id}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Polo Ativo / Contratante</p>
            <div className="space-y-1">
              {documento.polo_ativo_ou_contratante.length > 0
                ? documento.polo_ativo_ou_contratante.map((p, i) => (
                    <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-2.5 py-1.5">{p}</p>
                  ))
                : <p className="text-sm text-gray-400 italic">Não identificado</p>
              }
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Polo Passivo / Contratado</p>
            <div className="space-y-1">
              {documento.polo_passivo_ou_contratado.length > 0
                ? documento.polo_passivo_ou_contratado.map((p, i) => (
                    <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-2.5 py-1.5">{p}</p>
                  ))
                : <p className="text-sm text-gray-400 italic">Não identificado</p>
              }
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Síntese</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed">{documento.sintese}</p>
        </div>
      </div>
    </div>
  )
}
