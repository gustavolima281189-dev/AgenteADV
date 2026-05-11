'use client'

import { useEffect } from 'react'
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
  documento: DocumentoJuridico | null
  onClose: () => void
}

export default function DocumentModal({ documento, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!documento) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Detalhes do Documento</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {documento.criado_em
                ? new Date(documento.criado_em).toLocaleString('pt-BR')
                : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              documento.status_leitura === 'Sucesso'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}>
              {documento.status_leitura}
            </span>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              CATEGORIA_COLORS[documento.categoria_area] ?? 'bg-gray-100 text-gray-600'
            }`}>
              {documento.categoria_area}
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Tipo de Documento</p>
            <p className="text-sm font-semibold text-gray-900">{documento.tipo}</p>
          </div>

          {documento.numero_processo_ou_id && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Número do Processo</p>
              <p className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                {documento.numero_processo_ou_id}
              </p>
            </div>
          )}

          {documento.data_identificada && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Data Identificada</p>
              <p className="text-sm text-gray-700">
                {new Date(documento.data_identificada).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Polo Ativo / Contratante</p>
              <div className="space-y-1.5">
                {documento.polo_ativo_ou_contratante.length > 0
                  ? documento.polo_ativo_ou_contratante.map((p, i) => (
                      <p key={i} className="text-sm text-gray-700 bg-blue-50 rounded-lg px-3 py-2">{p}</p>
                    ))
                  : <p className="text-sm text-gray-400 italic">Não identificado</p>
                }
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Polo Passivo / Contratado</p>
              <div className="space-y-1.5">
                {documento.polo_passivo_ou_contratado.length > 0
                  ? documento.polo_passivo_ou_contratado.map((p, i) => (
                      <p key={i} className="text-sm text-gray-700 bg-orange-50 rounded-lg px-3 py-2">{p}</p>
                    ))
                  : <p className="text-sm text-gray-400 italic">Não identificado</p>
                }
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Síntese</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
              {documento.sintese}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
